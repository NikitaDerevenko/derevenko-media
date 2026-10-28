'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BeforeAfter } from './before-after';
import { CandleCover } from './candle-cover';
import { Laptop, Phone } from './mockups';
import { useApp } from './providers';
import { Arrow, ArrowDown, ArrowUpRight, btn, Check } from './ui';

export type HeroSlide = { slug: string; title: string; img?: string; position?: string };
export type HeroShowcase = { before: string; after: string; w: number; h: number; focus?: 'top' | 'bottom' };

/** Данные слайдов передаёт сервер (app/[locale]/page.tsx) — в браузер не уходит весь список кейсов */
export function Hero({ slides, showcase }: { slides: HeroSlide[]; showcase?: HeroShowcase }) {
  const { locale, dict } = useApp();
  const h = dict.hero;
  const [i, setI] = useState(0);
  const slide = slides[i];
  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);
  const home = `/${locale}`;

  return (
    <section className="relative overflow-hidden bg-bg pb-16 pt-6 md:pb-24 md:pt-12">
      <div className="container grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-10">
        {/* Слева: оффер. На мобильном идёт первым и целиком помещается в 390×844 */}
        <div className="flex flex-col">
          <h1 className="text-[30px] font-semibold leading-[1.08] tracking-tight sm:text-[40px] lg:text-[52px]">{h.h1}</h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted sm:text-lg">{h.sub}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={`${home}#contact`} className={btn.primary}>
              {h.ctaPrimary}
              <Arrow />
            </a>
            <a href={`${home}#projects`} className={btn.secondary}>
              {h.ctaSecondary}
              <ArrowDown />
            </a>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {h.facts.map((f) => (
              <li key={f} className="flex items-start gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2 text-[14px] font-medium leading-snug">
                <Check className="mt-px h-4 w-4 text-accent" />
                {f}
              </li>
            ))}
          </ul>
          {/* Личный бренд: с первого экрана видно, кто будет делать работу */}
          <a
            href={`${home}#about`}
            className="group mt-7 flex items-center gap-4 rounded-[22px] border border-line bg-surface p-3 shadow-soft transition hover:border-accent sm:self-start sm:pr-8"
          >
            <Image
              src="/about/photo.jpg"
              alt={h.personal.name}
              width={120}
              height={150}
              sizes="120px"
              className="h-[136px] w-[108px] shrink-0 rounded-2xl object-cover object-top sm:h-[150px] sm:w-[120px]"
            />
            <span className="min-w-0">
              <span className="caps block text-accent">{h.personal.label}</span>
              <span className="mt-1.5 block text-[20px] font-semibold leading-tight">{h.personal.name}</span>
              <span className="mt-1 block text-[14px] leading-snug text-muted">{h.personal.note}</span>
              <span className="mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent group-hover:underline">
                {h.personal.more}
                <Arrow className="h-3.5 w-3.5" />
              </span>
            </span>
          </a>
        </div>

        {/* Справа: слова направлений и макеты */}
        <div className="flex min-w-0 flex-col">
          <div className="big-words-box relative">
            <div aria-hidden="true" className="sphere absolute -top-4 left-0 hidden h-14 w-14 animate-float lg:block" />
            <p aria-hidden="true" className="big-words text-right">
              {h.big.map((w) => (
                <span key={w} className="block">
                  {w}
                </span>
              ))}
            </p>
            <div className="mt-4 flex justify-end">
              <a href={`${home}#audit`} className="group inline-flex items-center gap-2 text-xl font-semibold text-accent md:text-2xl">
                {h.auditLink}
                <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Ноутбук и телефон рядом — без наложения */}
          <figure className="mt-10" aria-label={h.slides}>
            <div className="flex items-end gap-3 sm:gap-5">
              <Laptop label={slide.title} className="min-w-0 flex-[3]">
                {slide.slug === 'ads-lumos' && !slide.img ? (
                  <CandleCover locale={locale} className="absolute inset-0" />
                ) : (
                  slide.img && (
                    <Image
                      key={slide.img}
                      src={slide.img}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 460px, 70vw"
                      className="object-cover"
                      style={{ objectPosition: slide.position ?? 'center' }}
                    />
                  )
                )}
              </Laptop>
              {showcase && (
                <Phone label={h.beforeAfterCaption} className="mb-1 w-[24%] max-w-[150px] shrink-0">
                  <BeforeAfter
                    {...showcase}
                    aspect={9 / 19}
                    position={showcase.focus ?? 'bottom'}
                    labels={{ before: dict.beforeAfter.before, after: dict.beforeAfter.after, slider: dict.beforeAfter.label }}
                    alt={h.beforeAfterCaption}
                    sizes="150px"
                    eager
                    compact
                    className="[&_.ba-slider]:rounded-none [&_figure]:rounded-none"
                  />
                </Phone>
              )}
            </div>
            {/* Подпись слайда — под макетами, без обрезки и не поверх изображения */}
            <figcaption className="mt-4 flex items-center gap-3">
              <Link prefetch={false} href={`${home}/projects/${slide.slug}`} className="min-w-0 flex-1 text-[15px] font-semibold leading-snug hover:text-accent">
                {slide.title}
              </Link>
              <span className="shrink-0 text-[14px] font-semibold text-muted">
                {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => go(-1)} aria-label={h.prev} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent text-accent hover:bg-accent hover:text-onaccent">
                <Arrow className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={h.next} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-onaccent hover:bg-accent-dark">
                <Arrow className="h-4 w-4" />
              </button>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
