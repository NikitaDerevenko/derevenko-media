import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { HOME_DIRECTIONS, marketOf, showPrices, type Locale } from '@/lib/site';
import { DirectionPrices } from '../price-cards';
import { Tabs } from '../tabs';
import { Section, SectionHead } from '../ui';

/** Услуги и цены на главной — один блок: вкладки по направлениям, у каждой цены — состав и срок */
export function PricingSection({ locale }: { locale: Locale; num?: string }) {
  const dict = getDict(locale);
  const t = dict.pricing;
  const visible = showPrices(marketOf(locale));
  return (
    <Section id="pricing" tone="surface">
      {/* старые ссылки вида /ru#services ведут сюда же */}
      <span id="services" className="block" aria-hidden="true" />
      <SectionHead title={dict.nav.pricing} sub={t.sub} />
      <Tabs
        id="prices"
        goalPrefix="price_tab_"
        labels={HOME_DIRECTIONS.map((d) => dict.directions[d].name)}
        panels={HOME_DIRECTIONS.map((d) => (
          <div key={d}>
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
              <p className="max-w-2xl text-[17px]">{dict.directions[d].card}</p>
              <Link prefetch={false} href={`/${locale}/services/${d}`} className="shrink-0 font-semibold text-accent hover:underline">
                {dict.common.more}
                <span className="sr-only">: {dict.directions[d].name}</span>
              </Link>
            </div>
            <DirectionPrices direction={d} locale={locale} />
          </div>
        ))}
      />
      <ul className="mt-10 space-y-1.5 text-[14px] text-muted">
        {!visible && t.hiddenNote && <li className="font-semibold text-ink">{t.hiddenNote}</li>}
        {t.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>{dict.directions.websites.page.extra[0]}</li>
      </ul>
    </Section>
  );
}
