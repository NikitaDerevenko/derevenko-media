'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Фото, которое «смотрит» на курсор: сетка ракурсов N×N (по умолчанию 5×5), файлы pattern с {x} и {y} от 0 до N-1.
 * x — взгляд влево→вправо, y — вверх→вниз, центр — (N-1)/2.
 * Работает только с мышью (hover + точный указатель) и без «уменьшить движение»; иначе — центральный кадр.
 */
export function HeadTracker({ pattern, grid = 5, alt, className }: { pattern: string; grid?: number; alt: string; className?: string }) {
  const c = (grid - 1) / 2;
  const src = (x: number, y: number) => pattern.replace('{x}', String(x)).replace('{y}', String(y));
  const [img, setImg] = useState(src(c, c));
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // предзагрузка всех ракурсов, чтобы смена кадра не мигала
    for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) new Image().src = src(x, y);
    let tx = c, ty = c, sx = c, sy = c, raf = 0, last = '';
    const tick = () => {
      sx += (tx - sx) * 0.18;
      sy += (ty - sy) * 0.18;
      const k = src(Math.round(sx), Math.round(sy));
      if (k !== last) {
        last = k;
        setImg(k);
      }
      raf = Math.abs(tx - sx) + Math.abs(ty - sy) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
      const dead = Math.hypot(dx, dy) < 0.06; // мёртвая зона у центра — без дрожания
      tx = dead ? c : c + Math.max(-1, Math.min(1, dx)) * c;
      ty = dead ? c : c + Math.max(-1, Math.min(1, dy)) * c;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => {
      removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, grid]);

  return (
    <div ref={box} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={alt} className="h-full w-full object-cover" decoding="async" />
    </div>
  );
}
