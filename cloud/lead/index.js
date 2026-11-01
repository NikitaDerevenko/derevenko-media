// Приём заявок с сайта derevenko-media.ru — функция Yandex Cloud Functions (Node.js 18+).
//
// Сайт — статичные файлы на GitHub Pages, у него нет своего сервера. Форма отправляет заявку сюда (POST JSON),
// функция проверяет её, сохраняет копию в Object Storage (данные граждан РФ сначала записываются в России,
// ч. 5 ст. 18 152-ФЗ) и присылает уведомление в Telegram.
//
// Переменные окружения функции:
//   TELEGRAM_BOT_TOKEN  — токен бота от @BotFather (секрет: только здесь, никогда в коде сайта)
//   TELEGRAM_CHAT_ID    — куда слать заявки (ваш id или id группы)
//   LEADS_BUCKET        — имя бакета Object Storage для копий заявок (необязательно, но нужно для 152-ФЗ)
//   ALLOWED_ORIGINS     — с каких сайтов принимать заявки, через запятую (по умолчанию https://derevenko-media.ru)
//   LEADS_RATE_LIMIT    — сколько заявок с одного IP за 10 минут (по умолчанию 5)
//   SMTP_USER / SMTP_PASS — Яндекс Почта и пароль приложения: запасной канал уведомлений на почту
//   NOTIFY_EMAIL        — куда слать письма (по умолчанию SMTP_USER)
//   TG_RELAY_URL / TG_RELAY_SECRET — посредник в Google Apps Script для Telegram (cloud/tg-relay), т. к. из РФ Telegram заблокирован
// Для записи в бакет у функции должен быть сервисный аккаунт с ролью storage.uploader.

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'];
const hits = new Map();

const str = (v, max = 1000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || 'https://derevenko-media.ru,https://www.derevenko-media.ru')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function cors(origin) {
  const list = allowedOrigins();
  return {
    'Access-Control-Allow-Origin': list.includes(origin) ? origin : list[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function reply(status, data, origin) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json', ...cors(origin) }, body: JSON.stringify(data) };
}

function rateLimited(ip) {
  // счётчик живёт в памяти экземпляра функции: от спама хватает, это не строгая квота
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > (Number(process.env.LEADS_RATE_LIMIT) || 5);
}

async function storeCopy(record, context) {
  const bucket = process.env.LEADS_BUCKET;
  const token = context && context.token && context.token.access_token;
  if (!bucket) throw new Error('LEADS_BUCKET не задан');
  if (!token) throw new Error('у функции нет сервисного аккаунта');
  const key = `leads/${record.receivedAt.slice(0, 10)}/${record.receivedAt}-${Math.random().toString(36).slice(2, 8)}.json`;
  const res = await fetch(`https://storage.yandexcloud.net/${bucket}/${key}`, {
    method: 'PUT',
    headers: { 'X-YaCloud-SubjectToken': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(3000), // не держим заявку, если хранилище не отвечает
  });
  if (!res.ok) throw new Error(`storage ${res.status} ${(await res.text()).slice(0, 150)}`);
  return true;
}

function hideSecrets(msg) {
  let m = msg;
  for (const k of ['TELEGRAM_BOT_TOKEN', 'SMTP_PASS', 'TG_RELAY_SECRET']) if (process.env[k]) m = m.split(process.env[k]).join('***');
  return m;
}

async function sendTelegram(text) {
  // Из облака в РФ api.telegram.org заблокирован — шлём через посредника в Google Apps Script (cloud/tg-relay),
  // если он задан; иначе напрямую.
  const relay = process.env.TG_RELAY_URL;
  if (relay) {
    const res = await fetch(relay, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TG_RELAY_SECRET || '', text }),
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });
    const out = await res.text();
    let data = {};
    try {
      data = JSON.parse(out);
    } catch {
      throw new Error(`relay ${res.status} ${out.slice(0, 120)}`);
    }
    if (!data.ok) throw new Error(`relay: ${data.error || data.code || 'error'}`);
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`telegram ${res.status} ${(await res.text()).slice(0, 200)}`);
}

// Письмо через SMTP Яндекс Почты (smtp.yandex.ru:465, пароль приложения) — без сторонних библиотек
function sendEmail(subject, body) {
  const tls = require('node:tls');
  const user = process.env.SMTP_USER;
  const to = process.env.NOTIFY_EMAIL || user;
  const b64 = (x) => Buffer.from(x, 'utf8').toString('base64');
  const msg = [
    `From: =?UTF-8?B?${b64('Сайт derevenko-media.ru')}?= <${user}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(body).replace(/(.{76})/g, '$1\r\n'),
  ].join('\r\n');
  const steps = [
    null, // приветствие сервера
    'EHLO derevenko-media.ru',
    'AUTH LOGIN',
    b64(user),
    b64(process.env.SMTP_PASS),
    `MAIL FROM:<${user}>`,
    `RCPT TO:<${to}>`,
    'DATA',
    `${msg}\r\n.`,
    'QUIT',
  ];
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host: 'smtp.yandex.ru', port: 465, servername: 'smtp.yandex.ru' });
    const timer = setTimeout(() => {
      sock.destroy();
      reject(new Error('smtp timeout'));
    }, 8000);
    let buf = '';
    let i = 0;
    const fail = (e) => {
      clearTimeout(timer);
      sock.destroy();
      reject(e);
    };
    sock.on('error', fail);
    sock.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      // ждём последнюю строку ответа вида «250 ...» (не «250-...»)
      const lines = buf.split('\r\n').filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (!/^\d{3} /.test(last)) return;
      buf = '';
      const code = Number(last.slice(0, 3));
      if (code >= 400) return fail(new Error(`smtp ${last.slice(0, 120)}`));
      i += 1;
      if (i >= steps.length) {
        clearTimeout(timer);
        sock.end();
        return resolve();
      }
      sock.write(`${steps[i]}\r\n`);
    });
  });
}

module.exports.handler = async function handler(event, context) {
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const origin = headers.origin || '';

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(origin), body: '' };
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'method' }, origin);
  if (origin && !allowedOrigins().includes(origin)) return reply(403, { ok: false, error: 'origin' }, origin);

  let body;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    body = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: 'bad_json' }, origin);
  }

  // спам: заполнено скрытое поле или форма отправлена быстрее чем за 2 секунды
  if (str(body.company) || (typeof body.elapsed === 'number' && body.elapsed < 2000)) {
    console.info('[lead] отсечено как спам');
    return reply(200, { ok: true }, origin);
  }

  const ip = (headers['x-forwarded-for'] || '').split(',')[0].trim() || (event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) || 'unknown';
  if (rateLimited(ip)) return reply(429, { ok: false, error: 'rate_limited' }, origin);

  const type = body.type === 'audit' || body.type === 'quiz' ? body.type : 'contact';
  const link = str(body.link, 500);
  const name = str(body.name, 100);
  const contact = str(body.contact, 200);
  const message = str(body.message, 2000);
  const market = body.market === 'intl' ? 'intl' : 'ru';
  const locale = body.locale === 'en' ? 'en' : 'ru';
  const page = str(body.page, 200);
  const direction = str(body.direction, 60);

  // без отметки согласия на обработку персональных данных заявка не принимается
  if (body.consent !== true) return reply(422, { ok: false, error: 'consent_required' }, origin);
  if (contact.length < 3 || (type === 'audit' && link.length < 4) || (type === 'contact' && message.length < 2)) {
    return reply(422, { ok: false, error: 'validation' }, origin);
  }

  const utmRaw = body.utm && typeof body.utm === 'object' ? body.utm : {};
  const utm = UTM_KEYS.map((k) => [k, str(utmRaw[k], 200)]).filter(([, v]) => v);
  const receivedAt = new Date().toISOString();

  // копия заявки в России — до передачи в Telegram
  let stored = false;
  let storeError = '';
  try {
    stored = await storeCopy({ receivedAt, type, market, locale, direction, link, name, contact, message, page, utm: Object.fromEntries(utm), consent: true }, context);
  } catch (e) {
    storeError = String((e && e.message) || e).slice(0, 200);
    console.error('[lead] не удалось сохранить копию заявки', e);
  }

  const text = [
    type === 'audit' ? '🔎 <b>Заявка на бесплатный разбор</b>' : type === 'quiz' ? '🧩 <b>Квиз «С чего начать»</b>' : '✉️ <b>Обсудить проект</b>',
    `Тип: <code>${type}</code> · рынок: <code>${market}</code> · язык: <code>${locale}</code>`,
    direction && `Направление: ${esc(direction)}`,
    link && `Ссылка: ${esc(link)}`,
    name && `Имя: ${esc(name)}`,
    `Контакт: ${esc(contact)}`,
    message && `${type === 'audit' ? 'Что беспокоит' : type === 'quiz' ? 'Ответы' : 'Сообщение'}: ${esc(message)}`,
    page && `Страница: ${esc(page)}`,
    utm.length ? `UTM: ${utm.map(([k, v]) => `${k}=${esc(v)}`).join(' · ')}` : 'UTM: —',
    `Согласие на обработку ПД: да, ${receivedAt}`,
    stored ? '' : '⚠️ Копия в хранилище не сохранена — проверьте LEADS_BUCKET',
  ]
    .filter(Boolean)
    .join('\n');

  // доставка: Telegram и почта параллельно; заявка доставлена, если дошло хоть куда-то
  const plain = text.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const subject = type === 'audit' ? 'Заявка на бесплатный разбор' : type === 'quiz' ? 'Квиз с сайта' : 'Новая заявка с сайта';
  const channels = [];
  if (process.env.TG_RELAY_URL || (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)) channels.push(['telegram', sendTelegram(text)]);
  if (process.env.SMTP_USER && process.env.SMTP_PASS) channels.push(['email', sendEmail(subject, plain)]);
  if (!channels.length) {
    console.error('[lead] не задан ни один канал уведомлений (Telegram или почта)');
    return reply(stored ? 200 : 503, stored ? { ok: true, delivered: false } : { ok: false, error: 'not_configured', storeError }, origin);
  }
  const results = await Promise.allSettled(channels.map(([, p]) => p));
  const via = channels.filter((_, i) => results[i].status === 'fulfilled').map(([n]) => n);
  // короткие причины сбоев (без секретов) — чтобы разбираться без логов
  const why = Object.fromEntries(
    channels
      .map(([n], i) => [n, results[i]])
      .filter(([, r]) => r.status === 'rejected')
      .map(([n, r]) => [n, hideSecrets(String((r.reason && r.reason.message) || r.reason)).slice(0, 200)]),
  );
  if (Object.keys(why).length) console.error('[lead] сбой доставки', why);
  if (via.length) return reply(200, { ok: true, delivered: true, via, stored, ...(stored ? {} : { storeError }), ...(Object.keys(why).length ? { why } : {}) }, origin);
  // копия сохранена — заявка не потеряна, человеку показываем успех
  return reply(stored ? 200 : 502, stored ? { ok: true, delivered: false, why } : { ok: false, error: 'delivery_failed', why, storeError }, origin);
};
