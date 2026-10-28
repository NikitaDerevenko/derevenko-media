'use client';

import { useState } from 'react';
import { goal, type Goal } from '@/lib/metrika';
import { cx } from './ui';

/**
 * Вкладки с панелями, отрисованными на сервере: все панели уже в HTML,
 * клиентский код только переключает видимость.
 */
export function Tabs({ id, labels, panels, dark, goalPrefix }: { id: string; labels: string[]; panels: React.ReactNode[]; dark?: boolean; goalPrefix?: string }) {
  const [active, setActive] = useState(0);
  const select = (i: number) => {
    setActive(i);
    if (goalPrefix) goal(`${goalPrefix}${i}` as Goal);
  };
  return (
    <div>
      <div role="tablist" className={cx('mb-8 flex flex-wrap gap-2')}>
        {labels.map((l, i) => (
          <button
            key={l}
            id={`${id}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const next = (active + (e.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length;
              select(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={cx(
              'shrink-0 rounded-full border px-5 py-3 text-[15px] font-semibold transition',
              active === i ? 'border-accent bg-accent text-onaccent' : dark ? 'border-dark-line text-dark-muted hover:text-onaccent' : 'border-line text-muted hover:text-ink',
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {panels.map((p, i) => (
        <div key={i} id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} hidden={active !== i}>
          {p}
        </div>
      ))}
    </div>
  );
}
