import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { Section, SectionHead } from '../ui';

/** Отзывы клиентов: первый (с цифрами) — крупной цитатой, остальные — колонками, как записки */
export function TestimonialsSection({ locale }: { locale: Locale; num?: string }) {
  const t = getDict(locale).testimonials;
  const q = (s: string) => (locale === 'ru' ? `«${s}»` : `“${s}”`);
  const items = t.items as { tag: string; who?: string; text: string }[];
  const [first, ...rest] = items;
  // подпись: кто клиент (если известно) и какая была услуга
  const by = (r: { tag: string; who?: string }) =>
    r.who ? (
      <>
        <span className="font-medium text-ink">{r.who}</span> — {r.tag}
      </>
    ) : (
      r.tag
    );
  return (
    <Section id="reviews">
      <SectionHead title={t.title} sub={t.sub} />
      {first && (
        <figure className="max-w-4xl border-l-4 border-accent pl-6 md:pl-8">
          <blockquote className="text-[21px] font-medium leading-[1.45] tracking-[-0.01em] md:text-[26px]">{q(first.text)}</blockquote>
          <figcaption className="mt-4 text-[15px] text-muted">{by(first)}</figcaption>
        </figure>
      )}
      <ul className="mt-12 gap-6 md:columns-2 lg:columns-3">
        {rest.map((r) => (
          <li key={r.text.slice(0, 32)} className="mb-6 break-inside-avoid">
            <figure className="rounded-2xl border border-line p-6">
              <blockquote className="text-[16px] leading-relaxed">{q(r.text)}</blockquote>
              <figcaption className="mt-3 text-[14px] text-muted">{by(r)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
