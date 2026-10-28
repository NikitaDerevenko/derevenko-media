import { getDict } from '@/lib/i18n';
import { HOME_DIRECTIONS, marketOf, showPrices, type Locale } from '@/lib/site';
import { DirectionPrices } from '../price-cards';
import { Tabs } from '../tabs';
import { DarkPanel, SectionHead } from '../ui';

/** Цены на главной: вкладки по трём направлениям, у каждой цены — границы работ */
export function PricingSection({ locale, num }: { locale: Locale; num: string }) {
  const dict = getDict(locale);
  const t = dict.pricing;
  const visible = showPrices(marketOf(locale));
  return (
    <DarkPanel id="pricing">
      <SectionHead dark title={t.title} sub={t.sub} num={num} />
      <Tabs
        id="prices"
        dark
        labels={HOME_DIRECTIONS.map((d) => dict.directions[d].name)}
        panels={HOME_DIRECTIONS.map((d) => (
          <DirectionPrices key={d} direction={d} locale={locale} dark />
        ))}
      />
      <ul className="mt-10 space-y-1.5 text-[14px] text-dark-muted">
        {!visible && t.hiddenNote && <li className="font-semibold text-onaccent">{t.hiddenNote}</li>}
        {t.notes.map((n) => (
          <li key={n}>— {n}</li>
        ))}
        <li>— {dict.directions.websites.page.extra[0]}</li>
      </ul>
    </DarkPanel>
  );
}
