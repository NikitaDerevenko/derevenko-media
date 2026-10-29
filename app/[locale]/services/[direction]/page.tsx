import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DirectionPrices } from '@/components/price-cards';
import { ProjectCard } from '@/components/project-cards';
import { FaqList, StartSection } from '@/components/sections/leads';
import { TwoPathButtons } from '@/components/two-paths';
import { Breadcrumbs, Check, Section, SectionHead } from '@/components/ui';
import { getDict } from '@/lib/i18n';
import { projectsForDirection } from '@/lib/projects';
import { DIRECTIONS, isDirection, LOCALES, SITE, type DirectionId, type Locale } from '@/lib/site';

type Params = { locale: Locale; direction: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DIRECTIONS.map((direction) => ({ locale, direction })));
}

export async function generateMetadata({ params: paramsP }: { params: Promise<Params> }): Promise<Metadata> {
  const params = await paramsP;
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

export default async function DirectionPage({ params: paramsP }: { params: Promise<Params> }) {
  const params = await paramsP;
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
          <h1 className="h1 mt-8 max-w-[22ch]">{page.h1}</h1>
          <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted md:text-lg">{dir.forWhom}</p>
          <div className="mt-8">
            <TwoPathButtons locale={locale} primary={page.cta} base="" />
          </div>
        </div>
      </section>

      {/* Что вы получаете */}
      <Section tone="surface">
        <SectionHead title={dict.directionPage.gets} />
        <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {page.gets.map((g) => (
            <li key={g} className="flex gap-3 border-t border-line pt-5 text-[16px] leading-relaxed">
              <Check className="mt-1 h-5 w-5 text-accent" />
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
            <li key={s.title} className="border-t-2 border-ink pt-5">
              <span className="text-[15px] font-semibold text-muted">{i + 1}</span>
              <h3 className="mt-2 text-[19px] font-semibold leading-snug">{s.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{s.text}</p>
              {s.term && <p className="mt-3 text-[15px] font-semibold text-accent">{s.term}</p>}
            </li>
          ))}
        </ol>
      </Section>

      {/* Цены с границами работ */}
      <Section id="pricing" tone="surface">
        <SectionHead title={dict.pricing.title} sub={dict.pricing.sub} />
        <DirectionPrices direction={direction} locale={locale} base="" />
        <div className="mt-10">
          <p className="text-[17px] font-semibold">{dict.directionPage.extra}</p>
          <ul className="mt-3 space-y-1.5 text-[15px] text-muted">
            {[...page.extra, ...dict.pricing.notes].map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Примеры: сначала кейсы направления, затем готовые решения */}
      {examples.length > 0 && (
        <Section id="examples">
          <SectionHead title={dict.projects.examples} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((p) => (
              <ProjectCard key={p.slug} project={p} locale={locale} />
            ))}
          </div>
        </Section>
      )}

      <Section id="faq" tone="surface">
        <SectionHead title={dict.faq.title} />
        <FaqList items={page.faq} />
      </Section>

      <StartSection locale={locale} primary={page.cta} defaultDirection={FORM_DIRECTION[direction]} />
    </>
  );
}
