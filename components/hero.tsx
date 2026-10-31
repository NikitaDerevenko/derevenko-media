import Image from 'next/image';
import { Fragment } from 'react';
import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { TELEGRAM_URL, formatMoney, type Locale } from '@/lib/site';
import { CountUp } from './count-up';
import { TrackedLink } from './tracked-link';
import { Arrow, btn, Check, cx, TelegramIcon } from './ui';

/**
 * Реальные цифры из кейса «Концерты при свечах» (lib/projects.ts, ads-lumos → results: «Яндекс Директ, 30 дней»).
 * Меняются только вместе с кейсом: на первом экране — ровно то, что подтверждено кабинетом.
 */
const PROOF = { spend: 16060, revenue: 123600, drr: 13, slug: 'ads-lumos' };

/** Первый экран: обещание, одно главное действие, живой человек и одна карточка с настоящими цифрами */
export function Hero({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const h = dict.hero;
  const home = `/${locale}`;
  // кейс российский — суммы всегда в рублях, в том числе в английской версии
  const rub = (v: number) => formatMoney(v, 'ru', locale);
  const pct = locale === 'ru' ? `${PROOF.drr} %` : `${PROOF.drr}%`;
  const spendShare = Math.round((PROOF.spend / PROOF.revenue) * 100);

  return (
    <section className="border-b border-line bg-bg">
      <div className="container grid gap-12 pb-14 pt-10 md:pb-20 md:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
        <div>
          <h1 className="h1 max-w-[19ch]">
            {/* слова появляются по очереди — одна анимация при загрузке; текст для поиска и скринридеров цельный */}
            {h.h1.split(' ').map((w, i) => (
              <Fragment key={i}>
                <span className="word-mask">
                  <span className="word-in" style={{ animationDelay: `${80 + i * 45}ms` }}>
                    {w}
                  </span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-muted md:text-lg">{h.sub}</p>

          {/* На телефоне большая карточка с цифрами не помещается в первый экран — показываем её суть одной строкой */}
          <Link
            prefetch={false}
            href={`${home}/projects/${PROOF.slug}`}
            className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-accent-soft px-4 py-3 lg:hidden"
          >
            <span className="min-w-0">
              <span className="block text-[13px] leading-tight text-ink/70">{h.proof.label}</span>
              <span className="mt-1 block text-[15px] font-semibold leading-snug">
                {rub(PROOF.spend)} <span className="font-normal text-ink/70">→</span> <span className="text-accent">{rub(PROOF.revenue)}</span>
              </span>
              <span className="block text-[13px] leading-tight text-ink/70">
                {h.proof.short}
              </span>
            </span>
            <Arrow className="h-4 w-4 shrink-0 text-accent" />
          </Link>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={`${home}#start`} className={btn.primary}>
              {h.ctaPrimary}
              <Arrow />
            </a>
            <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className={btn.secondary}>
              <TelegramIcon className="h-[18px] w-[18px]" />
              {h.ctaSecondary}
            </TrackedLink>
          </div>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-snug text-muted">{h.ctaNote}</p>

          {/* Кто делает работу — видно с первого экрана */}
          <a href={`${home}#about`} className="group mt-10 inline-flex items-center gap-4">
            <Image
              src="/about/avatar.jpg"
              alt=""
              width={56}
              height={56}
              sizes="56px"
              priority
              className="h-14 w-14 shrink-0 rounded-full object-cover object-top"
            />
            <span>
              <span className="block font-semibold leading-tight group-hover:text-accent">{h.personal.name}</span>
              <span className="mt-1 block text-[15px] leading-tight text-muted">{h.personal.note}</span>
            </span>
          </a>
        </div>

        {/* Карточка-доказательство: расход против дохода, как в отчёте */}
        <figure className="hidden rounded-2xl border border-line bg-bg p-6 shadow-soft md:p-8 lg:block">
          <figcaption>
            <span className="block text-[15px] font-medium text-muted">{h.proof.label}</span>
            <span className="mt-1 block text-[20px] font-semibold tracking-[-0.01em]">{h.proof.channel}</span>
          </figcaption>

          <dl className="mt-7 space-y-6">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[15px] text-muted">{h.proof.spend}</dt>
                <dd className="text-[22px] font-semibold"><CountUp value={PROOF.spend} locale={locale === 'ru' ? 'ru-RU' : 'en-US'} suffix=" ₽" /></dd>
              </div>
              <div className="mt-2 h-3 rounded-full bg-surface" aria-hidden="true">
                <div className="hero-bar h-3 rounded-full bg-muted/50" style={{ width: `${spendShare}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[15px] text-muted">{h.proof.revenue}</dt>
                <dd className="text-[22px] font-semibold text-accent"><CountUp value={PROOF.revenue} locale={locale === 'ru' ? 'ru-RU' : 'en-US'} suffix=" ₽" /></dd>
              </div>
              <div className="mt-2 h-3 rounded-full bg-surface" aria-hidden="true">
                <div className="hero-bar hero-bar-late h-3 rounded-full bg-accent" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-5">
              <dt className="text-[15px] text-muted">{h.proof.drr}</dt>
              <dd className="text-[34px] font-semibold leading-none tracking-[-0.02em]">{pct}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <span className="text-muted">{h.proof.note}</span>
            <Link prefetch={false} href={`${home}/projects/${PROOF.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
              {h.proof.link}
              <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </figure>
      </div>

      {/* Полоса доверия: факты, которые снимают главные опасения */}
      <div className="border-t border-line bg-surface">
        <ul className="container grid grid-cols-1 gap-x-8 gap-y-3 py-5 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
          {h.facts.map((f) => (
            <li key={f} className={cx('flex items-center gap-2.5')}>
              <Check className="h-4 w-4 text-accent" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
