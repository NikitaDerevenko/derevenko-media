'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../providers';
import { Arrow } from '../ui';

export type SceneCopy = { before: string; beforeText: string; after: string; afterText: string; caption: string; link: string };

/**
 * Сцена прокрутки «до → после» на реальных фото меню из кейса.
 * Блок закреплён на экране, пока человек листает: фото «после» плавно проявляется поверх «до», подписи сменяются.
 * Без JS и при «уменьшить движение» — два фото рядом, всё видно сразу.
 */
export function ScrollScene({ before, after, href, copy, aspect = 915 / 1280 }: { before: string; after: string; href: string; copy: SceneCopy; aspect?: number }) {
  const { locale, dict } = useApp();
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [static_, setStatic] = useState(true);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStatic(reduce);
    if (reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - innerHeight;
      // прогресс 0…1 за время, пока сцена закреплена; переход занимает середину, края — «пауза» на до и после
      const raw = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      setP(Math.min(1, Math.max(0, (raw - 0.15) / 0.6)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const phone = (img: string, alt: string, extra?: React.ReactNode) => (
    <div className="relative mx-auto w-fit rounded-[34px] bg-device p-[7px] shadow-device">
      <div className="relative w-[min(300px,62vw)] overflow-hidden rounded-[28px] bg-surface lg:w-[340px]" style={{ aspectRatio: String(aspect), maxHeight: '72svh' }}>
        <Image src={img} alt={alt} fill sizes="340px" className="object-cover" />
        {extra}
      </div>
    </div>
  );

  if (static_) {
    // статичный вариант: до и после рядом
    return (
      <section ref={ref} id="scene" className="border-b border-line bg-bg py-16 md:py-24">
        <div className="container">
          <p className="max-w-xl text-[15px] text-muted">{copy.caption}</p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            {[
              { img: before, h: copy.before, t: copy.beforeText },
              { img: after, h: copy.after, t: copy.afterText },
            ].map((x) => (
              <figure key={x.img}>
                {phone(x.img, x.h)}
                <figcaption className="mx-auto mt-5 max-w-sm text-center">
                  <span className="h3 block">{x.h}</span>
                  <span className="mt-1 block text-muted">{x.t}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const showAfter = p > 0.5;
  return (
    <section ref={ref} id="scene" className="relative border-b border-line bg-bg" style={{ height: '260vh' }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="container grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          {/* подписи: «до» уходит, «после» приходит */}
          <div className="relative min-h-[150px] lg:min-h-[220px]">
            <p className="text-[15px] text-muted">{copy.caption}</p>
            <div className="relative mt-4">
              {[
                { on: !showAfter, h: copy.before, t: copy.beforeText },
                { on: showAfter, h: copy.after, t: copy.afterText },
              ].map((x, i) => (
                <div
                  key={i}
                  className="transition duration-500 [transition-property:opacity,transform]"
                  style={{ position: i ? 'absolute' : 'relative', inset: i ? 0 : undefined, opacity: x.on ? 1 : 0, transform: `translateY(${x.on ? 0 : i ? 16 : -16}px)` }}
                  aria-hidden={!x.on}
                >
                  <p className="text-[clamp(32px,6vw,72px)] font-semibold leading-[1.02] tracking-[-0.03em]">{x.h}</p>
                  <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{x.t}</p>
                </div>
              ))}
            </div>
            <Link prefetch={false} href={`/${locale}${href}`} className="mt-6 hidden items-center gap-1.5 font-semibold text-accent hover:underline lg:inline-flex">
              {copy.link}
              <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* телефон: «после» проявляется по мере прокрутки */}
          {phone(
            before,
            copy.before,
            <>
              <div className="absolute inset-0" style={{ opacity: p }}>
                <Image src={after} alt={copy.after} fill sizes="340px" className="object-cover" />
              </div>
              {/* метки «до/после» в углу телефона */}
              <span className="absolute right-3 top-9 rounded-md bg-dark/80 px-2 py-1 text-[12px] font-semibold text-onaccent" style={{ opacity: 1 - p }}>
                {dict.beforeAfter.before}
              </span>
              <span className="absolute right-3 top-9 rounded-md bg-accent px-2 py-1 text-[12px] font-semibold text-onaccent" style={{ opacity: p }}>
                {dict.beforeAfter.after}
              </span>
            </>,
          )}
        </div>
        {/* полоска прогресса сцены */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-accent" style={{ width: `${p * 100}%` }} aria-hidden="true" />
      </div>
    </section>
  );
}
