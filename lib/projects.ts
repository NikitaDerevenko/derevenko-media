import { HAS_DIRECT_DATA, SHOW_CLIENT_NAMES, type DirectionId, type Locale } from './site';

export type L = { ru: string; en: string };

export type ProjectCategory = 'ads' | 'maps' | 'site' | 'bot';

export type ProjectImage = { src: string; w: number; h: number; alt: L; tall?: boolean; caption?: L };

export type ProjectResult = {
  /** Город / событие, к которому относится цифра */
  label: L;
  text: L;
  /** Пояснение к цифре, например «итог продаж по всем каналам» */
  note?: L;
};

export type Project = {
  slug: string;
  year: number;
  category: ProjectCategory;
  tags: L[];
  featured?: boolean;
  /** Готовое решение для ниши (раздел «Готовые решения»), а не работа для конкретного клиента */
  isSolution?: boolean;
  /** Ниша решения — подпись вместо названия клиента */
  niche?: L;
  /** Направления, к которым относится работа (по умолчанию — по категории) */
  directions?: DirectionId[];
  clientName: L;
  clientAnonymous: L;
  title: L;
  summary: L;
  task: L;
  steps: L[];
  /** Только реальные данные. Пустой массив — блок результатов не выводится. */
  results: ProjectResult[];
  resultsSource?: L;
  resultsPeriod?: L;
  /** Крупные цифры для карточки на главной — только из results */
  highlights?: { value: L; label: L }[];
  testimonial?: { text: L; author?: L };
  cover?: ProjectImage;
  /** В каких версиях показывать cover (по умолчанию — во всех). Например, обложка с русским текстом — только в RU */
  coverLocales?: Locale[];
  /** Обложка для английской версии (например, отрисованная на английском) */
  coverEn?: ProjectImage;
  /** Подпись под обложкой на странице работы */
  coverCaption?: L;
  /** focus — какую часть кадра показывать в карточке на главной (по умолчанию низ: там меню) */
  beforeAfter?: { before: string; after: string; w: number; h: number; focus?: 'top' | 'bottom' };
  gallery: ProjectImage[];
  galleryEn?: ProjectImage[];
  /** Показывать только в этих версиях сайта (по умолчанию — во всех) */
  locales?: Locale[];
};

const t = (ru: string, en: string): L => ({ ru, en });

const TAG = {
  vk: t('VK Реклама', 'VK Ads'),
  direct: t('Яндекс Директ', 'Yandex Direct'),
  analytics: t('Яндекс Метрика', 'Yandex Metrica'),
  maps: t('Яндекс Карты', 'Yandex Maps'),
  photo: t('Фото меню', 'Menu photos'),
  site: t('Сайт', 'Website'),
  landing: t('Лендинг', 'Landing page'),
  bot: t('Telegram-бот', 'Telegram bot'),
  miniApp: t('Мини-приложение', 'Mini App'),
};

const dish = (slug: string, n: number, ru: string, en: string): ProjectImage => ({
  src: `/projects/${slug}/dish-${n}.webp`,
  w: 800,
  h: 800,
  alt: t(ru, en),
});

/** Слайд 1536×1024 из папки «Медиа» (public/projects/<file>.webp) */
const shot = (file: string, ru: string, en: string, capRu?: string, capEn?: string): ProjectImage => ({
  src: `/projects/${file}.webp`,
  w: 1536,
  h: 1024,
  alt: t(ru, en),
  ...(capRu && capEn ? { caption: t(capRu, capEn) } : {}),
});

export const PROJECTS: Project[] = [
  {
    slug: 'ads-lumos',
    year: 2026,
    category: 'ads',
    featured: true,
    tags: [TAG.vk, TAG.analytics, ...(HAS_DIRECT_DATA ? [TAG.direct] : [])],
    clientName: t('Lumos — концерты при свечах', 'Lumos candlelight concerts'),
    clientAnonymous: t('Организатор концертов при свечах', 'Candlelight concert organiser'),
    title: t(
      'Продажа билетов на концерты при свечах через VK Рекламу',
      'Selling candlelight concert tickets with VK Ads',
    ),
    summary: t(
      'Реклама концертов в городах Сибири и Дальнего Востока: тест объявлений, точечный показ, сквозная аналитика и ежедневный отчёт.',
      'Concert ads across Siberia and the Russian Far East: creative testing, tight geo-targeting, end-to-end tracking and a daily report.',
    ),
    task: t(
      'Продать билеты на концерты при свечах в городах Дальнего Востока и Сибири. В каждом городе — своя аудитория и короткое окно продаж до даты концерта.',
      'Sell tickets for candlelight concerts in cities across Siberia and the Russian Far East. Each city has its own audience and a short sales window before the show.',
    ),
    steps: [
      t(
        'Тест трёх вариантов объявлений на каждый город — оставлял те, что приносят покупки, а не просто клики.',
        'Tested three ad variants per city and kept the ones that drove purchases, not just clicks.',
      ),
      t(
        'Сузил показ до точек в жилых районах и возраста 25–54 — бюджет перестал уходить на случайную аудиторию.',
        'Narrowed delivery to residential areas and ages 25–54, so the budget stopped leaking to random audiences.',
      ),
      t(
        'Настроил сквозную аналитику: Яндекс Метрика и UTM-метки — видно, какое объявление привело к покупке.',
        'Set up end-to-end tracking with Yandex Metrica and UTM tags to see which ad led to each purchase.',
      ),
      t(
        'Каждый день отправлял клиенту отчёт: расход, покупки, что меняю завтра.',
        'Sent the client a daily report: spend, purchases and what I would change the next day.',
      ),
    ],
    results: [
      {
        label: t('Камчатка, концерт 20.10', 'Kamchatka, concert on 20 Oct'),
        text: t(
          'Одно видеообъявление — 7 покупок по метке, расход на покупку 2 332 ₽',
          'One video ad drove 7 tracked purchases at 2,332 ₽ per purchase',
        ),
      },
      {
        label: t('Камчатка, концерт 20.10', 'Kamchatka, concert on 20 Oct'),
        text: t('Выручка в 2,7 раза больше рекламного бюджета', 'Revenue was 2.7× the ad budget'),
      },
      {
        label: t('Камчатка, концерт 20.10', 'Kamchatka, concert on 20 Oct'),
        text: t('Зал на 21:00 заполнен на 98 % (294 из 300 мест)', 'The 9 pm show was 98% full (294 of 300 seats)'),
        note: t('итог продаж по всем каналам', 'total sales across all channels'),
      },
      {
        label: t('Хабаровск', 'Khabarovsk'),
        text: t('CTR 1,31 %, цена клика 2,7 ₽', 'CTR 1.31%, cost per click 2.7 ₽'),
      },
      {
        label: t('Благовещенск, концерт 05.11', 'Blagoveshchensk, concert on 5 Nov'),
        text: t('Выручка с рекламы VK в 4 раза больше расхода', 'Revenue from VK ads was 4× the ad spend'),
      },
      {
        label: t('VK Реклама, 10–24 октября', 'VK Ads, 10–24 Oct'),
        text: t('637 кликов при CTR 2,74 %, средняя цена клика 2,28 ₽', '637 clicks at a 2.74% CTR, average cost per click 2.28 ₽'),
        note: t('выборка из 4 кампаний с CTR выше 2,5 % — не итог всего проекта', 'a sample of 4 campaigns with CTR above 2.5% — not the whole project'),
      },
      {
        label: t('Яндекс Директ, 30 дней', 'Yandex Direct, 30 days'),
        text: t('Расход 16 060 ₽ — доход по целям 123 600 ₽, ДРР 13 %', 'Spend 16,060 ₽ — goal revenue 123,600 ₽, ad cost share 13%'),
        note: t('249 конверсий; данные о конверсиях за последние дни могут быть неполными', '249 conversions; conversion data for the last few days may be incomplete'),
      },
      {
        label: t('Яндекс Метрика, 19–25 октября', 'Yandex Metrica, 19–25 Oct'),
        text: t('Цель «Купил билет» — 9 достижений, доход по цели 48 500 ₽', '“Bought a ticket” goal — 9 completions, 48,500 ₽ goal revenue'),
        note: t('достижения цели не равны количеству проданных билетов', 'goal completions are not the same as the number of tickets sold'),
      },
    ],
    resultsSource: t('VK Реклама, Яндекс Директ, Яндекс Метрика, UTM-метки', 'VK Ads, Yandex Direct, Yandex Metrica, UTM tags'),
    resultsPeriod: t('периоды продаж до дат концертов', 'sales periods leading up to each concert'),
    highlights: [
      { value: t('×4', '×4'), label: t('выручка к расходу, Благовещенск', 'revenue to ad spend, Blagoveshchensk') },
      { value: t('2 332 ₽', '2,332 ₽'), label: t('за покупку, Камчатка, одно видеообъявление', 'per purchase, Kamchatka, one video ad') },
      { value: t('98 %', '98%'), label: t('зал заполнен — итог по всем каналам продаж', 'seats sold — total across all sales channels') },
    ],
    testimonial: {
      text: t(
        'Вижу тенденцию, что билеты стали продаваться каждый день',
        'I can see the trend: tickets are now selling every day',
      ),
      // TODO: имя/должность — только с разрешения клиента. Пока не задано — подпись по умолчанию.
      author: undefined,
    },
    // обложка с русским текстом — в EN остаётся CSS-обложка «свет свечей»
    cover: { ...shot('ads-lumos/cover', 'Концерт при свечах: 637 кликов, CTR 2,74 %', 'Candlelight concert: 637 clicks, 2.74% CTR') },
    coverLocales: ['ru'],
    gallery: [
      shot('ads-lumos/vk', 'VK Реклама: четыре кампании, 10–24 октября', 'VK Ads: four campaigns, 10–24 Oct', 'Сравнение объявлений по кабинету — видно, какие кампании дают дешёвый клик', 'Ad comparison from the ad account: which campaigns deliver cheap clicks'),
      shot('ads-lumos/direct', 'Яндекс Директ: расход, клики, конверсии и доход по кампаниям', 'Yandex Direct: spend, clicks, conversions and revenue by campaign', 'Каждая кампания — с расходом, ценой конверсии и долей рекламных расходов', 'Every campaign with spend, cost per conversion and ad cost share'),
      shot('ads-lumos/metrika', 'Яндекс Метрика: цель «Купил билет» по кампаниям Директа', 'Yandex Metrica: the “Bought a ticket” goal by Direct campaign', 'Сквозная аналитика: от клика по объявлению до покупки билета', 'End-to-end tracking: from the ad click to the ticket purchase'),
    ],
  },
  {
    slug: 'maps-cafe-1',
    year: 2026,
    category: 'maps',
    tags: [TAG.maps, TAG.photo],
    clientName: t('Чайка Ливингстон', 'Chaika Livingston'),
    clientAnonymous: t('Ресторан, 2 500+ отзывов на Яндекс Картах', 'Restaurant with 2,500+ reviews on Yandex Maps'),
    title: t('Новые фото меню для карточки ресторана', 'New menu photos for a restaurant listing'),
    summary: t(
      'Фото блюд в карточке были тёмными и случайными. Привёл меню к единому аппетитному стилю.',
      'The dish photos on the listing were dark and inconsistent. I brought the menu to one appetising style.',
    ),
    task: t(
      'Фото блюд в меню карточки снимались на телефон — тёмные, с неровным светом и случайным фоном. На фоне конкурентов блюда выглядели менее аппетитно, хотя у заведения сильная репутация.',
      'The menu photos on the listing were shot on a phone: dark, unevenly lit, with random backgrounds. Next to competitors the dishes looked less appetising, despite the restaurant’s strong reputation.',
    ),
    steps: [
      t('Отобрал позиции, которые чаще всего смотрят в меню.', 'Picked the dishes people view most often in the menu.'),
      t(
        'Обработал фото: свет, цвет, фон, кадрирование под формат карточки.',
        'Edited the photos: light, colour, background and cropping for the listing format.',
      ),
      t('Привёл все снимки к единому стилю.', 'Brought every shot to one consistent style.'),
      t('Заменил фото в меню карточки.', 'Replaced the photos in the listing menu.'),
    ],
    results: [],
    beforeAfter: { before: '/projects/maps-cafe-1/before.webp', after: '/projects/maps-cafe-1/after.webp', w: 915, h: 1280 },
    gallery: [
      dish('maps-cafe-1', 1, 'Обновлённое фото блюда', 'Updated dish photo'),
      dish('maps-cafe-1', 2, 'Обновлённое фото блюда', 'Updated dish photo'),
      dish('maps-cafe-1', 3, 'Обновлённое фото блюда', 'Updated dish photo'),
    ],
  },
  {
    slug: 'site-mdk',
    year: 2026,
    category: 'site',
    tags: [TAG.landing, TAG.analytics],
    clientName: t('MDK Регионы', 'MDK Regions'),
    clientAnonymous: t('Региональная медиасеть, 19 регионов', 'Regional media network, 19 regions'),
    title: t('Лендинг для региональной медиасети', 'Landing page for a regional media network'),
    summary: t(
      'Сайт, который объясняет услуги для бизнеса и собирает заявки из 19 регионов.',
      'A site that explains the services to businesses and collects leads from 19 regions.',
    ),
    task: t(
      'Нужен сайт, который объясняет услуги для бизнеса и собирает заявки из 19 регионов.',
      'The network needed a site that explains its services to businesses and collects leads from 19 regions.',
    ),
    steps: [
      t('Структура лендинга: услуги, цены, этапы, FAQ, отзывы.', 'Landing page structure: services, pricing, process, FAQ, reviews.'),
      t('Дизайн в фирменном стиле.', 'Design in the brand’s visual style.'),
      t('Форма заявок с отправкой в Telegram и защитой от спама.', 'Lead form that posts to Telegram, with spam protection.'),
      t('Яндекс Метрика с целями, адаптивная вёрстка, SEO-разметка.', 'Yandex Metrica with goals, responsive layout, SEO markup.'),
    ],
    results: [],
    cover: { src: '/projects/site-mdk/cover.webp', w: 960, h: 1333, alt: t('Главный экран лендинга', 'Landing page hero') },
    gallery: [
      { src: '/projects/site-mdk/d_1.webp', w: 960, h: 1333, alt: t('Десктоп: первый экран', 'Desktop: hero') },
      { src: '/projects/site-mdk/d_3.webp', w: 960, h: 1333, alt: t('Десктоп: услуги', 'Desktop: services') },
      { src: '/projects/site-mdk/d_5.webp', w: 960, h: 961, alt: t('Десктоп: форма заявки', 'Desktop: lead form') },
      { src: '/projects/site-mdk/m_3.webp', w: 390, h: 3400, alt: t('Мобильная версия', 'Mobile version'), tall: true },
      { src: '/projects/site-mdk/m_4.webp', w: 390, h: 3400, alt: t('Мобильная версия', 'Mobile version'), tall: true },
    ],
  },
  {
    slug: 'maps-cafe-2',
    year: 2026,
    category: 'maps',
    tags: [TAG.maps, TAG.photo],
    clientName: t('Поток Вкуса', 'Potok Vkusa'),
    clientAnonymous: t('Кафе домашней кухни', 'Home-style café'),
    title: t('Обложки историй и фото меню для кафе', 'Story covers and menu photos for a café'),
    summary: t(
      'Фото с витрины с бликами заменил на чистые снимки в тёплом свете и единой подаче.',
      'Replaced glare-filled counter shots with clean, warm, consistent photos.',
    ),
    task: t(
      'Обложки историй и фото комбо-обедов в карточке были сняты на витрине, с бликами и посторонними предметами.',
      'The story covers and combo-lunch photos on the listing were shot at the counter, with glare and clutter in frame.',
    ),
    steps: [
      t(
        'Обновил обложки историй: «Мангал», «Салаты», «Доставка».',
        'Refreshed the story covers: Grill, Salads, Delivery.',
      ),
      t(
        'Обновил фото позиций меню: комбо-обеды, ужины, кус-кус.',
        'Refreshed menu photos: combo lunches, dinners, couscous.',
      ),
      t('Чистый фон, тёплый свет, единая подача.', 'Clean backgrounds, warm light, one consistent look.'),
    ],
    results: [],
    beforeAfter: { before: '/projects/maps-cafe-2/before.webp', after: '/projects/maps-cafe-2/after.webp', w: 921, h: 1280 },
    gallery: [
      dish('maps-cafe-2', 1, 'Обновлённое фото позиции меню', 'Updated menu item photo'),
      dish('maps-cafe-2', 2, 'Обновлённое фото позиции меню', 'Updated menu item photo'),
      dish('maps-cafe-2', 3, 'Обновлённое фото позиции меню', 'Updated menu item photo'),
    ],
  },
  {
    slug: 'site-trainer',
    year: 2026,
    category: 'site',
    tags: [TAG.site],
    clientName: t('Сайт персонального фитнес-тренера', 'Website for a personal fitness coach'),
    clientAnonymous: t('Сайт персонального фитнес-тренера', 'Website for a personal fitness coach'),
    title: t('Сайт тренера с калькулятором КБЖУ', 'Coach website with a macro calculator'),
    summary: t(
      'Сайт-визитка, который вовлекает: бесплатный калькулятор КБЖУ — первый шаг к записи.',
      'A personal site that engages visitors: a free macro calculator is the first step to booking.',
    ),
    task: t(
      'Сайт-визитка тренера, который не просто рассказывает, а вовлекает посетителя.',
      'A personal website for a coach that doesn’t just inform, but gets visitors involved.',
    ),
    steps: [
      t(
        'Структура: обо мне, тренировки, диагностика, питание, раздел для фитнес-клубов.',
        'Structure: about, training, assessment, nutrition, a section for gyms.',
      ),
      t('Бесплатный калькулятор КБЖУ как первый шаг к записи.', 'A free macro calculator as the first step to booking.'),
      t('Тёмный премиальный дизайн, адаптивная вёрстка.', 'Dark premium design, fully responsive.'),
    ],
    results: [],
    cover: { src: '/projects/site-trainer/cover.webp', w: 1440, h: 875, alt: t('Первый экран сайта', 'Website hero') },
    gallery: [],
  },
  {
    slug: 'ads-barber',
    year: 2026,
    category: 'ads',
    tags: [TAG.direct, TAG.vk],
    clientName: t('Барбершоп, Симферополь', 'Barbershop, Simferopol'),
    clientAnonymous: t('Барбершоп, Симферополь', 'Barbershop, Simferopol'),
    title: t('Реклама барбершопа в Симферополе: Яндекс Директ и VK Реклама', 'Barbershop ads in Simferopol: Yandex Direct and VK Ads'),
    summary: t(
      'Настроил рекламу в Яндекс Директе и VK, чтобы барбершоп получал записи от жителей города.',
      'Set up Yandex Direct and VK ads so the barbershop gets bookings from people in the city.',
    ),
    task: t(
      'Привести в барбершоп новых клиентов из Симферополя: звонки и заявки на стрижку и оформление бороды.',
      'Bring new clients from Simferopol to the barbershop: calls and booking requests for haircuts and beard trims.',
    ),
    steps: [
      t('Настроил кампании в Яндекс Директе: поиск по запросам на стрижку и бороду, показ в сетях.', 'Set up Yandex Direct campaigns: search for haircut and beard queries, plus display network.'),
      t('Запустил таргетированную рекламу во VK на жителей города.', 'Launched targeted VK ads for people living in the city.'),
      t('Собрал объявления с понятным действием — «Записаться».', 'Built ads around one clear action: book a visit.'),
    ],
    results: [],
    cover: shot('ads-barber/report', 'Отчёт по рекламе барбершопа: структура кампаний и показатели', 'Barbershop ad report: campaign structure and metrics'),
    // на иллюстрации — формат отчёта; цифры по проекту не сохранились, поэтому в «Результаты» они не выносятся
    coverCaption: t('Так выглядит отчёт по кампаниям: показы, клики, обращения и цена обращения', 'This is what the campaign report looks like: impressions, clicks, enquiries and cost per enquiry'),
    gallery: [],
  },
];

// ---------- Готовые решения для ниш ----------
// Разработки под типовые задачи ниши: показываются в отдельном разделе «Готовые решения»,
// не в «Кейсах», и не выдаются за работу для конкретного клиента.

PROJECTS.push(
  {
    slug: 'solution-kontur',
    year: 2026,
    category: 'bot',
    isSolution: true,
    directions: ['telegram-bots', 'mini-apps'],
    niche: t('Барбершоп и салон красоты', 'Barbershop and beauty salon'),
    tags: [TAG.bot, TAG.miniApp],
    clientName: t('Барбершоп «Контур»', 'Kontur barbershop'),
    clientAnonymous: t('Барбершоп «Контур»', 'Kontur barbershop'),
    title: t('Онлайн-запись в барбершоп через Telegram: бот и мини-приложение', 'Online booking for a barbershop in Telegram: bot and Mini App'),
    summary: t(
      'Клиент выбирает услугу, мастера и время — и записывается, не выходя из Telegram.',
      'Clients pick a service, a barber and a time — and book without leaving Telegram.',
    ),
    task: t(
      'Клиенты барбершопа пишут в мессенджер и ждут ответа администратора, а часть уходит, так и не записавшись. Нужна запись в пару касаний: без звонков и переписки.',
      'Barbershop clients message and wait for the admin to reply, and some leave without booking. Booking needs to take a couple of taps — no calls or back-and-forth.',
    ),
    steps: [
      t('Бот: выбор услуги → время → подтверждение, с ценой и длительностью.', 'Bot: service → time → confirmation, with price and duration.'),
      t('Мини-приложение: экран с услугами, мастерами и календарём свободного времени.', 'Mini App: a screen with services, barbers and a calendar of free slots.'),
      t('Перенос и отмена записи кнопкой, напоминание клиенту.', 'Reschedule or cancel with one button, plus a reminder to the client.'),
      t('Уведомление мастеру и администратору о каждой записи.', 'A notification to the barber and the admin for every booking.'),
    ],
    results: [],
    cover: shot('solution-kontur/miniapp', 'Mini App барбершопа: услуги, мастер, выбор времени', 'Barbershop Mini App: services, barber, time slot'),
    gallery: [shot('solution-kontur/bot', 'Telegram-бот записи: услуга, время, подтверждение', 'Booking bot: service, time, confirmation', 'Бот: запись в пару сообщений, перенос и отмена кнопкой', 'Bot: booking in a couple of messages, reschedule or cancel with a button')],
  },
  {
    slug: 'solution-lepestok',
    year: 2026,
    category: 'maps',
    isSolution: true,
    directions: ['promotion', 'telegram-bots', 'mini-apps'],
    niche: t('Цветочный магазин и доставка', 'Flower shop and delivery'),
    tags: [TAG.maps, TAG.bot, TAG.miniApp],
    clientName: t('Цветочная мастерская «Лепесток»', 'Lepestok flower studio'),
    clientAnonymous: t('Цветочная мастерская «Лепесток»', 'Lepestok flower studio'),
    title: t('Цветочный магазин: карточка на картах, бот-подборщик и мини-приложение с доставкой', 'Flower shop: map listing, bouquet bot and a delivery Mini App'),
    summary: t(
      'Покупатель находит магазин на картах, подбирает букет под повод и бюджет и оформляет доставку в Telegram.',
      'Shoppers find the store on the map, pick a bouquet by occasion and budget, and order delivery in Telegram.',
    ),
    task: t(
      'Цветы покупают срочно и с телефона. Нужно, чтобы магазин находили на картах, а выбрать букет и оформить доставку можно было за пару минут.',
      'Flowers are bought in a hurry and on a phone. The shop needs to be found on the map, and choosing a bouquet and ordering delivery should take a couple of minutes.',
    ),
    steps: [
      t('Карточка на Яндекс Картах: витрина букетов с ценами и обложки историй с кнопкой «Позвонить».', 'Yandex Maps listing: a bouquet showcase with prices and story covers with a Call button.'),
      t('Бот-подборщик: повод → бюджет → готовый вариант с фото и ценой.', 'Bouquet bot: occasion → budget → a ready option with photo and price.'),
      t('Мини-приложение: каталог, корзина, открытка, время доставки и оплата.', 'Mini App: catalogue, cart, card message, delivery slot and payment.'),
    ],
    results: [],
    cover: shot('solution-lepestok/cover', 'Мобильная карточка цветочного магазина на Яндекс Картах', 'Mobile listing for a flower shop on Yandex Maps'),
    coverEn: shot('solution-lepestok/miniapp', 'Mini App цветочного магазина: каталог и оформление заказа', 'Flower shop Mini App: catalogue and checkout'),
    gallery: [
      shot('solution-lepestok/bot', 'Бот подбирает букет по поводу и бюджету', 'The bot picks a bouquet by occasion and budget', 'Бот: повод → бюджет → букет с фото и ценой', 'Bot: occasion → budget → bouquet with photo and price'),
      shot('solution-lepestok/miniapp', 'Mini App: каталог букетов и оформление доставки', 'Mini App: bouquet catalogue and delivery checkout', 'Mini App: каталог, открытка, время доставки и итог к оплате', 'Mini App: catalogue, card message, delivery slot and total'),
    ],
  },
  {
    slug: 'solution-listva',
    year: 2026,
    category: 'maps',
    isSolution: true,
    locales: ['ru'],
    niche: t('Ресторан и кафе', 'Restaurant and café'),
    tags: [TAG.maps, TAG.photo],
    clientName: t('Ресторан «Листва»', 'Listva restaurant'),
    clientAnonymous: t('Ресторан «Листва»', 'Listva restaurant'),
    title: t('Карточка ресторана на Яндекс Картах: обложка, фото и меню в одном стиле', 'A restaurant listing on Yandex Maps: cover, photos and menu in one style'),
    summary: t(
      'Обложка, фото блюд и меню с ценами в едином стиле — ресторан выбирают ещё до визита.',
      'Cover, dish photos and a priced menu in one style — guests choose the restaurant before they visit.',
    ),
    task: t(
      'Гости выбирают ресторан по карточке на картах: по обложке, фото блюд и меню. Случайные фото и меню без цен проигрывают соседям по выдаче.',
      'Guests choose a restaurant from its map listing: the cover, the dish photos and the menu. Random photos and a menu without prices lose to the neighbours in the results.',
    ),
    steps: [
      t('Обложка, которая передаёт атмосферу зала.', 'A cover that conveys the feel of the dining room.'),
      t('Фото блюд крупно и в едином свете.', 'Large dish photos in consistent light.'),
      t('Меню с понятными названиями и ценами, разделы по категориям.', 'A menu with clear names, prices and categories.'),
      t('Обложки историй для актуального: завтраки, меню.', 'Story covers for what matters now: breakfasts, the menu.'),
    ],
    results: [],
    cover: shot('solution-listva/card', 'Карточка ресторана до и после оформления', 'Restaurant listing before and after'),
    gallery: [shot('solution-listva/menu', 'Меню с ценами и обложки историй', 'Priced menu and story covers', 'Меню с фото и ценами, обложки историй', 'Menu with photos and prices, story covers')],
  },
  {
    slug: 'solution-forma',
    year: 2026,
    category: 'site',
    isSolution: true,
    locales: ['ru'],
    niche: t('Фитнес-студия', 'Fitness studio'),
    tags: [TAG.site],
    clientName: t('Студия FORMA', 'FORMA studio'),
    clientAnonymous: t('Студия FORMA', 'FORMA studio'),
    title: t('Сайт фитнес-студии с расписанием и записью', 'Fitness studio website with schedule and booking'),
    summary: t('Направления тренировок, расписание недели и запись в один клик.', 'Training types, a weekly schedule and one-click booking.'),
    task: t(
      'Новичку важно быстро понять, какие есть тренировки, когда они проходят и как записаться. Если для этого нужно звонить, человек откладывает решение.',
      'Newcomers need to see quickly what classes there are, when they run and how to book. If it takes a phone call, people put it off.',
    ),
    steps: [
      t('Первый экран с главным действием — «Выбрать тренировку».', 'A hero built around the main action: choose a class.'),
      t('Направления: силовые, пилатес, восстановление.', 'Class types: strength, Pilates, recovery.'),
      t('Расписание недели с кнопкой «Записаться» у каждого занятия.', 'A weekly schedule with a Book button on every class.'),
    ],
    results: [],
    cover: shot('solution-forma/home', 'Главная страница сайта студии', 'Studio website home page'),
    gallery: [shot('solution-forma/schedule', 'Страница занятий и расписание недели', 'Classes page and weekly schedule', 'Занятие и расписание недели с записью', 'Class page and weekly schedule with booking')],
  },
  {
    slug: 'solution-anatoly',
    year: 2026,
    category: 'site',
    isSolution: true,
    locales: ['ru'],
    niche: t('Частный мастер, ремонт', 'Tradesman, renovation'),
    tags: [TAG.site],
    clientName: t('Сайт частного мастера', 'A tradesman’s website'),
    clientAnonymous: t('Сайт частного мастера', 'A tradesman’s website'),
    title: t('Сайт мастера по сантехнике и ремонту квартир', 'Website for a plumbing and renovation tradesman'),
    summary: t(
      'Услуги, работы «до и после» и кнопка «Обсудить ремонт» — сайт, которому доверяют.',
      'Services, before-and-after work and a Discuss your renovation button — a site people trust.',
    ),
    task: t(
      'Мастера выбирают по доверию: видно ли работы, понятны ли цены и порядок оплаты. Сайт должен снять эти вопросы с первого экрана.',
      'People choose a tradesman on trust: can they see past work, are prices and payment terms clear. The site has to answer that from the first screen.',
    ),
    steps: [
      t('Первый экран: кто вы, что делаете и кнопка «Обсудить ремонт».', 'Hero: who you are, what you do and a Discuss your renovation button.'),
      t('Доверие: смета до начала работ, договор и чек, поэтапная оплата.', 'Trust: an estimate up front, a contract and receipt, staged payment.'),
      t('Страница работы «до и после» с описанием этапов.', 'A before-and-after project page describing each stage.'),
    ],
    results: [],
    cover: shot('solution-anatoly/home', 'Главная страница сайта мастера', 'Tradesman website home page'),
    gallery: [shot('solution-anatoly/bathroom', 'Страница работы: санузел до и после', 'Project page: bathroom before and after', 'Страница работы: санузел до и после', 'Project page: bathroom before and after')],
  },
  {
    slug: 'solution-tiho',
    year: 2026,
    category: 'site',
    isSolution: true,
    locales: ['ru'],
    niche: t('Кофейня', 'Coffee shop'),
    tags: [TAG.site],
    clientName: t('Кофейня «ТИХО»', 'TIHO coffee shop'),
    clientAnonymous: t('Кофейня «ТИХО»', 'TIHO coffee shop'),
    title: t('Страница меню кофейни: фото, цены, как добраться', 'Coffee shop menu page: photos, prices, directions'),
    summary: t('Меню с фото и ценами, разделы и кнопка «Как добраться».', 'A menu with photos and prices, sections and a How to get here button.'),
    task: t(
      'Меню кофейни смотрят с телефона по дороге. Нужна страница, где за секунды видно позиции, цены и как дойти.',
      'People check a café menu on their phone on the way. The page should show items, prices and directions in seconds.',
    ),
    steps: [
      t('Разделы меню: кофе, завтраки, выпечка, десерты.', 'Menu sections: coffee, breakfasts, pastries, desserts.'),
      t('Позиции с фото, объёмом и ценой.', 'Items with photos, size and price.'),
      t('Кнопка «Как добраться» в шапке и в конце страницы.', 'A How to get here button in the header and at the bottom.'),
    ],
    results: [],
    cover: shot('solution-tiho/cover', 'Страница меню кофейни', 'Coffee shop menu page'),
    gallery: [],
  },
  {
    slug: 'solution-zerno',
    year: 2026,
    category: 'site',
    isSolution: true,
    niche: t('Кафе и кофейня', 'Café and coffee shop'),
    tags: [TAG.site],
    clientName: t('Кофейня «Зерно»', 'Zerno coffee shop'),
    clientAnonymous: t('Кофейня «Зерно»', 'Zerno coffee shop'),
    title: t('Сайт кофейни: меню, бронь стола, маршрут', 'Coffee shop website: menu, table booking, directions'),
    summary: t('Меню с ценами, бронь стола и как добраться — всё, что ищут гости заведения.', 'Menu with prices, table booking and directions — everything guests look for.'),
    task: t(
      'Гость заведения ищет на сайте три вещи: меню с ценами, как забронировать стол и как добраться. Всё остальное мешает.',
      'A venue’s guests look for three things on its site: a priced menu, how to book a table and how to get there. Everything else gets in the way.',
    ),
    steps: [
      t('Первый экран с главным действием — «Забронировать стол».', 'A hero built around the main action: book a table.'),
      t('Меню с ценами и фото, понятное с телефона.', 'A menu with prices and photos that reads well on a phone.'),
      t('Адрес, часы работы и маршрут — в одном блоке.', 'Address, opening hours and directions in one block.'),
    ],
    results: [],
    cover: { src: '/projects/solution-zerno/cover.webp', w: 1200, h: 2245, alt: t('Сайт кофейни', 'Coffee shop website') },
    coverEn: { src: '/projects/solution-zerno/cover-en.webp', w: 1440, h: 2372, alt: t('Сайт кофейни', 'Coffee shop website') },
    gallery: [
      { src: '/projects/solution-zerno/cafe-hero.webp', w: 1000, h: 558, alt: t('Интерьер кофейни', 'Coffee shop interior') },
      { src: '/projects/solution-zerno/cafe-cappuccino.webp', w: 1000, h: 1000, alt: t('Капучино', 'Cappuccino') },
      { src: '/projects/solution-zerno/cafe-croissant.webp', w: 1000, h: 1000, alt: t('Круассан', 'Croissant') },
      { src: '/projects/solution-zerno/cafe-dessert.webp', w: 1000, h: 1000, alt: t('Десерт', 'Dessert') },
    ],
  },
  {
    slug: 'solution-gbp',
    year: 2026,
    category: 'maps',
    isSolution: true,
    locales: ['en'],
    niche: t('Пекарня за рубежом', 'Bakery abroad'),
    tags: [t('Профиль в Google', 'Google Business Profile'), t('Фото', 'Photos')],
    clientName: t('Пекарня Kolos, Берлин', 'Kolos Bakery, Berlin'),
    clientAnonymous: t('Пекарня Kolos, Берлин', 'Kolos Bakery, Berlin'),
    title: t('Профиль компании в Google для пекарни: до и после', 'A Google Business Profile for a bakery: before and after'),
    summary: t(
      'Как выглядит профиль до и после: категории, часы, фото, описание, ответы на отзывы.',
      'What a profile looks like before and after: categories, hours, photos, description and review replies.',
    ),
    task: t(
      'У русскоязычного бизнеса за рубежом часто хороший продукт, но пустой профиль: нет часов работы, два тёмных фото, отзывы без ответов.',
      'Russian-speaking businesses abroad often have a great product but a bare profile: no opening hours, two dark photos and unanswered reviews.',
    ),
    steps: [
      t('Основная и дополнительные категории, услуги и атрибуты.', 'Primary and secondary categories, services and attributes.'),
      t('Часы работы, включая праздники, ссылка на меню и заказ.', 'Opening hours including holidays, plus menu and order links.'),
      t('Светлые фото витрины и продукции в едином стиле.', 'Bright, consistent photos of the counter and products.'),
      t('Описание с районом и отличиями, ответы на все отзывы.', 'A description that names the area and what makes it different, plus replies to every review.'),
    ],
    results: [],
    beforeAfter: { before: '/projects/solution-gbp/before.webp', after: '/projects/solution-gbp/after.webp', w: 860, h: 1800, focus: 'top' },
    gallery: [],
  },
  {
    slug: 'solution-clinic',
    year: 2026,
    category: 'site',
    isSolution: true,
    locales: ['en'],
    niche: t('Клиника за рубежом', 'Clinic abroad'),
    tags: [t('Лендинг', 'Landing page'), t('Google Ads', 'Google Ads')],
    clientName: t('Стоматология Smile & Co, Лимассол', 'Smile & Co dental clinic, Limassol'),
    clientAnonymous: t('Стоматология Smile & Co, Лимассол', 'Smile & Co dental clinic, Limassol'),
    title: t('Двуязычный лендинг для стоматологии под Google Ads', 'A bilingual dental clinic landing page for Google Ads'),
    summary: t('Лендинг под Google Ads: цены, врачи, запись в два клика, RU/EN.', 'A landing page built for Google Ads: prices, dentists, two-click booking, RU/EN.'),
    task: t(
      'Реклама в Google часто ведёт на общий сайт клиники, где цены спрятаны, а записаться можно только по телефону. Нужна страница под запрос из рекламы.',
      'Google Ads traffic often lands on a clinic’s generic site where prices are hidden and booking is phone-only. It needs a page that matches the ad query.',
    ),
    steps: [
      t('Первый экран под конкретный запрос из рекламы.', 'A hero matched to the exact ad search query.'),
      t('Прозрачные цены на популярные услуги.', 'Transparent prices for the most popular treatments.'),
      t('Запись в два клика: форма, WhatsApp, Telegram.', 'Two-click booking: form, WhatsApp, Telegram.'),
      t('Переключение RU/EN и отслеживание заявок в GA4.', 'RU/EN switch and lead tracking in GA4.'),
    ],
    results: [],
    cover: { src: '/projects/solution-clinic/cover.webp', w: 1440, h: 1000, alt: t('Лендинг стоматологии', 'Dental clinic landing page') },
    gallery: [
      { src: '/projects/solution-clinic/full.webp', w: 1425, h: 2154, alt: t('Лендинг целиком', 'Full landing page') },
      { src: '/projects/solution-clinic/mobile.webp', w: 375, h: 3055, alt: t('Мобильная версия', 'Mobile version'), tall: true },
    ],
  },
);

/** Реальные кейсы на главной — по порядку */
export const HOME_CASES: Record<Locale, string[]> = {
  ru: ['ads-lumos', 'ads-barber', 'site-mdk', 'site-trainer', 'maps-cafe-1', 'maps-cafe-2'],
  en: ['ads-lumos', 'ads-barber', 'site-mdk', 'site-trainer', 'maps-cafe-1'],
};

/** Готовые решения на главной — по порядку */
export const HOME_SOLUTIONS: Record<Locale, string[]> = {
  // «Зерно» на главной не выводится (два решения для кофеен — лишнее), страница доступна по ссылке и в примерах направления
  ru: ['solution-kontur', 'solution-lepestok', 'solution-listva', 'solution-forma', 'solution-anatoly', 'solution-tiho'],
  en: ['solution-kontur', 'solution-lepestok', 'solution-gbp', 'solution-clinic', 'solution-zerno'],
};

/** К какому направлению относится работа по категории (если не задано directions) */
const CATEGORY_DIRECTION: Record<ProjectCategory, DirectionId> = { ads: 'promotion', maps: 'promotion', site: 'websites', bot: 'telegram-bots' };

export function directionsOf(p: Project): DirectionId[] {
  return p.directions ?? [CATEGORY_DIRECTION[p.category]];
}

function bySlugs(slugs: string[], locale: Locale) {
  return slugs.map((s) => getProject(s)).filter((p): p is Project => Boolean(p) && isVisible(p!, locale));
}

/** Работы направления для блока «Примеры» на странице направления: сначала кейсы, потом готовые решения */
export function projectsForDirection(direction: DirectionId, locale: Locale) {
  const solutions = [...HOME_SOLUTIONS[locale], ...PROJECTS.filter((p) => p.isSolution && !HOME_SOLUTIONS[locale].includes(p.slug)).map((p) => p.slug)];
  return bySlugs([...HOME_CASES[locale], ...solutions], locale).filter((p) => directionsOf(p).includes(direction));
}

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function isVisible(p: Project, locale: Locale) {
  return !p.locales || p.locales.includes(locale);
}

export function homeProjects(locale: Locale) {
  return bySlugs(HOME_CASES[locale], locale);
}

export function homeSolutions(locale: Locale) {
  return bySlugs(HOME_SOLUTIONS[locale], locale);
}

/** Соседние работы того же раздела — для навигации «Предыдущая / Следующая» на странице работы */
export function neighbours(p: Project, locale: Locale) {
  const list = p.isSolution ? homeSolutions(locale) : homeProjects(locale);
  const i = list.findIndex((x) => x.slug === p.slug);
  if (i < 0 || list.length < 2) return { prev: undefined, next: undefined };
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
}

export function coverFor(p: Project, locale: Locale) {
  if (locale === 'en' && p.coverEn) return p.coverEn;
  return !p.coverLocales || p.coverLocales.includes(locale) ? p.cover : undefined;
}

export function galleryFor(p: Project, locale: Locale) {
  return (locale === 'en' && p.galleryEn) || p.gallery;
}

export function clientLabel(p: Project, locale: Locale) {
  if (p.isSolution && p.niche) return p.niche[locale];
  return (SHOW_CLIENT_NAMES ? p.clientName : p.clientAnonymous)[locale];
}
