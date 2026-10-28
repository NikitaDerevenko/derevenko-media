'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { goal } from '@/lib/metrika';
import { cx } from './ui';

type Props = {
  before: string;
  after: string;
  /** Размеры исходников */
  w: number;
  h: number;
  /** Пропорция кадра (ширина / высота). По умолчанию — как у исходника. */
  aspect?: number;
  /** object-position, например 'bottom' — показать нижнюю часть скриншота */
  position?: string;
  labels: { before: string; after: string; slider: string };
  alt: string;
  priority?: boolean;
  /** Грузить сразу, но без высокого приоритета (первый экран на десктопе, ниже сгиба на телефоне) */
  eager?: boolean;
  /** Маленький кадр (телефон на первом экране): ручка и метки компактнее, метки внизу — не под «чёлкой» */
  compact?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Слайдер «до / после». Без JS (нет класса .js на <html>) показываются два изображения рядом.
 */
export function BeforeAfter({ before, after, w, h, aspect, position = 'center', labels, alt, priority, eager, compact, sizes = '(min-width: 1024px) 560px, 100vw', className }: Props) {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);
  const ratio = aspect ?? w / h;

  const track = useCallback(() => {
    if (tracked.current) return;
    tracked.current = true;
    goal('before_after_drag');
  }, []);

  const moveTo = useCallback((clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const next = ((clientX - box.left) / box.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
    track();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    moveTo(e.clientX);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    let next: number | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pos - step;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pos + step;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
    track();
  };

  const imgStyle = { objectFit: 'cover' as const, objectPosition: position };
  const loading = priority ? undefined : eager ? ('eager' as const) : ('lazy' as const);

  return (
    <div className={className}>
      {/* Слайдер (только с JS) */}
      <div
        ref={boxRef}
        className="ba-slider relative touch-pan-y select-none overflow-hidden rounded-[20px] bg-dark"
        style={{ aspectRatio: String(ratio) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <Image src={after} alt={`${alt} — ${labels.after}`} fill sizes={sizes} priority={priority} loading={loading} style={imgStyle} draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={`${alt} — ${labels.before}`} fill sizes={sizes} priority={priority} loading={loading} style={imgStyle} draggable={false} />
        </div>
        <span className={cx('pointer-events-none absolute rounded-full bg-dark/85 px-2.5 py-1 text-[12px] font-bold uppercase leading-none tracking-wide text-onaccent', compact ? 'bottom-2 left-2' : 'left-3 top-3')}>
          {labels.before}
        </span>
        <span className={cx('pointer-events-none absolute rounded-full bg-accent px-2.5 py-1 text-[12px] font-bold uppercase leading-none tracking-wide text-onaccent', compact ? 'bottom-2 right-2' : 'right-3 top-3')}>
          {labels.after}
        </span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface shadow-[0_0_0_1px_rgb(var(--ink)/.15)]" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.slider}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}%`}
          onKeyDown={onKeyDown}
          className={cx('absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-surface text-ink shadow-lg outline-none ring-accent focus-visible:ring-4', compact ? 'h-9 w-9' : 'h-11 w-11')}
          style={{ left: `${pos}%` }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Без JS: два изображения рядом */}
      <div className="ba-fallback grid grid-cols-2 gap-2">
        {[
          { src: before, label: labels.before },
          { src: after, label: labels.after },
        ].map((img) => (
          <figure key={img.src} className="relative overflow-hidden rounded-[20px] bg-dark" style={{ aspectRatio: String(ratio) }}>
            <Image src={img.src} alt={`${alt} — ${img.label}`} fill sizes="50vw" loading="lazy" style={imgStyle} />
            <figcaption className={cx('absolute left-2 top-2 rounded-full px-2.5 py-1 text-[12px] font-bold text-onaccent', img.label === labels.after ? 'bg-accent' : 'bg-dark/85')}>
              {img.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
