/**
 * Бот заявок @derevenko_media_bot — скрипт Google Apps Script.
 *
 * 1. Посредник для Telegram: из облака в России api.telegram.org заблокирован, а серверы Google — нет.
 *    Функция заявок (cloud/lead) шлёт сюда {secret, text, reply_markup}, скрипт пересылает сообщение в Telegram
 *    и ведёт статистику заявок (без персональных данных: только тип, направление и источник).
 * 2. Контроль сайтов: каждые 5 минут проверяет сайты из SITES; если сайт не открывается две проверки подряд —
 *    пишет в Telegram, когда заработает — пишет снова.
 * 3. Отчёты: каждое утро в 9:00 МСК — сводка за вчера, по понедельникам — итог прошлой недели.
 *
 * Свойства скрипта (⚙ «Настройки проекта» → «Свойства скрипта»):
 *   TOKEN          — токен бота от @BotFather
 *   CHAT_ID        — id чата, куда слать сообщения
 *   SECRET         — тот же пароль, что TG_RELAY_SECRET в функции заявок
 *   METRIKA_TOKEN  — (необязательно) OAuth-токен Яндекс Метрики: тогда в отчётах будут визиты сайта
 * Развернуть: «Начать развертывание» → «Веб-приложение», запуск от моего имени, доступ «Все».
 * Включить проверки и отчёты: один раз выполнить installTriggers.
 */

var SITES = [
  { name: 'derevenko-media.ru', url: 'https://derevenko-media.ru/ru' },
  { name: 'mdk-regions-biznes.ru', url: 'https://mdk-regions-biznes.ru/' },
  { name: 'kodgoda.ru', url: 'https://kodgoda.ru/' },
  // функция заявок отвечает на GET кодом 405 — значит, она жива
  { name: 'Форма заявок', url: 'https://functions.yandexcloud.net/d4e099qbaltv8944r1rd', expect: [405] },
];
var METRIKA_COUNTER = '113973752';
var TZ = 'Europe/Moscow';
var FAILS_TO_ALERT = 2; // сколько неудачных проверок подряд до тревоги (2 × 5 мин)
var KEEP_DAYS = 40; // сколько дней хранить дневную статистику

// ───────────────────────── посредник ─────────────────────────

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }
  if (!props.getProperty('SECRET') || data.secret !== props.getProperty('SECRET')) {
    return json({ ok: false, error: 'forbidden' });
  }
  var text = String(data.text || '').slice(0, 4000);
  var code = tg(text, data.reply_markup);
  if (code === 200) {
    try {
      countLead(text);
    } catch (err) {
      console.error('countLead', err);
    }
  }
  return json({ ok: code === 200, code: code });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Отправить сообщение в Telegram. Возвращает HTTP-код ответа. */
function tg(text, replyMarkup) {
  var props = PropertiesService.getScriptProperties();
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + props.getProperty('TOKEN') + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: props.getProperty('CHAT_ID'),
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: replyMarkup || undefined,
    }),
    muteHttpExceptions: true,
  });
  return res.getResponseCode();
}

// ───────────────────────── статистика ─────────────────────────

function dayKey(date) {
  return 'D_' + Utilities.formatDate(date, TZ, 'yyyy-MM-dd');
}

function readDay(key) {
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  var d = raw ? JSON.parse(raw) : {};
  d.l = d.l || { n: 0, k: {}, s: {}, d: {} }; // заявки: всего, по типу, по источнику, по направлению
  d.u = d.u || {}; // сайты: имя → [проверок, неудачных]
  return d;
}

function writeDay(key, d) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(d));
}

function inc(obj, k) {
  obj[k] = (obj[k] || 0) + 1;
}

function strip(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/** Учёт заявки по тексту сообщения. Тестовые заявки (имя начинается с «Тест») не считаются. */
function countLead(text) {
  var first = text.split('\n')[0];
  if (!/заявка|квиз/i.test(first)) return;
  var name = (text.match(/Имя:<\/b>\s*([^\n]+)/) || [])[1];
  if (name && /^тест/i.test(strip(name))) return;
  var kind = /разбор/i.test(first) ? 'Разбор' : /квиз/i.test(first) ? 'Квиз' : 'Заявка';
  var dir = strip((text.match(/Направление:<\/b>\s*([^\n]+)/) || [])[1]) || 'не указано';
  var src = strip((text.match(/Источник:\s*([^\n]+)/) || [])[1]) || 'не указан';
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var key = dayKey(new Date());
    var d = readDay(key);
    d.l.n += 1;
    inc(d.l.k, kind);
    inc(d.l.s, src);
    inc(d.l.d, dir);
    writeDay(key, d);
  } finally {
    lock.releaseLock();
  }
}

// ───────────────────────── контроль сайтов ─────────────────────────

function checkOne(site) {
  var started = Date.now();
  try {
    var res = UrlFetchApp.fetch(site.url, { muteHttpExceptions: true, followRedirects: true, validateHttpsCertificates: true });
    var code = res.getResponseCode();
    var ok = site.expect ? site.expect.indexOf(code) !== -1 : code >= 200 && code < 400;
    return { ok: ok, code: code, ms: Date.now() - started, err: ok ? '' : 'ответ сервера ' + code };
  } catch (err) {
    var msg = String((err && err.message) || err);
    if (/certificate|SSL/i.test(msg)) msg = 'проблема с SSL-сертификатом (https)';
    else if (/timeout|timed out/i.test(msg)) msg = 'сайт не ответил вовремя';
    else if (/DNS|resolve|address unavailable/i.test(msg)) msg = 'домен не открывается (DNS)';
    return { ok: false, code: 0, ms: Date.now() - started, err: msg.slice(0, 150) };
  }
}

function checkSites() {
  var props = PropertiesService.getScriptProperties();
  var results = SITES.map(function (s) {
    return { site: s, r: checkOne(s) };
  });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var messages = [];
  try {
    var state = JSON.parse(props.getProperty('SITE_STATE') || '{}');
    var key = dayKey(new Date());
    var d = readDay(key);
    var now = Date.now();
    results.forEach(function (x) {
      var name = x.site.name;
      var st = state[name] || { fails: 0, down: false, since: 0 };
      var u = d.u[name] || [0, 0];
      u[0] += 1;
      if (x.r.ok) {
        if (st.down) {
          var mins = Math.max(5, Math.round((now - st.since) / 60000));
          messages.push('🟢 <b>' + name + ' снова работает</b>\nБыл недоступен примерно ' + duration(mins) + '.');
        }
        st = { fails: 0, down: false, since: 0 };
      } else {
        u[1] += 1;
        st.fails += 1;
        if (!st.since) st.since = now;
        st.err = x.r.err;
        if (!st.down && st.fails >= FAILS_TO_ALERT) {
          st.down = true;
          messages.push(
            '🔴 <b>Не открывается: ' + name + '</b>\n' +
              'Причина: ' + esc(x.r.err) + '\n' +
              '🔗 ' + x.site.url + '\n' +
              'Проверяю каждые 5 минут — напишу, когда заработает.'
          );
        }
      }
      d.u[name] = u;
      state[name] = st;
    });
    props.setProperty('SITE_STATE', JSON.stringify(state));
    writeDay(key, d);
  } finally {
    lock.releaseLock();
  }
  messages.forEach(function (m) {
    tg(m);
  });
}

// ───────────────────────── отчёты ─────────────────────────

var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function human(date) {
  var p = Utilities.formatDate(date, TZ, 'd M').split(' ');
  return p[0] + ' ' + MONTHS[Number(p[1]) - 1];
}

function duration(mins) {
  if (mins < 60) return mins + ' мин';
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return h + ' ч' + (m ? ' ' + m + ' мин' : '');
}

/** n дней до даты from (не включая её), от старых к новым. */
function daysBack(n, from) {
  var list = [];
  for (var i = n; i >= 1; i--) list.push(new Date(from.getTime() - i * 86400000));
  return list;
}

/** Сложить статистику за несколько дней. */
function sumDays(dates) {
  var total = { n: 0, k: {}, s: {}, d: {}, u: {} };
  dates.forEach(function (date) {
    var d = readDay(dayKey(date));
    total.n += d.l.n;
    ['k', 's', 'd'].forEach(function (f) {
      Object.keys(d.l[f]).forEach(function (x) {
        total[f][x] = (total[f][x] || 0) + d.l[f][x];
      });
    });
    Object.keys(d.u).forEach(function (site) {
      var t = total.u[site] || [0, 0];
      t[0] += d.u[site][0];
      t[1] += d.u[site][1];
      total.u[site] = t;
    });
  });
  return total;
}

function top(obj) {
  return Object.keys(obj)
    .sort(function (a, b) {
      return obj[b] - obj[a];
    })
    .map(function (k) {
      return esc(k) + ' — ' + obj[k];
    })
    .join(', ');
}

/** Визиты из Метрики, если задан METRIKA_TOKEN. date1/date2 — 'yyyy-MM-dd'. */
function metrika(date1, date2) {
  var token = PropertiesService.getScriptProperties().getProperty('METRIKA_TOKEN');
  if (!token) return null;
  try {
    var url = 'https://api-metrika.yandex.net/stat/v1/data?ids=' + METRIKA_COUNTER +
      '&metrics=ym:s:visits,ym:s:users&date1=' + date1 + '&date2=' + date2;
    var res = UrlFetchApp.fetch(url, { headers: { Authorization: 'OAuth ' + token }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return null;
    var t = JSON.parse(res.getContentText()).totals || [];
    return { visits: Math.round(t[0] || 0), users: Math.round(t[1] || 0) };
  } catch (err) {
    return null;
  }
}

/** Строки о сайтах: downOnly — только сбои (для утренней сводки), иначе доступность в % по каждому. */
function sitesLine(u, downOnly) {
  var bad = [];
  var lines = [];
  SITES.forEach(function (s) {
    var x = u[s.name];
    if (!x || !x[0]) return;
    var pct = Math.round((1000 * (x[0] - x[1])) / x[0]) / 10;
    if (x[1]) bad.push('⚠️ ' + s.name + ' — недоступен ~' + duration(x[1] * 5));
    lines.push((x[1] ? '⚠️ ' : '✅ ') + s.name + ' — ' + pct + '%');
  });
  if (downOnly) return bad.length ? bad.join('\n') : '✅ Все сайты работали без сбоев';
  return lines.join('\n');
}

function buildDaily(date) {
  var t = sumDays([date]);
  var ymd = Utilities.formatDate(date, TZ, 'yyyy-MM-dd');
  var m = metrika(ymd, ymd);
  var out = ['☀️ <b>Сводка за ' + human(date) + '</b>', '━━━━━━━━━━━━━━'];
  if (t.n) {
    out.push('📥 Заявок: <b>' + t.n + '</b> (' + top(t.k) + ')');
    out.push('📊 Откуда: ' + top(t.s));
    out.push('🧭 Направления: ' + top(t.d));
  } else {
    out.push('📥 Заявок не было');
  }
  if (m) out.push('👀 Сайт: ' + m.visits + ' визитов, ' + m.users + ' посетителей');
  out.push('', '🌐 <b>Сайты</b>', sitesLine(t.u, true));
  return out.join('\n');
}

function buildWeekly(today) {
  var week = daysBack(7, today);
  var prev = daysBack(14, today).slice(0, 7);
  var t = sumDays(week);
  var p = sumDays(prev);
  var d1 = Utilities.formatDate(week[0], TZ, 'yyyy-MM-dd');
  var d2 = Utilities.formatDate(week[6], TZ, 'yyyy-MM-dd');
  var m = metrika(d1, d2);
  var diff = t.n - p.n;
  var out = [
    '📅 <b>Итог недели: ' + human(week[0]) + ' — ' + human(week[6]) + '</b>',
    '━━━━━━━━━━━━━━',
    '📥 Заявок: <b>' + t.n + '</b>' + (p.n || t.n ? ' (' + (diff > 0 ? '+' : '') + diff + ' к прошлой неделе)' : ''),
  ];
  if (t.n) {
    out.push('🗂 Типы: ' + top(t.k));
    out.push('📊 Откуда: ' + top(t.s));
    out.push('🧭 Направления: ' + top(t.d));
  }
  if (m) out.push('👀 Сайт: ' + m.visits + ' визитов, ' + m.users + ' посетителей');
  out.push('', '🌐 <b>Доступность сайтов</b>', sitesLine(t.u, false) || 'данных пока нет');
  return out.join('\n');
}

/** Запускается каждый час: в 9:00 МСК — утренняя сводка, по понедельникам — ещё и итог недели. */
function hourlyTick() {
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  var hour = Number(Utilities.formatDate(now, TZ, 'H'));
  var today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  if (hour >= 9 && props.getProperty('LAST_DAILY') !== today) {
    props.setProperty('LAST_DAILY', today);
    tg(buildDaily(new Date(now.getTime() - 86400000)));
    if (Utilities.formatDate(now, TZ, 'u') === '1' && props.getProperty('LAST_WEEKLY') !== today) {
      props.setProperty('LAST_WEEKLY', today);
      tg(buildWeekly(now));
    }
  }
  cleanup();
}

/** Удалить дневную статистику старше KEEP_DAYS. */
function cleanup() {
  var props = PropertiesService.getScriptProperties();
  var border = 'D_' + Utilities.formatDate(new Date(Date.now() - KEEP_DAYS * 86400000), TZ, 'yyyy-MM-dd');
  props.getKeys().forEach(function (k) {
    if (/^D_\d{4}-\d{2}-\d{2}$/.test(k) && k < border) props.deleteProperty(k);
  });
}

// ───────────────────────── запуск вручную ─────────────────────────

/** Включить проверки сайтов (каждые 5 минут) и отчёты (каждый час проверяет, не пора ли). Выполнить один раз. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['checkSites', 'hourlyTick'].indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkSites').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('hourlyTick').timeBased().everyHours(1).create();
  // сегодняшнюю утреннюю сводку не шлём задним числом — первая придёт завтра в 9:00
  var props = PropertiesService.getScriptProperties();
  var now = new Date();
  if (Number(Utilities.formatDate(now, TZ, 'H')) >= 9) props.setProperty('LAST_DAILY', Utilities.formatDate(now, TZ, 'yyyy-MM-dd'));
  var lines = SITES.map(function (s) {
    var r = checkOne(s);
    return (r.ok ? '✅ ' : '🔴 ') + s.name + (r.ok ? ' — ' + (r.ms / 1000).toFixed(1) + ' с' : ' — ' + esc(r.err));
  });
  tg(
    '🛰 <b>Контроль сайтов включён</b>\n━━━━━━━━━━━━━━\n' + lines.join('\n') +
      '\n\nПроверяю каждые 5 минут и сразу напишу, если что-то перестанет открываться.\n' +
      '☀️ Сводка — каждое утро в 9:00 МСК, 📅 итог недели — по понедельникам.'
  );
}

/** Прислать пример сводки за сегодня — чтобы посмотреть, как она выглядит. */
function sendTestReport() {
  tg('🧪 <i>Пример утренней сводки (за сегодня, по текущим данным):</i>\n\n' + buildDaily(new Date()));
}

/** Оформление профиля бота: имя, описание и короткое описание. */
function setupBotProfile() {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  var calls = [
    ['setMyName', { name: 'Заявки · Никита Деревенко' }],
    ['setMyShortDescription', { short_description: 'Заявки с сайта derevenko-media.ru' }],
    ['setMyDescription', { description: 'Сюда приходят заявки с сайта derevenko-media.ru: имя, контакт, задача и откуда пришёл клиент. Кнопки под сообщением сразу открывают чат с ним в Telegram или WhatsApp.' }],
  ];
  calls.forEach(function (c) {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/' + c[0], {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(c[1]),
      muteHttpExceptions: true,
    });
    Logger.log(c[0] + ': ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
  });
}
