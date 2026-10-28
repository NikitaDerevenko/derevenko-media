import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DirectionPrices } from '@/components/price-cards';
import { ProjectCard } from '@/components/project-cards';
import { FaqList, StartSection } from '@/components/sections/leads';
import { TwoPathButtons } from '@/components/two-paths';
import { Breadcrumbs, Check, DarkPanel, Section, SectionHead } from '@/components/ui';
import { getDict } from '@/lib/i18n';
import { projectsForDirection } from '@/lib/projects';
import { DIRECTIONS, isDirection, LOCALES, SITE, type DirectionId, type Locale } from '@/lib/site';

type Params = { locale: Locale; direction: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DIRECTIONS.map((direction) => ({ locale, direction })));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!isDirection(params.direction)) return {};
  const page = getDict(params.locale).directions[params.direction].page;
  const path = `/services/${params.direction}`;
  const og = `/og/${params.locale}-${params.direction}.png`;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${params.locale}${path}`,
      languages: { ru: `/ru${path}`, en: `/en${path}`, 'x-default': `/ru${path}` },
    },
    openGraph: { title: page.title, description: page.description, url: `/${params.locale}${path}`, type: 'website', images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [og] },
  };
}

/** В контактной форме — направление, выбранное по странице */
const FORM_DIRECTION: Record<DirectionId, string> = { promotion: 'promotion', websites: 'websites', 'telegram-bots': 'telegram-bots', 'mini-apps': 'mini-apps' };

export default function DirectionPage({ params }: { params: Params }) {
  const { locale } = params;
  if (!isDirection(params.direction)) notFound();
  const direction = params.direction;
  const dict = getDict(locale);
  const dir = dict.directions[direction];
  const page = dir.page;
  const examples = projectsForDirection(direction, locale);
  const home = `/${locale}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.common.home, item: `${SITE.url}${home}` },
          { '@type': 'ListItem', position: 2, name: dict.common.services, item: `${SITE.url}${home}#services` },
          { '@type': 'ListItem', position: 3, name: dir.name, item: `${SITE.url}${home}/services/${direction}` },
        ],
      },
      {
        '@type': 'Service',
        name: page.h1,
        description: page.description,
        provider: { '@type': 'Person', name: dict.about.name, url: `${SITE.url}${home}` },
        url: `${SITE.url}${home}/services/${direction}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-bg pb-14 pt-8 md:pb-20 md:pt-12">
        <div className="container">
          <Breadcrumbs items={[{ href: home, label: dict.common.home }, { href: `${home}#services`, label: dict.common.services }, { label: dir.name }]} />
          <h1 className="mt-8 max-w-5xl text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px]">{page.h1}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">{dir.forWhom}</p>
          <div className="mt-8">
            <TwoPathButtons locale={locale} primary={page.cta} base="" />
          </div>
        </div>
      </section>

      {/* Что вы получаете */}
      <Section tone="surface">
        <SectionHead title={dict.directionPage.gets} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.gets.map((g) => (
            <li key={g} className="card flex gap-3 p-6 text-[16px]">
              <Check className="mt-0.5 h-5 w-5 text-accent" />
              {g}
            </li>
          ))}
        </ul>
      </Section>

      {/* Этапы и сроки */}
      <Section>
        <SectionHead title={dict.directionPage.steps} />
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {page.steps.map((s, i) => (
            <li key={s.title} className="border-t border-line pt-6">
              <span className="text-[14px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-muted">{s.text}</p>
              {s.term && <p className="mt-3 text-[14px] font-semibold text-ink">{s.term}</p>}
            </li>
          ))}
        </ol>
      </Section>

      {/* Цены с границами работ */}
      <DarkPanel id="pricing">
        <SectionHead dark title={dict.pricing.title} sub={dict.pricing.sub} />
        <DirectionPrices direction={direction} locale={locale} dark base="" />
        <div className="mt-10">
          <p className="caps text-dark-muted">{dict.directionPage.extra}</p>
          <ul className="mt-3 space-y-1.5 text-[16px] text-dark-muted">
            {[...page.extra, ...dict.pricing.notes].map((n) => (
              <li key={n}>— {n}</li>
            ))}
          </ul>
        </div>
      </DarkPanel>

      {/* Примеры: сначала кейсы направления, затем готовые решения */}
      {examples.length > 0 && (
        <DarkPanel id="examples">
          <SectionHead dark title={dict.projects.examples} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((p) => (
              <ProjectCard key={p.slug} project={p} locale={locale} />
            ))}
          </div>
        </DarkPanel>
      )}

      <Section id="faq">
        <SectionHead title={dict.faq.title} />
        <FaqList items={page.faq} />
      </Section>

      <StartSection locale={locale} primary={page.cta} defaultDirection={FORM_DIRECTION[direction]} />
    </>
  );
}
