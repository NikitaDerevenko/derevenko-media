import { getDict } from '@/lib/i18n';
import { homeSolutions } from '@/lib/projects';
import type { Locale } from '@/lib/site';
import { SolutionCard } from '../project-cards';
import { Arrow, btn, Section, SectionHead } from '../ui';

/** Готовые решения для ниш: на телефоне — список сверху вниз, дальше — сетка в 2–3 колонки */
export function SolutionsSection({ locale, num }: { locale: Locale; num: string }) {
  const dict = getDict(locale);
  const t = dict.solutions;
  const items = homeSolutions(locale);
  if (items.length === 0) return null;
  return (
    <Section id="solutions">
      <SectionHead title={t.title} sub={t.sub} num={num} />
      <ul className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.slug}>
            <SolutionCard project={p} locale={locale} />
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-start gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-[17px] leading-relaxed">{t.cta}</p>
        <a href={`/${locale}#contact`} className={btn.primary}>
          {dict.common.projectCta}
          <Arrow />
        </a>
      </div>
    </Section>
  );
}
