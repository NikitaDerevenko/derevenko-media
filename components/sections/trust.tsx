import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { Check, Section, SectionHead } from '../ui';

/** Как проходит работа (это последовательность — шаги пронумерованы) и гарантии процесса */
export function ProcessSection({ locale }: { locale: Locale; num?: string }) {
  const dict = getDict(locale);
  const t = dict.process;
  const g = dict.guarantees;
  return (
    <Section id="process">
      <SectionHead title={t.title} />
      <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((s, i) => (
          <li key={s.title} className="border-t-2 border-ink pt-5">
            <span className="num text-[15px] font-semibold text-muted">{i + 1}</span>
            <h3 className="mt-2 text-[19px] font-semibold leading-snug">{s.title}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <div id="guarantees" className="mt-16 grid gap-8 rounded-2xl bg-accent-soft p-6 md:mt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-12 md:p-10">
        <div>
          <h3 className="h3">{g.title}</h3>
          <p className="mt-3 leading-relaxed text-ink/75">{g.sub}</p>
        </div>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {g.items.map((it) => (
            <li key={it.title} className="flex gap-3">
              <Check className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold leading-snug">{it.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/75">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
