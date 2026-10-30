// Константы сайта: адрес, контакты, флаги, цены и сроки. Тексты — в lib/i18n/*.
// Значения вида '{{...}}' — плейсхолдеры: их нужно заполнить. Пока плейсхолдер не заменён,
// зависящий от него блок на сайте не показывается (или вместо цены пишется «по запросу»).

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

/** Рынок определяется языком: RU — Россия и СНГ, EN — зарубежье */
export type Market = 'ru' | 'intl';
export const marketOf = (locale: Locale): Market => (locale === 'en' ? 'intl' : 'ru');

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export type Placeholder = `{{${string}}}`;
export const isPlaceholder = (v: unknown): v is Placeholder => typeof v === 'string' && v.startsWith('{{');
/** true, если ни одно значение не является плейсхолдером */
export const isFilled = (...values: unknown[]) => values.every((v) => v !== undefined && v !== '' && !isPlaceholder(v));

// ---------- Адрес сайта ----------
// Берётся из NEXT_PUBLIC_SITE_URL (см. .env.example). Production-сборка без него падает — проверка в next.config.mjs.
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const SITE = {
  name: 'Nikita Derevenko',
  url: rawUrl.replace(/\/$/, ''),
  telegram: 'NikitaDerevenko',
  // Пустая строка — контакт не выводится на сайте.
  email: 'nikita.derevenko@yandex.ru',
  /** Номер для мессенджеров (WhatsApp, Telegram, MAX). Звонки не принимаются — ссылки tel: не выводим. */
  phone: '+7 996 939-74-94',
  phoneDigits: '79969397494',
};

export const TELEGRAM_URL = `https://t.me/${SITE.telegram}`;

/** Куда форма отправляет заявки: функция в Яндекс Облаке (cloud/lead). Пусто — форма предложит написать в Telegram. */
export const LEAD_URL = process.env.NEXT_PUBLIC_LEAD_URL || '';

/** Публичный канал с отзывами клиентов MDK Регионы — источник отзывов в «Обо мне» */
export const REVIEWS_URL = 'https://t.me/otzivyMDK';

/**
 * Реквизиты исполнителя и оператора персональных данных — для подвала, политики, согласия и условий работы.
 * ФИО указывается полностью, как в «Мой налог»; при наличии отчества добавьте его в name.
 */
export const LEGAL = {
  name: { ru: 'Деревенко Никита Анатольевич', en: 'Nikita Anatolyevich Derevenko' },
  inn: '532004404152',
  /** Сервис ФНС «Проверить статус самозанятого» */
  checkUrl: 'https://npd.nalog.ru/check-status/',
  /** Дата редакции юридических документов */
  updated: { ru: '30 октября 2026 года', en: '30 October 2026' },
};

/** false — в проектах выводится clientAnonymous, true — clientName (только с разрешения клиентов). */
export const SHOW_CLIENT_NAMES = false;

/** Показывать цены в долларах в EN-версии. false — вместо цен «по запросу». */
export const SHOW_PRICES_INTL = true;

/** Появились ли данные по Яндекс Директу в кейсах (влияет на теги проектов). */
export const HAS_DIRECT_DATA = true;

/** Демо-боты: username без @. Пока оба пустые — блок «Попробуйте демо» не рендерится. */
export const DEMO_BOTS = {
  booking: '', // демо: запись в кофейню
  lead: '', // бот для заявок на разбор
};

/** Фото для блока «Обо мне». Пока файла нет — показывается заглушка с инициалами. */
export const ABOUT_PHOTO = '/about/photo.jpg';

// ---------- Доказательства в кейсах (заполнить из рекламного кабинета) ----------

/** Lumos, Благовещенск: строка с данными под «×4». Пока есть плейсхолдеры — строка скрыта. */
export const LUMOS_PROOF = {
  period: '{{период продаж, Благовещенск}}' as string,
  spend: '{{расход на рекламу, ₽}}' as string,
  revenue: '{{выручка, отнесённая к рекламе, ₽}}' as string,
  purchases: '{{количество покупок}}' as string,
  attribution: '{{способ атрибуции, например UTM-метки + Яндекс Метрика}}' as string,
  cutoff: '{{дата среза данных}}' as string,
};

/** Обезличенный скриншот кабинета. Если файла нет — блок скрыт. */
export const LUMOS_PROOF_IMAGE = '/projects/ads-lumos/proof.webp';

/** «Итог работы» для кейсов с фото. Пока есть плейсхолдеры — блок скрыт. */
export const PHOTO_CASE_RESULTS: Record<string, { items: string; published: string; term: string }> = {
  'maps-cafe-1': {
    items: '{{сколько фото/позиций обновлено}}',
    published: '{{что опубликовано: меню, обложки…}}',
    term: '{{за какой срок}}',
  },
  'maps-cafe-2': {
    items: '{{сколько фото/позиций обновлено}}',
    published: '{{что опубликовано: обложки историй, меню…}}',
    term: '{{за какой срок}}',
  },
};

// ---------- Направления и цены ----------

/** Направления сайта. miniapps — отдельная страница, на главной выделен внутри Telegram-сервисов. */
export const DIRECTIONS = ['promotion', 'websites', 'telegram-bots', 'mini-apps'] as const;
export type DirectionId = (typeof DIRECTIONS)[number];
export const isDirection = (v: string): v is DirectionId => (DIRECTIONS as readonly string[]).includes(v);

/** Три направления на главной */
export const HOME_DIRECTIONS = ['promotion', 'websites', 'telegram-bots'] as const;

export type ServiceId =
  // продвижение
  | 'audit'
  | 'mapsSetup'
  | 'mapsPhotos'
  | 'mapsManage'
  | 'adsAudit'
  | 'directSetup'
  | 'vkSetup'
  | 'adsManage'
  | 'gbpSetup'
  | 'gbpManage'
  | 'gadsSetup'
  | 'gadsManage'
  | 'analytics'
  // сайты
  | 'landing'
  | 'website'
  | 'customSite'
  | 'siteSupport'
  // Telegram
  | 'botForm'
  | 'botLeads'
  | 'botCatalog'
  | 'botPay'
  | 'miniApp'
  | 'botSupport';

/** Цена: число (от …), null — «после разбора», плейсхолдер — «по запросу» до заполнения */
export type Price = number | null | Placeholder;

/** to — верхняя граница диапазона: цена показывается как «15 000–25 000 ₽» вместо «от …» */
type ServiceRow = { price: Price; to?: number; monthly?: boolean; direction: DirectionId };

export const SERVICES: Record<Market, Partial<Record<ServiceId, ServiceRow>>> = {
  ru: {
    audit: { price: 0, direction: 'promotion' },
    mapsSetup: { price: 6900, direction: 'promotion' },
    mapsPhotos: { price: 3900, direction: 'promotion' },
    mapsManage: { price: 4900, monthly: true, direction: 'promotion' },
    adsAudit: { price: 4900, direction: 'promotion' },
    directSetup: { price: 14900, direction: 'promotion' },
    vkSetup: { price: 12900, direction: 'promotion' },
    adsManage: { price: 14900, monthly: true, direction: 'promotion' },

    // лендинг: 15 000 ₽ — до 6 блоков, 25 000 ₽ — до 10 блоков с квизом или калькулятором (состав — в словаре)
    landing: { price: 15000, to: 25000, direction: 'websites' },
    // сайт-визитка: 30 000 ₽ — 3 страницы, 45 000 ₽ — 5 страниц
    website: { price: 30000, to: 45000, direction: 'websites' },
    customSite: { price: null, direction: 'websites' },
    siteSupport: { price: 3000, monthly: true, direction: 'websites' },

    botForm: { price: 5000, direction: 'telegram-bots' },
    botLeads: { price: 15000, direction: 'telegram-bots' },
    botCatalog: { price: 25000, direction: 'telegram-bots' },
    botPay: { price: 39000, direction: 'telegram-bots' },
    miniApp: { price: 59000, direction: 'mini-apps' },
    botSupport: { price: 2000, monthly: true, direction: 'telegram-bots' },
  },
  intl: {
    audit: { price: 0, direction: 'promotion' },
    gbpSetup: { price: 150, direction: 'promotion' },
    gbpManage: { price: 100, monthly: true, direction: 'promotion' },
    gadsSetup: { price: 350, direction: 'promotion' },
    gadsManage: { price: 300, monthly: true, direction: 'promotion' },
    analytics: { price: 200, direction: 'promotion' },

    landing: { price: 700, direction: 'websites' },
    website: { price: 1200, direction: 'websites' },
    customSite: { price: null, direction: 'websites' },
    siteSupport: { price: '{{USD: поддержка сайта в месяц}}', monthly: true, direction: 'websites' },

    botForm: { price: '{{USD: форма → таблица → Telegram}}', direction: 'telegram-bots' },
    botLeads: { price: 150, direction: 'telegram-bots' },
    botCatalog: { price: 400, direction: 'telegram-bots' },
    botPay: { price: '{{USD: бот с оплатой или CRM}}', direction: 'telegram-bots' },
    miniApp: { price: 700, direction: 'mini-apps' },
    botSupport: { price: '{{USD: поддержка бота и сервер в месяц}}', monthly: true, direction: 'telegram-bots' },
  },
};

/** Порядок услуг внутри направлений (в каждом рынке — свои) */
export const DIRECTION_SERVICES: Record<Market, Record<DirectionId, ServiceId[]>> = {
  ru: {
    promotion: ['audit', 'mapsSetup', 'mapsPhotos', 'mapsManage', 'adsAudit', 'directSetup', 'vkSetup', 'adsManage'],
    websites: ['landing', 'website', 'customSite', 'siteSupport'],
    'telegram-bots': ['botForm', 'botLeads', 'botCatalog', 'botPay', 'botSupport'],
    'mini-apps': ['miniApp', 'botSupport'],
  },
  intl: {
    promotion: ['audit', 'gbpSetup', 'gbpManage', 'gadsSetup', 'gadsManage', 'analytics'],
    websites: ['landing', 'website', 'customSite', 'siteSupport'],
    'telegram-bots': ['botForm', 'botLeads', 'botCatalog', 'botPay', 'botSupport'],
    'mini-apps': ['miniApp', 'botSupport'],
  },
};

/** Пакеты — только внутри «Продвижения» */
export type PackageId = 'card' | 'start' | 'growth';
export const PACKAGES: Record<Market, Record<PackageId, Price>> = {
  ru: { card: 9900, start: 22900, growth: 59000 },
  intl: { card: 199, start: 449, growth: 1290 },
};
/** Пакет с бейджем «Оптимальный старт» */
export const RECOMMENDED_PACKAGE: PackageId = 'start';

export function showPrices(market: Market) {
  return market === 'ru' || SHOW_PRICES_INTL;
}

export function formatMoney(value: number, market: Market, locale: Locale) {
  const nf = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 });
  if (market === 'ru') return `${nf.format(value)} ₽`;
  return `$${nf.format(value)}`;
}

export function serviceOf(market: Market, id: ServiceId) {
  return SERVICES[market][id];
}

/** Ориентир «от …» для услуги, null если цены нет (после разбора / по запросу / скрыто) */
export function priceFrom(market: Market, id: ServiceId): number | null {
  const p = SERVICES[market][id]?.price;
  return typeof p === 'number' && showPrices(market) ? p : null;
}
