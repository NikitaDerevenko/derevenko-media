import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { cx, Section, SectionHead } from '../ui';

/** Отзывы клиентов: первый (с цифрами) — крупнее, на две колонки */
export function TestimonialsSection({ locale, num }: { locale: Locale; num: string }) {
  const t = getDict(locale).testimonials;
  const q = (s: string) => (locale === 'ru' ? `«${s}»` : `“${s}”`);
  return (
    <Section id="reviews" tone="surface">
      <SectionHead title={t.title} sub={t.sub} num={num} />
      <ul className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {t.items.map((r, i) => (
          <li key={r.text.slice(0, 32)} className={cx(i === 0 && 'md:col-span-2')}>
            <figure className={cx('flex h-full flex-col rounded-[24px] border p-6 md:p-7', i === 0 ? 'border-accent bg-accent text-onaccent' : 'border-line bg-bg')}>
              <figcaption className={cx('caps', i === 0 ? 'text-onaccent/80' : 'text-accent')}>{r.tag}</figcaption>
              <blockquote className={cx('mt-4 flex-1 leading-relaxed', i === 0 ? 'text-[19px] md:text-[22px]' : 'text-[16px]')}>{q(r.text)}</blockquote>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
