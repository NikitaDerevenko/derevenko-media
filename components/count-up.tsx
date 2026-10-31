'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Число «выпрыгивает» от 0 до значения один раз при появлении на экране.
 * В HTML сразу итоговое значение (без JS и при «уменьшить движение» — анимации нет).
 */
/** suffix — что дописать после числа (« ₽» и т. п.); число форматируется по locale с пробелами-разделителями */
export function CountUp({ value, locale = 'ru-RU', prefix = '', suffix = '', duration = 1100 }: { value: number; locale?: string; prefix?: string; suffix?: string; duration?: number }) {
  const format = (x: number) => `${prefix}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(x))}${suffix}`;
  const [v, setV] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !ref.current) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / duration);
          setV(value * (1 - Math.pow(1 - k, 3)));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        setV(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return <span ref={ref}>{format(v)}</span>;
}
