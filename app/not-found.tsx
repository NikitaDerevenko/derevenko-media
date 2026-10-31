import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import './globals.css';

/** 404 с юмором в тематике рекламы и кнопкой к главному действию — бесплатному разбору */
export default function NotFound() {
  const ru = getDict('ru').notFound;
  const en = getDict('en').notFound;
  return (
    <html lang="ru">
      <head>
        <meta name="robots" content="noindex" />
        <title>404 — {ru.title}</title>
      </head>
      <body className="grid min-h-screen place-items-center bg-bg p-6 font-sans text-ink">
        <main className="max-w-xl">
          <p className="text-[clamp(72px,18vw,140px)] font-semibold leading-none tracking-[-0.04em] text-accent">404</p>
          <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[36px]">{ru.title}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted">{ru.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/ru#audit" className="inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-[15px] font-semibold text-onaccent hover:bg-accent-dark">
              {ru.audit}
            </a>
            <Link prefetch={false} href="/ru" className="inline-flex items-center justify-center rounded-[10px] border border-line px-6 py-[14px] font-semibold hover:border-ink">
              {ru.back}
            </Link>
          </div>
          <p className="mt-10 border-t border-line pt-5 text-[15px] text-muted">
            {en.title}.{' '}
            <Link prefetch={false} href="/en" className="font-semibold text-accent hover:underline">
              {en.back}
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
