import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow, Breadcrumbs, btn, Check } from '@/components/ui';
import { ARTICLES, getArticle } from '@/lib/articles';
import { getDict } from '@/lib/i18n';
import { LEGAL, SITE, type Locale } from '@/lib/site';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ locale: 'ru', slug: a.slug }));
}
export const dynamicParams = false;

type Params = { locale: Locale; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/ru/stati/${a.slug}` },
    openGraph: { type: 'article', title: a.title, description: a.description, url: `/ru/stati/${a.slug}`, publishedTime: a.date, images: [{ url: '/og/ru.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: a.title, description: a.description, images: ['/og/ru.png'] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const a = getArticle(slug);
  if (!a || locale !== 'ru') notFound();
  const dict = getDict('ru');
  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a.date));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: a.title,
        description: a.description,
        datePublished: a.date,
        dateModified: a.date,
        inLanguage: 'ru',
        mainEntityOfPage: `${SITE.url}/ru/stati/${a.slug}`,
        author: { '@type': 'Person', name: dict.about.name, url: `${SITE.url}/ru#about` },
        publisher: { '@type': 'Person', name: LEGAL.name.ru },
        image: `${SITE.url}/og/ru.png`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.common.home, item: `${SITE.url}/ru` },
          { '@type': 'ListItem', position: 2, name: dict.articles.title, item: `${SITE.url}/ru/stati` },
          { '@type': 'ListItem', position: 3, name: a.title, item: `${SITE.url}/ru/stati/${a.slug}` },
        ],
      },
    ],
  };

  return (
    <article className="container max-w-3xl py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ href: '/ru', label: dict.common.home }, { href: '/ru/stati', label: dict.articles.title }, { label: a.title }]} />
      <h1 className="h1 mt-8">{a.title}</h1>
      <p className="mt-4 text-[15px] text-muted">
        {dict.about.name} · {date} · {a.readMin} мин чтения
      </p>

      <div className="mt-10 space-y-10">
        {a.blocks.map((b, i) => (
          <section key={i}>
            {b.h2 && <h2 className="h3 mb-3">{b.h2}</h2>}
            {b.p?.map((p) => (
              <p key={p.slice(0, 30)} className="mt-3 text-[17px] leading-[1.7] text-ink/85 first:mt-0">
                {p}
              </p>
            ))}
            {b.list && (
              <ul className="mt-3 space-y-2">
                {b.list.map((x) => (
                  <li key={x.slice(0, 30)} className="flex gap-3 text-[17px] leading-[1.65] text-ink/85">
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-accent" />
                    {x}
                  </li>
                ))}
              </ul>
            )}
            {b.ol && (
              <ol className="mt-3 space-y-2">
                {b.ol.map((x, k) => (
                  <li key={x.slice(0, 30)} className="flex gap-3 text-[17px] leading-[1.65] text-ink/85">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-[13px] font-semibold">{k + 1}</span>
                    {x}
                  </li>
                ))}
              </ol>
            )}
            {b.tip && <p className="mt-4 rounded-xl bg-accent-soft p-4 text-[16px] leading-relaxed text-ink/85">{b.tip}</p>}
          </section>
        ))}
      </div>

      {/* призыв в конце статьи — к бесплатному разбору */}
      <aside className="mt-14 rounded-2xl border border-line p-6 md:p-8">
        <p className="h3">{dict.articles.ctaTitle}</p>
        <p className="mt-2 text-muted">{dict.articles.ctaText}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="/ru#audit" className={btn.primary}>
            {dict.common.auditCta}
            <Arrow />
          </a>
          <Link prefetch={false} href={`/ru/services/${a.direction}`} className={btn.secondary}>
            {dict.directions[a.direction].name}
          </Link>
        </div>
      </aside>

      <nav aria-label={dict.articles.more} className="mt-14">
        <p className="text-[17px] font-semibold">{dict.articles.more}</p>
        <ul className="mt-3 space-y-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link prefetch={false} href={`/ru/stati/${o.slug}`} className="font-medium text-accent hover:underline">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
