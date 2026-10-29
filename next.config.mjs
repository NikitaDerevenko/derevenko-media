import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
export default function config(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    // заглушечный домен из шаблонов (example + .com) тоже считается незаданным адресом
    if (!url || !/^https?:\/\/[^/]+/.test(url) || url.includes(['example', 'com'].join('.'))) {
      throw new Error(
        '\n\nNEXT_PUBLIC_SITE_URL не задан или некорректен.\n' +
          'Укажите адрес сайта, например NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru, в .env.production или в настройках хостинга.\n' +
          'От него строятся canonical, hreflang, sitemap, robots, Open Graph и JSON-LD.\n',
      );
    }
  }
  return {
    // Сайт собирается в статичные файлы (папка out/) и публикуется на GitHub Pages — своего сервера нет.
    // Заявки принимает функция в Яндекс Облаке (cloud/lead), адрес — NEXT_PUBLIC_LEAD_URL.
    output: 'export',
    poweredByHeader: false,
    images: {
      // на статичном хостинге нет оптимизатора картинок: файлы в public/ уже в webp и нужного размера
      unoptimized: true,
    },
  };
}
