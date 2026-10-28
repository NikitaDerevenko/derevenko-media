import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import './globals.css';

export default function NotFound() {
  const ru = getDict('ru').notFound;
  const en = getDict('en').notFound;
  return (
    <html lang="ru">
      <body className="grid min-h-screen place-items-center bg-bg p-6 text-center font-sans">
        <div>
          <p className="text-6xl font-semibold text-accent">404</p>
          <h1 className="mt-4 text-2xl font-semibold">
            {ru.title} · {en.title}
          </h1>
          <div className="mt-6 flex justify-center gap-3">
            <Link prefetch={false} href="/ru" className="rounded-full bg-accent px-5 py-3 font-semibold text-onaccent">
              {ru.back}
            </Link>
            <Link prefetch={false} href="/en" className="rounded-full border border-accent px-5 py-3 font-semibold text-accent">
              {en.back}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
