import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import { ARTICLES } from '@/lib/articles';
import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';

// Статьи есть только в русской версии
export function generateStaticParams() {
  return [{ locale: 'ru' }];
}
export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Статьи о рекламе, картах и сайтах для малого бизнеса',
    description: 'Практические статьи: как оформить карточку на Яндекс Картах, сколько стоит Яндекс Директ, что выбрать — Директ или VK Реклама, сайт или Telegram-бот.',
    alternates: { canonical: '/ru/stati' },
  };
}

export default async function ArticlesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (locale !== 'ru') notFound();
  const dict = getDict(locale);
  return (
    <div className="container max-w-4xl py-10 md:py-16">
      <Breadcrumbs items={[{ href: '/ru', label: dict.common.home }, { label: dict.articles.title }]} />
      <h1 className="h1 mt-8">{dict.articles.title}</h1>
      <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">{dict.articles.sub}</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link prefetch={false} href={`/ru/stati/${a.slug}`} className="group block py-6">
              <h2 className="text-[21px] font-semibold leading-snug tracking-[-0.01em] group-hover:text-accent">{a.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{a.lead}</p>
              <p className="mt-2 text-[14px] text-muted">{a.readMin} мин чтения</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
