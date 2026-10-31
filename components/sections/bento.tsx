import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { Arrow, btn, Section, SectionHead } from '../ui';

/** Бенто «Что входит в бесплатный разбор»: одна большая тёмная плитка с примером сравнения и плитки поменьше */
export function BentoSection({ locale }: { locale: Locale }) {
  const t = getDict(locale).bento;
  // иллюстрация формата сравнения (не данные клиента): ваша карточка против конкурентов
  const rows = [
    { name: t.compare.you, rating: 4.3, reviews: 38, you: true },
    { name: `${t.compare.rival} 1`, rating: 4.8, reviews: 412 },
    { name: `${t.compare.rival} 2`, rating: 4.7, reviews: 260 },
    { name: `${t.compare.rival} 3`, rating: 4.6, reviews: 175 },
  ];
  const maxReviews = Math.max(...rows.map((r) => r.reviews));
  const nf = (v: number, d = 0) => new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

  return (
    <Section id="audit-inside">
      <SectionHead
        title={t.title}
        sub={t.sub}
        aside={
          <a href={`/${locale}#audit`} className={btn.primary}>
            {t.cta}
            <Arrow />
          </a>
        }
      />
      <div className="grid auto-rows-[minmax(150px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* большая плитка 2×2 */}
        <article className="flex flex-col rounded-2xl bg-dark p-6 text-onaccent sm:col-span-2 lg:row-span-2 md:p-8">
          <h3 className="text-[22px] font-semibold leading-snug tracking-[-0.01em]">{t.compare.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-dark-muted">{t.compare.text}</p>
          <ul className="mt-auto space-y-3 pt-8" aria-hidden="true">
            {rows.map((r) => (
              <li key={r.name} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto] items-center gap-3 text-[14px]">
                <span className={r.you ? 'font-semibold text-onaccent' : 'text-dark-muted'}>{r.name}</span>
                <span className="h-2.5 rounded-full bg-dark-2">
                  <span className={`block h-2.5 rounded-full ${r.you ? 'bg-lime' : 'bg-dark-muted/50'}`} style={{ width: `${(r.reviews / maxReviews) * 100}%` }} />
                </span>
                <span className="whitespace-nowrap text-dark-muted">
                  ★ {nf(r.rating, 1)} · {nf(r.reviews)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-dark-muted">{t.compare.sample}</p>
        </article>
        {[t.budget, t.first].map((x) => (
          <article key={x.title} className="rounded-2xl border border-line p-6">
            <h3 className="text-[18px] font-semibold leading-snug">{x.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.text}</p>
          </article>
        ))}
        <article className="rounded-2xl border border-line p-6 sm:col-span-2 lg:col-span-1">
          <h3 className="text-[18px] font-semibold leading-snug">{t.plan.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.plan.text}</p>
        </article>
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1 lg:grid-cols-1">
          {[t.term, t.free].map((x) => (
            <article key={x.value} className="flex flex-col justify-center rounded-2xl bg-accent-soft p-5">
              <p className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-accent-dark">{x.value}</p>
              <p className="mt-2 text-[14px] leading-snug text-ink/75">{x.text}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
