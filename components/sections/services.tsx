import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { servicePrice } from '@/lib/pricing';
import { DIRECTION_SERVICES, HOME_DIRECTIONS, marketOf, type Locale } from '@/lib/site';
import { QuizIcon } from '../mockups';
import { Arrow, ArrowUpRight, Section, SectionHead, cx } from '../ui';

const ICON: Record<string, string> = { promotion: 'promotion', websites: 'website', 'telegram-bots': 'bot' };

/** Три направления крупными карточками; внутри — услуги с ценой «от» и ссылками на страницы направлений */
export function ServicesSection({ locale, num }: { locale: Locale; num: string }) {
  const dict = getDict(locale);
  const market = marketOf(locale);
  const t = dict.services;
  const base = `/${locale}/services`;

  return (
    <Section id="services">
      <SectionHead title={t.title} sub={t.sub} num={num} />
      <div className="grid gap-5 lg:grid-cols-3">
        {HOME_DIRECTIONS.map((d) => {
          const dir = dict.directions[d];
          const ids = DIRECTION_SERVICES[market][d].filter((id) => id !== 'audit');
          return (
            <article key={d} className="card flex flex-col p-6 md:p-8">
              <div className="rounded-2xl bg-dark p-3 self-start">
                <QuizIcon kind={ICON[d]} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold leading-tight md:text-[28px]">
                <Link prefetch={false} href={`${base}/${d}`} className="hover:text-accent">
                  {dir.name}
                </Link>
              </h3>
              <p className="mt-2 text-[16px] text-ink/80">{dir.card}</p>
              <p className="mt-2 text-[14px] text-muted">{dir.forWhom}</p>

              <ul className="mt-6 flex-1 divide-y divide-line border-y border-line">
                {ids.map((id) => (
                  <li key={id}>
                    <Link prefetch={false} href={`${base}/${d}#${id}`} className="group flex items-baseline justify-between gap-4 py-3">
                      <span className="text-[16px] text-ink transition group-hover:text-accent">{t.items[id].name}</span>
                      <span className="shrink-0 text-[14px] font-semibold text-ink">{servicePrice(id, market, locale, dict.common)}</span>
                    </Link>
                  </li>
                ))}
                {d === 'telegram-bots' && (
                  // Mini App — отдельная позиция со своей ценой и страницей
                  <li>
                    <Link prefetch={false} href={`${base}/mini-apps`} className="group -mx-3 my-2 flex items-center justify-between gap-4 rounded-2xl border border-accent px-3 py-3">
                      <span>
                        <span className="block text-[13px] font-bold uppercase tracking-caps text-accent">{t.miniAppLabel}</span>
                        <span className="text-[16px] font-semibold text-ink group-hover:text-accent">{t.items.miniApp.name}</span>
                      </span>
                      <span className="shrink-0 text-[14px] font-semibold text-ink">{servicePrice('miniApp', market, locale, dict.common)}</span>
                    </Link>
                  </li>
                )}
              </ul>

              <Link prefetch={false} href={`${base}/${d}`} className={cx('mt-6 inline-flex items-center gap-2 self-start text-[16px] font-semibold text-accent hover:underline')}>
                {dict.common.more}
                {/* для скринридеров и поисковиков: куда ведёт ссылка */}
                <span className="sr-only">: {dict.directions[d].name}</span>
                <ArrowUpRight />
              </Link>
            </article>
          );
        })}
      </div>
      <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] text-muted">
        <Arrow className="text-accent" />
        <a href={`/${locale}#audit`} className="font-semibold text-accent hover:underline">
          {dict.common.auditCta}
        </a>
        <span>— {dict.services.items.audit.scope}</span>
      </p>
    </Section>
  );
}
