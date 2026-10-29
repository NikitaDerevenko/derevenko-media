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
  if (!bucket || !token) return false;
  const key = `leads/${record.receivedAt.slice(0, 10)}/${record.receivedAt}-${Math.random().toString(36).slice(2, 8)}.json`;
  const res = await fetch(`https://storage.yandexcloud.net/${bucket}/${key}`, {
    method: 'PUT',
    headers: { 'X-YaCloud-SubjectToken': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error(`storage ${res.status}`);
  return true;
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
  try {
    stored = await storeCopy({ receivedAt, type, market, locale, direction, link, name, contact, message, page, utm: Object.fromEntries(utm), consent: true }, context);
  } catch (e) {
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

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы');
    return reply(stored ? 200 : 503, stored ? { ok: true, delivered: false } : { ok: false, error: 'not_configured' }, origin);
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`telegram ${res.status}`);
    return reply(200, { ok: true, delivered: true }, origin);
  } catch (e) {
    console.error('[lead] не удалось отправить в Telegram', e);
    // копия сохранена — заявка не потеряна, человеку показываем успех
    return reply(stored ? 200 : 502, stored ? { ok: true, delivered: false } : { ok: false, error: 'delivery_failed' }, origin);
  }
};
