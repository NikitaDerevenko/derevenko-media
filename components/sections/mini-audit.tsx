'use client';

import { useId, useRef, useState } from 'react';
import { fill } from '@/lib/i18n/helpers';
import { goal } from '@/lib/metrika';
import { buildMiniAudit, CHANNELS, MINI_NICHES, type Channel, type MiniNiche, type MiniResult } from '@/lib/mini-audit';
import { useApp } from '../providers';
import { Arrow, btn, Check, cx } from '../ui';

/** Ключ, по которому форма разбора подхватит ответы экспресс-разбора и передаст их в заявку */
export const MINI_AUDIT_KEY = 'mini-audit';

/**
 * Экспресс-разбор с «замками»: ниша + что уже есть → 2 совета целиком, ещё 5 пунктов — заголовком под размытием.
 * Клик по закрытому пункту ведёт к форме бесплатного разбора.
 */
export function MiniAuditSection() {
  const { locale, dict } = useApp();
  const t = dict.miniAudit;
  const uid = useId();
  const [niche, setNiche] = useState<MiniNiche>('food');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [city, setCity] = useState('');
  const [result, setResult] = useState<MiniResult | null>(null);
  const [error, setError] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const toggle = (c: Channel) => {
    setError(false);
    setChannels((cur) => {
      if (c === 'none') return cur.includes('none') ? [] : ['none'];
      const without = cur.filter((x) => x !== 'none');
      return without.includes(c) ? without.filter((x) => x !== c) : [...without, c];
    });
  };

  const show = () => {
    if (channels.length === 0) {
      setError(true);
      return;
    }
    const r = buildMiniAudit(niche, channels, city, t.niches[niche]);
    setResult(r);
    goal('calc_used', { tool: 'mini_audit', niche });
    try {
      // форма разбора допишет это в заявку, чтобы не спрашивать нишу повторно
      const chosen = channels.map((c) => t.channelOptions[c]).join(', ');
      sessionStorage.setItem(MINI_AUDIT_KEY, `${t.niches[niche]}${city.trim() ? `, ${city.trim()}` : ''}; есть: ${chosen}`);
    } catch {
      // без sessionStorage просто не передаём контекст
    }
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const total = result ? result.open.length + result.locked.length : 7;

  return (
    <section id="mini-audit" className="cv-auto border-b border-line bg-surface py-14 md:py-20">
      <div className="container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <h2 className="h2">{t.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{t.sub}</p>

          <fieldset className="mt-8">
            <legend className="mb-3 text-[15px] font-semibold">{t.niche}</legend>
            <div className="flex flex-wrap gap-2">
              {MINI_NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={niche === n}
                  onClick={() => setNiche(n)}
                  className={cx('rounded-lg border px-3.5 py-2 text-[15px] transition active:scale-[.97]', niche === n ? 'border-ink bg-ink text-onaccent' : 'border-line bg-bg hover:border-ink/40')}
                >
                  {t.niches[n]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-3 text-[15px] font-semibold">{t.channels}</legend>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const on = channels.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c)}
                    className={cx('inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[15px] transition active:scale-[.97]', on ? 'border-accent bg-accent-soft text-accent-dark' : 'border-line bg-bg hover:border-ink/40')}
                  >
                    {on && <Check className="h-4 w-4" />}
                    {t.channelOptions[c]}
                  </button>
                );
              })}
            </div>
            {error && (
              <p role="alert" className="mt-2 text-[14px] font-medium text-accent">
                {t.pickChannel}
              </p>
            )}
          </fieldset>

          <div className="mt-6 max-w-sm">
            <label htmlFor={`${uid}-city`} className="mb-2 block text-[15px] font-semibold">
              {t.city}
            </label>
            <input id={`${uid}-city`} type="text" value={city} onChange={(e) => setCity(e.target.value.slice(0, 40))} placeholder={t.cityPh} className="field" autoComplete="address-level2" />
          </div>

          <button type="button" onClick={show} className={cx(btn.primary, 'mt-7')}>
            {t.submit}
            <Arrow />
          </button>
        </div>

        <div ref={resultRef} className="scroll-mt-24">
          {result ? (
            <div className="rounded-2xl border border-line bg-bg p-5 shadow-soft md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="h3">{t.resultTitle}</h3>
                <button type="button" onClick={() => setResult(null)} className="text-[14px] font-medium text-muted hover:text-ink">
                  {t.again}
                </button>
              </div>

              {/* шкала: сколько пунктов открыто */}
              <div className="mt-4">
                <div className="flex justify-between text-[14px] text-muted">
                  <span>{fill(t.progress, { open: String(result.open.length), total: String(total) })}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                  <div className="mini-bar h-2 rounded-full bg-accent" style={{ width: `${(result.open.length / total) * 100}%` }} />
                </div>
              </div>

              <ol className="mt-6 space-y-3">
                {result.open.map((o, i) => (
                  <li key={o.title} className="rounded-xl border border-line p-4">
                    <p className="flex items-start gap-3 font-semibold leading-snug">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[13px] text-onaccent">{i + 1}</span>
                      {o.title}
                    </p>
                    <p className="mt-2 pl-9 text-[15px] leading-relaxed text-ink/80">{o.text}</p>
                  </li>
                ))}
                {result.locked.map((title, i) => (
                  <li key={title}>
                    {/* закрытый пункт: заголовок виден, текст — размытая заглушка; клик ведёт к форме разбора */}
                    <a href={`/${locale}#audit`} onClick={() => goal('calc_used', { tool: 'mini_audit_unlock' })} className="group block rounded-xl border border-dashed border-line p-4 transition hover:border-accent">
                      <p className="flex items-start gap-3 font-semibold leading-snug">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-[13px] text-muted">{result.open.length + i + 1}</span>
                        <span className="min-w-0 flex-1">{title}</span>
                        <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted group-hover:text-accent" />
                      </p>
                      <p aria-hidden="true" className="mini-blur mt-2 select-none pl-9 text-[15px] leading-relaxed text-ink/70">
                        {t.blur}
                      </p>
                      <span className="sr-only">{t.locked}</span>
                    </a>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[14px] leading-snug text-muted">{t.unlockNote}</p>
                <a href={`/${locale}#audit`} onClick={() => goal('calc_used', { tool: 'mini_audit_cta' })} className={cx(btn.primary, 'shrink-0')}>
                  {t.unlock}
                </a>
              </div>
              <p className="mt-4 text-[13px] leading-snug text-muted">{t.note}</p>
            </div>
          ) : (
            // до выбора — превью того, как выглядит результат
            <div aria-hidden="true" className="hidden rounded-2xl border border-dashed border-line bg-bg/60 p-7 lg:block">
              <div className="h-4 w-40 rounded bg-surface" />
              <div className="mt-4 h-2 w-full rounded-full bg-surface" />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="mt-4 rounded-xl border border-line p-4">
                  <div className="h-3.5 w-3/4 rounded bg-surface" />
                  <div className="mt-3 h-3 w-full rounded bg-surface/70" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 016 0V9" strokeLinecap="round" />
    </svg>
  );
}
