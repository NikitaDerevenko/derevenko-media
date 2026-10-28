import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

// Заявки с сайта → Telegram. Нужны TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID (см. .env.example).
// Без них: в разработке заявка пишется в консоль, в продакшене возвращается 503 —
// форма покажет «напишите в Telegram», чтобы заявка не потерялась молча.
// LEADS_STORE_FILE — файл на сервере, куда каждая заявка дописывается строкой JSON до отправки в Telegram
// (первичная запись данных граждан РФ — в базе на территории РФ, ч. 5 ст. 18 152-ФЗ; хостинг должен быть в России).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'];
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  // не больше N заявок с одного IP за 10 минут (LEADS_RATE_LIMIT, по умолчанию 5)
  return recent.length > (Number(process.env.LEADS_RATE_LIMIT) || 5);
}

const str = (v: unknown, max = 1000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  // спам: заполнено скрытое поле или форма отправлена быстрее чем за 2 секунды
  if (str(body.company) || (typeof body.elapsed === 'number' && body.elapsed < 2000)) {
    console.info('[lead] отсечено как спам');
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

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
  if (body.consent !== true) return NextResponse.json({ ok: false, error: 'consent_required' }, { status: 422 });

  if (contact.length < 3 || (type === 'audit' && link.length < 4) || (type === 'contact' && message.length < 2)) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }

  const utmRaw = (body.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>;
  const receivedAt = new Date().toISOString();
  const utm = UTM_KEYS.map((k) => [k, str(utmRaw[k], 200)] as const).filter(([, v]) => v);

  const lines = [
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
  ].filter(Boolean);
  const text = lines.join('\n');

  const storeFile = process.env.LEADS_STORE_FILE;
  if (storeFile) {
    try {
      await mkdir(path.dirname(storeFile), { recursive: true });
      const record = { receivedAt, type, market, locale, direction, link, name, contact, message, page, utm: Object.fromEntries(utm), consent: true };
      await appendFile(storeFile, JSON.stringify(record) + '\n', 'utf8');
    } catch (e) {
      console.error('[lead] не удалось сохранить заявку в файл', e);
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // LEADS_DRY_RUN=1 — для проверки форм на production-сборке без Telegram: заявка только пишется в лог
    if (process.env.NODE_ENV !== 'production' || process.env.LEADS_DRY_RUN === '1') {
      console.info('[lead] Telegram не настроен, заявка:\n' + text);
      return NextResponse.json({ ok: true, delivered: false });
    }
    console.error('[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`telegram ${res.status}`);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (e) {
    console.error('[lead] не удалось отправить в Telegram', e);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
