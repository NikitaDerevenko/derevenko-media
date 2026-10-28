import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { Stairs } from '../mockups';
import { Section } from '../ui';

export function ProcessSection({ locale, num }: { locale: Locale; num: string }) {
  const dict = getDict(locale);
  const t = dict.process;
  const g = dict.guarantees;
  return (
    <Section id="process">
      <div className="mb-14 grid items-end gap-8 md:grid-cols-[1fr_auto_auto]">
        <h2 className="display text-[44px] sm:text-6xl lg:text-[88px]">{t.title}</h2>
        <Stairs className="hidden h-auto w-[320px] md:block lg:w-[400px]" />
        <span className="mb-2 text-lg font-semibold text-accent">{num}</span>
      </div>
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((s, i) => (
          <li key={s.title} className="border-t border-line pt-6">
            <span className="text-[14px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      {/* гарантии процесса */}
      <div id="guarantees" className="card mt-24 p-7 md:p-12">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div>
            <h3 className="text-3xl font-semibold uppercase leading-none tracking-tight md:text-[44px]">{g.title}</h3>
            <p className="mt-5 text-lg leading-relaxed text-muted">{g.sub}</p>
          </div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {g.items.map((it, i) => (
              <li key={it.title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-[14px] font-semibold text-onaccent">{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold leading-snug">{it.title}</p>
                  <p className="mt-1 text-muted">{it.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
