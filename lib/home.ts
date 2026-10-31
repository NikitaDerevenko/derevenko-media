// Тексты новой главной (RU и EN). Цены берутся из lib/site.ts через lib/pricing.ts — здесь чисел нет.
import { getDict } from './i18n';
import { packagePrice, servicePrice } from './pricing';
import { marketOf, type Locale, type PackageId, type ServiceId } from './site';

export type QuizOption = { v: string; label: string; hint?: string };
export type QuizResult = { price: string; term: string; items: string[] };

export function homeCopy(locale: Locale) {
  const market = marketOf(locale);
  const w = getDict(locale).common;
  const sp = (id: ServiceId) => servicePrice(id, market, locale, w);
  const pp = (id: PackageId) => packagePrice(id, market, locale, w);
  // «15 000–25 000 ₽» → «15–25 тыс. ₽» для крупных плашек
  const short = (s: string) => (locale === 'ru' ? s.replace(/(\d+)[\s\u00a0\u202f]000–(\d+)[\s\u00a0\u202f]000[\s\u00a0\u202f]₽/, '$1–$2 тыс.\u00a0₽') : s);

  if (locale === 'ru') {
    const site = short(sp('landing'));
    const card = short(sp('website'));
    return {
      hero: {
        title: 'Сайты и реклама, которые приводят клиентов',
        sub: 'Делаю сайт, запускаю Яндекс Директ и VK Рекламу и веду до заявок. Сам, без менеджеров. Работаю по договору и выдаю чек, а сайт, кабинеты и все доступы оформляю на вас.',
        cta: 'Обсудить проект',
        calc: 'Рассчитать стоимость',
        who: 'Отвечаю сам · обычно в течение часа',
        prices: [
          { label: 'Лендинг', price: site, term: '5–10 рабочих дней' },
          { label: 'Сайт-визитка', price: card, term: '10–14 рабочих дней' },
          { label: 'Реклама под ключ', price: sp('vkSetup'), term: 'запуск от 5 дней' },
          { label: 'Сайт + реклама + бот', price: pp('growth'), term: 'пакет «Рост», 14–21 день', hl: true },
        ],
      },
      stage: {
        sites: [
          { src: '/home/mdk.webp', url: 'mdk-regions-biznes.ru' },
          { src: '/home/kodgoda.webp', url: 'kodgoda.ru' },
        ],
        adSource: 'Реклама · ваш-бизнес.ru',
        adTitle: 'Лендинг для вашего бизнеса под ключ',
        adText: 'Заявки в Telegram, запуск за 5–10 дней',
        adBtn: 'Перейти на сайт',
        toastTitle: 'Новая заявка с сайта',
        toastNow: 'сейчас',
        people: ['Анна · нужен лендинг для студии', 'Игорь · реклама для автосервиса', 'Ольга · бот для записи в салон', 'Марат · сайт для ремонта квартир'],
        leads: 'Заявки за неделю',
        mark: 'Я',
      },
      works: {
        title: 'Работы с цифрами',
        sub: 'Реальные проекты клиентов. Цифры — из рекламных кабинетов и Метрики.',
        all: 'Все работы',
        lumos: {
          kind: 'Реклама · концерты при свечах',
          title: 'Билеты на концерты при свечах в городах Сибири и Дальнего Востока',
          res: [
            { prefix: '×', value: 4, suffix: '', label: 'выручка к расходу' },
            { prefix: '', value: 98, suffix: ' %', label: 'зал заполнен' },
            { prefix: '', value: 13, suffix: ' %', label: 'доля расходов в Директе' },
          ],
        },
        mdk: { kind: 'Сайт · медиасеть, 19 регионов', title: 'Сайт с расчётом стоимости в 4 шага: клиент сам видит цену и план' },
        kodgoda: { kind: 'Сайт + Telegram-бот · нумеролог', title: 'Бесплатный расчёт прямо на странице, оплата разбора через бота' },
        barber: { kind: 'Директ + VK + бот · барбершоп', title: 'Запись в барбершоп Симферополя' },
        cafe: { kind: 'Яндекс Карты · ресторан, 2 500+ отзывов', title: 'Меню, которое хочется открыть', before: 'До', after: 'После' },
      },
      calc: {
        title: 'Сколько будет стоить ваш проект',
        sub: 'Три вопроса — и вы видите вилку цены, срок и что входит. Без звонков и «оставьте телефон».',
        step: 'Шаг {n} из 3',
        done: 'Готово',
        priceLabel: 'Ориентир по цене',
        cta: 'Обсудить проект',
        again: 'Пройти заново',
        noSiteNote: 'Без сайта рекламе некуда вести — поэтому сразу показываю комплект.',
        questions: [
          {
            title: 'Что нужно бизнесу?',
            key: 'what',
            options: [
              { v: 'site', label: 'Сайт', hint: 'лендинг или визитка' },
              { v: 'ads', label: 'Реклама', hint: 'Директ, VK, Карты' },
              { v: 'both', label: 'Сайт + реклама', hint: 'всё под ключ' },
              { v: 'bot', label: 'Бот или мини-приложение', hint: 'заявки и запись в Telegram' },
            ],
          },
          {
            title: 'Сайт у вас уже есть?',
            key: 'has',
            options: [
              { v: 'no', label: 'Нет, нужен с нуля' },
              { v: 'old', label: 'Есть, но старый', hint: 'не приносит заявки' },
              { v: 'ok', label: 'Есть и работает', hint: 'нужен трафик' },
            ],
          },
          {
            title: 'Когда хотите запуститься?',
            key: 'when',
            options: [
              { v: 'asap', label: 'Как можно скорее' },
              { v: 'month', label: 'В течение месяца' },
              { v: 'look', label: 'Пока присматриваюсь' },
            ],
          },
        ],
        results: {
          site: { price: `${site.split('–')[0]}–${card.split('–')[1]}`, term: '5–14 рабочих дней', items: ['Структура и тексты под ваших клиентов', 'Дизайн и адаптив под телефон', 'Форма с заявками в Telegram', 'Яндекс Метрика с целями'] },
          ads: { price: sp('vkSetup'), term: 'запуск от 5 дней', items: ['Анализ конкурентов и ключевые фразы', 'Объявления и креативы', 'Метрика и цели', '14 дней контроля расхода'] },
          both: { price: pp('growth'), term: '14–21 день · пакет «Рост»', items: ['Лендинг с формой заявок', 'Бот для заявок в Telegram', 'Директ или VK + Метрика', 'Ведение рекламы первый месяц'] },
          bot: { price: sp('botLeads'), term: 'от 7 дней', items: ['Сценарий под вашу воронку', 'Заявки и запись прямо в Telegram', 'Уведомления вам и клиенту', `Мини-приложение — ${sp('miniApp')}`] },
        } as Record<string, QuizResult>,
      },
      pricing: {
        title: 'Что сколько стоит',
        sub: 'Цены и сроки — заранее. Под каждой услугой — что вы получите. Итог фиксируем в договоре.',
        cols: [
          {
            title: 'Сайты',
            for: 'Для тех, кому нужен сайт с нуля или переделка старого',
            href: 'websites',
            rows: [
              { name: 'Лендинг', note: '1 страница, до 10 блоков, тексты, форма, Метрика', id: 'landing' as ServiceId },
              { name: 'Сайт-визитка', note: '3–5 страниц: услуги, цены, о вас, контакты', id: 'website' as ServiceId },
              { name: 'Сайт под задачу', note: 'каталог, личный кабинет, интеграции', id: 'customSite' as ServiceId },
              { name: 'Поддержка', note: 'правки, обновления, копии', id: 'siteSupport' as ServiceId },
            ],
            cta: 'Обсудить сайт',
          },
          {
            title: 'Реклама',
            for: 'Яндекс Директ, VK Реклама и карточка на Яндекс Картах',
            href: 'promotion',
            rows: [
              { name: 'Настройка Директа', note: '+ контроль расхода 14 дней', id: 'directSetup' as ServiceId },
              { name: 'Настройка VK Рекламы', note: '+ контроль расхода 14 дней', id: 'vkSetup' as ServiceId },
              { name: 'Ведение рекламы', note: 'оптимизация, тесты, отчёт раз в месяц', id: 'adsManage' as ServiceId },
              { name: 'Карточка на Яндекс Картах', note: 'описание, услуги, фото, истории', id: 'mapsSetup' as ServiceId },
            ],
            cta: 'Обсудить рекламу',
          },
        ],
        bundle: {
          badge: 'Выгоднее всего',
          title: 'Сайт + реклама',
          for: 'Всё под ключ: сделал сайт, привёл на него клиентов',
          items: ['Лендинг с формой заявок', 'Бот для заявок в Telegram', 'Директ или VK + Метрика с целями', 'Ведение рекламы первый месяц'],
          name: 'Пакет «Рост» · 14–21 день',
          price: pp('growth'),
          cta: 'Хочу под ключ',
        },
        more: 'Подробнее об услугах',
        bots: { text: 'Ещё делаю Telegram-ботов и мини-приложения:', link: 'боты от ' + sp('botForm').replace('от ', '') },
        note: 'Рекламный бюджет оплачивается отдельно, напрямую в Яндекс или VK. Я самозанятый: договор и чек, без НДС.',
      },
      process: {
        title: 'Как проходит работа',
        sub: 'От первого сообщения до заявок — на примере лендинга с рекламой.',
        get: 'Вы получаете',
        steps: [
          { day: 'День 1', title: 'Обсуждаем задачу', text: '15 минут в Telegram или созвон: что продаёте, кому, что уже есть.', get: 'план, смету и сроки' },
          { day: 'Дни 2–3', title: 'Структура и тексты', text: 'Пишу тексты под ваших клиентов, собираю структуру страницы.', get: 'макет на согласование' },
          { day: 'Дни 4–10', title: 'Дизайн и запуск', text: 'Делаю сайт, подключаю заявки в Telegram, Метрику, настраиваю рекламу.', get: 'работающий сайт и рекламу' },
          { day: 'Каждый месяц', title: 'Заявки и отчёт', text: 'Слежу за расходом, убираю лишнее, усиливаю то, что работает.', get: 'отчёт простым языком' },
        ],
      },
      keep: {
        title: 'Что остаётся у вас',
        items: [
          { title: 'Сайт на вашем домене', text: 'Быстрый, удобный с телефона, с понятными ценами и кнопкой заявки.' },
          { title: 'Заявки прямо в Telegram', text: 'Каждая заявка — сразу вам в мессенджер и в таблицу.' },
          { title: 'Видно, откуда клиенты', text: 'Метрика с целями и UTM-метками: сколько стоит заявка из каждого канала.' },
          { title: 'Реклама под контролем', text: 'Директ и VK с контролем расхода и отчётом раз в месяц.' },
          { title: 'Все доступы — ваши', text: 'Домен, хостинг, кабинеты и счётчики оформлены на вас.' },
          { title: 'Запуск в срок', text: 'Или −20 % на работы этапа. Остановить работу можно в любой момент.' },
        ],
      },
      reviews: { title: 'Что говорят клиенты', all: 'Все отзывы в Telegram' },
      about: {
        title: 'Работаю как владелец бизнеса, а не как агентство',
        stats: [
          { value: 'с 2016', label: 'в рекламе' },
          { value: '19', label: 'регионов в сети MDK' },
          { value: '24 ч', label: 'бесплатный разбор' },
        ],
      },
      final: {
        title: 'Расскажите о задаче — пришлю план и смету',
        sub: 'Бесплатно и без обязательств. Отвечаю сам, обычно в течение часа. Можно сразу написать в Telegram, WhatsApp или MAX.',
      },
    };
  }

  const landing = sp('landing');
  return {
    hero: {
      title: 'Websites and ads that bring you clients',
      sub: 'I build your website, launch Google Ads and your Business Profile, and keep going until the leads come in. Directly with me, no account managers. All accounts stay in your name.',
      cta: 'Discuss a project',
      calc: 'Estimate the cost',
      who: 'I reply myself · usually within an hour',
      prices: [
        { label: 'Landing page', price: landing, term: '5–10 business days' },
        { label: 'Website', price: sp('website'), term: '10–14 business days' },
        { label: 'Google Ads setup', price: sp('gadsSetup'), term: 'launch from 5 days' },
        { label: 'Website + ads + bot', price: pp('growth'), term: 'Growth package, 14–21 days', hl: true },
      ],
    },
    stage: {
      sites: [
        { src: '/home/mdk.webp', url: 'mdk-regions-biznes.ru' },
        { src: '/home/kodgoda.webp', url: 'kodgoda.ru' },
      ],
      adSource: 'Sponsored · your-business.com',
      adTitle: 'A landing page for your business, done for you',
      adText: 'Leads straight to Telegram, live in 5–10 days',
      adBtn: 'Visit site',
      toastTitle: 'New lead from the website',
      toastNow: 'now',
      people: ['Anna · needs a studio landing page', 'Mark · ads for a car service', 'Olivia · booking bot for a salon', 'David · site for a renovation firm'],
      leads: 'Leads this week',
      mark: 'G',
    },
    works: {
      title: 'Work with numbers',
      sub: 'Real client projects. Numbers come from ad accounts and analytics.',
      all: 'All work',
      lumos: {
        kind: 'Ads · candlelight concerts',
        title: 'Selling candlelight concert tickets across Siberia and the Far East',
        res: [
          { prefix: '×', value: 4, suffix: '', label: 'revenue to ad spend' },
          { prefix: '', value: 98, suffix: '%', label: 'seats sold' },
          { prefix: '', value: 13, suffix: '%', label: 'ad cost share in Direct' },
        ],
      },
      mdk: { kind: 'Website · media network, 19 regions', title: 'A 4-step cost calculator: clients see the price and plan themselves' },
      kodgoda: { kind: 'Website + Telegram bot · numerologist', title: 'A free reading right on the page, paid readings through the bot' },
      barber: { kind: 'Ads + bot · barbershop', title: 'Bookings for a barbershop in Simferopol' },
      cafe: { kind: 'Maps listing · restaurant, 2,500+ reviews', title: 'A menu people want to open', before: 'Before', after: 'After' },
    },
    calc: {
      title: 'What will your project cost',
      sub: 'Three questions — and you see the price range, timeline and what’s included. No calls, no “leave your number”.',
      step: 'Step {n} of 3',
      done: 'Done',
      priceLabel: 'Estimated price',
      cta: 'Discuss a project',
      again: 'Start over',
      noSiteNote: 'Ads need somewhere to send people — so here’s the bundle.',
      questions: [
        {
          title: 'What does your business need?',
          key: 'what',
          options: [
            { v: 'site', label: 'Website', hint: 'landing page or multi-page' },
            { v: 'ads', label: 'Ads', hint: 'Google Ads, Business Profile' },
            { v: 'both', label: 'Website + ads', hint: 'everything done for you' },
            { v: 'bot', label: 'Bot or Mini App', hint: 'leads and bookings in Telegram' },
          ],
        },
        {
          title: 'Do you already have a website?',
          key: 'has',
          options: [
            { v: 'no', label: 'No, starting from scratch' },
            { v: 'old', label: 'Yes, but it’s outdated', hint: 'brings no leads' },
            { v: 'ok', label: 'Yes, and it works', hint: 'need traffic' },
          ],
        },
        {
          title: 'When do you want to launch?',
          key: 'when',
          options: [
            { v: 'asap', label: 'As soon as possible' },
            { v: 'month', label: 'Within a month' },
            { v: 'look', label: 'Just looking for now' },
          ],
        },
      ],
      results: {
        site: { price: landing, term: '5–14 business days', items: ['Structure and copy for your clients', 'Design that works on phones', 'Lead form straight to Telegram', 'Analytics with goals'] },
        ads: { price: sp('gadsSetup'), term: 'launch from 5 days', items: ['Competitor and keyword research', 'Ads and creatives', 'Conversion tracking', 'Spend monitoring for the first weeks'] },
        both: { price: pp('growth'), term: '14–21 days · Growth package', items: ['Landing page with a lead form', 'Lead bot in Telegram', 'Google Ads + Business Profile', 'First month of ad management'] },
        bot: { price: sp('botLeads'), term: 'from 7 days', items: ['A flow built around your funnel', 'Leads and bookings right in Telegram', 'Notifications for you and the client', `Mini App — ${sp('miniApp')}`] },
      } as Record<string, QuizResult>,
    },
    pricing: {
      title: 'What it costs',
      sub: 'Prices and timelines up front. Under each service — what you get. The final quote goes into the agreement.',
      cols: [
        {
          title: 'Websites',
          for: 'For a new website or a rebuild of an old one',
          href: 'websites',
          rows: [
            { name: 'Landing page', note: 'one page, copy, lead form, analytics', id: 'landing' as ServiceId },
            { name: 'Website', note: 'services, prices, about, contacts', id: 'website' as ServiceId },
            { name: 'Custom website', note: 'catalogue, client area, integrations', id: 'customSite' as ServiceId },
            { name: 'Support', note: 'edits, updates, backups', id: 'siteSupport' as ServiceId },
          ],
          cta: 'Discuss a website',
        },
        {
          title: 'Ads',
          for: 'Google Ads, Google Business Profile and analytics',
          href: 'promotion',
          rows: [
            { name: 'Google Ads setup', note: 'campaigns, keywords, tracking', id: 'gadsSetup' as ServiceId },
            { name: 'Google Ads management', note: 'optimisation, tests, monthly report', id: 'gadsManage' as ServiceId },
            { name: 'Business Profile setup', note: 'description, services, photos', id: 'gbpSetup' as ServiceId },
            { name: 'Analytics setup', note: 'GA4, goals, UTM tags', id: 'analytics' as ServiceId },
          ],
          cta: 'Discuss ads',
        },
      ],
      bundle: {
        badge: 'Best value',
        title: 'Website + ads',
        for: 'Everything done for you: a website plus the clients to fill it',
        items: ['Landing page with a lead form', 'Lead bot in Telegram', 'Google Ads + analytics', 'First month of ad management'],
        name: 'Growth package · 14–21 days',
        price: pp('growth'),
        cta: 'I want it done for me',
      },
      more: 'More about services',
      bots: { text: 'I also build Telegram bots and Mini Apps:', link: 'see bots' },
      note: 'Ad budget is paid separately, directly to the ad platform. Agreement and receipt for every job.',
    },
    process: {
      title: 'How we work',
      sub: 'From the first message to leads — using a landing page with ads as an example.',
      get: 'You get',
      steps: [
        { day: 'Day 1', title: 'We discuss the task', text: '15 minutes in Telegram or a call: what you sell, to whom, what you already have.', get: 'a plan, quote and timeline' },
        { day: 'Days 2–3', title: 'Structure and copy', text: 'I write copy for your clients and put together the page structure.', get: 'a mockup to approve' },
        { day: 'Days 4–10', title: 'Design and launch', text: 'I build the site, connect leads to Telegram, set up analytics and ads.', get: 'a working site and ads' },
        { day: 'Every month', title: 'Leads and report', text: 'I watch spend, cut what doesn’t work and scale what does.', get: 'a plain-language report' },
      ],
    },
    keep: {
      title: 'What stays with you',
      items: [
        { title: 'A website on your domain', text: 'Fast, phone-friendly, with clear prices and a lead button.' },
        { title: 'Leads straight to Telegram', text: 'Every lead goes to your messenger and a spreadsheet.' },
        { title: 'You see where clients come from', text: 'Analytics with goals and UTM tags: the cost of a lead from every channel.' },
        { title: 'Ads under control', text: 'Spend monitoring and a report every month.' },
        { title: 'All access is yours', text: 'Domain, hosting, ad accounts and analytics are in your name.' },
        { title: 'Launch on time', text: 'Or 20% off that stage. You can stop at any time.' },
      ],
    },
    reviews: { title: 'What clients say', all: 'All reviews on Telegram' },
    about: {
      title: 'I work like a business owner, not an agency',
      stats: [
        { value: 'Since 2016', label: 'in advertising' },
        { value: '19', label: 'regions in the MDK network' },
        { value: '24 h', label: 'free audit' },
      ],
    },
    final: {
      title: 'Tell me about your task — I’ll send a plan and quote',
      sub: 'Free, no obligations. I reply myself, usually within an hour. You can also message me on Telegram or WhatsApp.',
    },
  };
}

export type HomeCopy = ReturnType<typeof homeCopy>;
