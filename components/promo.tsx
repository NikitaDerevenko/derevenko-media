'use client';

import { useEffect, useState } from 'react';
import { cx } from './ui';

/** true, пока акция идёт. До гидрации — значение со сборки (чтобы HTML и первый кадр совпадали) */
function useLive(until: string) {
  const [live, setLive] = useState(true);
  useEffect(() => {
    const end = Date.parse(until);
    const check = () => setLive(Date.now() <= end);
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [until]);
  return live;
}

/** Цена по акции: старая зачёркнута, новая — акцентом. После даты остаётся только обычная цена */
export function PromoPrice({ regular, promo, until, className }: { regular: string; promo: string; until: string; className?: string }) {
  const live = useLive(until);
  if (!live) return <span className={className}>{regular}</span>;
  return (
    <span className={cx('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className="text-accent">{promo}</span>
      <s className="text-[0.62em] font-medium text-muted decoration-1">{regular}</s>
    </span>
  );
}

type Copy = { title: string; text: string; left: string; days: string; hours: string; minutes: string; terms: string };

/** Баннер акции с обратным отсчётом. Скрывается сам, когда срок вышел */
export function PromoBanner({ until, copy }: { until: string; copy: Copy }) {
  const live = useLive(until);
  const [left, setLeft] = useState<{ d: number; h: number; m: number } | null>(null);
  useEffect(() => {
    const end = Date.parse(until);
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setLeft({ d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4) });
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [until]);
  if (!live) return null;
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-accent p-5 text-onaccent md:flex-row md:items-center md:justify-between md:p-6">
      <div>
        <p className="text-[20px] font-semibold leading-snug">{copy.title}</p>
        <p className="mt-1 text-[15px] leading-snug text-onaccent/85">{copy.text}</p>
      </div>
      <div className="shrink-0" aria-live="off">
        <p className="text-[13px] text-onaccent/80">{copy.left}</p>
        <div className="mt-1 flex gap-2">
          {[
            [left?.d, copy.days],
            [left?.h, copy.hours],
            [left?.m, copy.minutes],
          ].map(([v, l]) => (
            <span key={l as string} className="min-w-[56px] rounded-lg bg-onaccent/15 px-2.5 py-1.5 text-center">
              <span className="block text-[22px] font-semibold leading-none tabular-nums">{v === undefined ? '—' : String(v).padStart(2, '0')}</span>
              <span className="mt-1 block text-[12px] text-onaccent/80">{l as string}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
