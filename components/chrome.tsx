'use client';

import Link from 'next/link';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { goal, hit, readConsent, writeConsent, YM_ID, type Consent } from '@/lib/metrika';
import { fill } from '@/lib/i18n/helpers';
import { LEGAL, SITE, TELEGRAM_URL } from '@/lib/site';
import { useApp } from './providers';
import { TrackedLink } from './tracked-link';
import { btn, cx, Logo } from './ui';

export function Footer() {
  const { locale, dict } = useApp();
  return (
    <footer className="border-t border-line bg-bg pb-28 pt-14 md:pb-14">
      <div className="container flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[14px] text-muted">{dict.footer.role}</p>
        </div>
        <div className="flex flex-col gap-2 text-[14px]">
          <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className="font-semibold hover:text-accent">
            Telegram · @{SITE.telegram}
          </TrackedLink>
          {SITE.email && (
            <TrackedLink goalName="click_email" href={`mailto:${SITE.email}`} className="font-semibold hover:text-accent">
              {SITE.email}
            </TrackedLink>
          )}
          <span className="text-muted">{dict.footer.hours}</span>
        </div>
        <nav aria-label={dict.footer.terms} className="flex flex-col gap-2 text-[14px] text-muted">
          {(['privacy', 'consent', 'terms'] as const).map((id) => (
            <Link key={id} prefetch={false} href={`/${locale}/${id}`} className="hover:text-ink">
              {dict.footer[id]}
            </Link>
          ))}
        </nav>
      </div>
      {/* Реквизиты исполнителя (ЗоЗПП, ст. 9) и оговорка об оферте */}
      <div className="container mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[13px] leading-relaxed text-muted md:flex-row md:flex-wrap md:items-center md:justify-between">
        <p>
          {fill(dict.footer.requisites, { name: LEGAL.name[locale], inn: LEGAL.inn })} ·{' '}
          <a href={LEGAL.checkUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            {dict.footer.checkStatus}
          </a>
        </p>
        <p>{dict.footer.notOffer}</p>
        <p>{fill(dict.footer.copyright, { year: String(new Date().getFullYear()) })}</p>
      </div>
    </footer>
  );
}

/** Липкая кнопка на мобильных. Ведёт к форме «Обсудить проект», прячется, когда на экране формы или квиз. */
export function StickyCta() {
  const { locale, dict } = useApp();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  // форма есть на главной и страницах направлений; с остальных страниц кнопка ведёт на главную
  const formOnPage = pathname === `/${locale}` || pathname.startsWith(`/${locale}/services/`);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // прячемся, пока на экране формы (#start) или квиз — иначе кнопка перекрывает их «Далее» и «Отправить»
    const targets = ['start', 'calculator'].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    let io: IntersectionObserver | undefined;
    if (targets.length && 'IntersectionObserver' in window) {
      const seen = new Map<Element, boolean>();
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => seen.set(e.target, e.isIntersecting));
          setFormVisible([...seen.values()].some(Boolean));
        },
        { threshold: 0 },
      );
      targets.forEach((t) => io!.observe(t));
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, [pathname]);

  // на юридических страницах кнопка мешает читать документ
  const isLegal = /\/(privacy|consent|terms)$/.test(pathname);
  const visible = show && !formVisible && !isLegal;
  return (
    <div
      className={cx(
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!visible}
    >
      <a href={formOnPage ? '#contact' : `/${locale}#contact`} tabIndex={visible ? 0 : -1} className={cx(btn.primary, 'w-full')}>
        {dict.sticky.cta}
      </a>
    </div>
  );
}

/** Баннер cookie + Яндекс Метрика (только после согласия). */
export function CookieConsent() {
  const { locale, dict } = useApp();
  const pathname = usePathname();
  // undefined — ещё не прочитано. Баннер есть в HTML с первого кадра (без позднего появления),
  // а если согласие уже дано, его прячет скрипт в <head> (класс has-consent) до отрисовки.
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  // init сам считает первый просмотр; дальше — просмотры при переходах внутри сайта
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (consent !== 'all') return;
    if (lastPath.current !== null && lastPath.current !== pathname) hit(window.location.href);
    lastPath.current = pathname;
  }, [pathname, consent]);

  const choose = (v: Consent) => {
    writeConsent(v);
    setConsent(v);
  };

  return (
    <>
      {consent === 'all' && YM_ID > 0 && (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false,defer:true});`}
        </Script>
      )}
      {consent == null && (
        <div role="dialog" aria-live="polite" aria-label="Cookie" className="cookie-banner fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-4 shadow-soft md:bottom-5 md:p-5">
          <p className="text-[14px] leading-relaxed text-ink">
            {dict.cookie.text}{' '}
            <Link prefetch={false} href={`/${locale}/privacy#cookies`} className="underline hover:text-ink">
              {dict.cookie.more}
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose('all')} className={cx(btn.primary, 'px-5 py-3')}>
              {dict.cookie.accept}
            </button>
            <button type="button" onClick={() => choose('necessary')} className={cx(btn.secondary, 'px-5 py-3')}>
              {dict.cookie.decline}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Цель project_open_<slug> при открытии страницы кейса. */
export function ProjectOpenGoal({ slug }: { slug: string }) {
  useEffect(() => {
    // даём Метрике инициализироваться
    const id = window.setTimeout(() => goal(`project_open_${slug}`), 1500);
    return () => window.clearTimeout(id);
  }, [slug]);
  return null;
}
