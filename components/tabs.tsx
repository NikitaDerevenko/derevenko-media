'use client';

import { useEffect, useState } from 'react';
import { goal, type Goal } from '@/lib/metrika';
import { cx } from './ui';

/**
 * Вкладки с панелями, отрисованными на сервере: все панели уже в HTML,
 * клиентский код только переключает видимость.
 */
/** hashes — якоря вкладок: переход по ссылке /ru#contact открывает вкладку с этим якорем */
export function Tabs({ id, labels, panels, dark, goalPrefix, hashes }: { id: string; labels: string[]; panels: React.ReactNode[]; dark?: boolean; goalPrefix?: string; hashes?: string[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!hashes) return;
    const sync = () => {
      const i = hashes.indexOf(window.location.hash.slice(1));
      if (i >= 0) setActive(i);
    };
    sync();
    // клики по ссылкам на ту же страницу перехватывает скрипт якорей (pushState) — слушаем и его
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const i = hashes.indexOf(new URL(a.href, window.location.href).hash.slice(1));
      if (i >= 0) setActive(i);
    };
    window.addEventListener('hashchange', sync);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashes?.join('|')]);
  const select = (i: number) => {
    setActive(i);
    if (goalPrefix) goal(`${goalPrefix}${i}` as Goal);
  };
  return (
    <div>
      <div role="tablist" className={cx('no-scrollbar mb-8 flex max-w-full gap-1 overflow-x-auto rounded-xl p-1 sm:inline-flex', dark ? 'bg-dark-2' : 'bg-surface ring-1 ring-inset ring-line')}>
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
              'shrink-0 rounded-[9px] px-4 py-2.5 text-[15px] font-semibold transition',
              active === i ? (dark ? 'bg-dark text-onaccent' : 'bg-bg text-ink shadow-soft') : dark ? 'text-dark-muted hover:text-onaccent' : 'text-muted hover:text-ink',
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
