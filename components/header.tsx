'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { goal } from '@/lib/metrika';
import { TELEGRAM_URL } from '@/lib/site';
import { useApp } from './providers';
import { TrackedLink } from './tracked-link';
import { cx, Logo, TelegramIcon } from './ui';

/** missingInOther — кейсы, которых нет в другой языковой версии (список передаёт layout, чтобы не тянуть данные кейсов в браузер) */
export function Header({ missingInOther = [] }: { missingInOther?: string[] }) {
  const { locale, dict } = useApp();
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const other = locale === 'ru' ? 'en' : 'ru';
  // работа, которой нет в другой версии (например, решение только для EN), — ведём на главную другой версии
  const slug = pathname.match(/\/projects\/([^/]+)/)?.[1];
  const otherPath = slug && missingInOther.includes(slug) ? `/${other}` : pathname.replace(/^\/(ru|en)(?=\/|$)/, `/${other}`);
  const home = `/${locale}`;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: `${home}#projects`, label: dict.nav.projects },
    { href: `${home}#solutions`, label: dict.nav.solutions },
    { href: `${home}#reviews`, label: dict.nav.reviews },
    { href: `${home}#services`, label: dict.nav.services },
    { href: `${home}#pricing`, label: dict.nav.pricing },
    { href: `${home}#about`, label: dict.nav.about },
    { href: `${home}#faq`, label: dict.nav.faq },
  ];

  return (
    <header className={cx('sticky top-0 z-40 transition-colors', scrolled || open ? 'border-b border-line bg-bg/90 backdrop-blur-md' : 'border-b border-transparent bg-bg')}>
      <div className="container flex h-[72px] items-center justify-between gap-2 sm:gap-6">
        <Link prefetch={false} href={home} aria-label="Nikita Derevenko">
          <Logo />
        </Link>

        <nav aria-label={dict.nav.menu} className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="caps text-ink transition hover:text-accent">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} aria-label="Telegram" className="hidden h-10 w-10 place-items-center text-accent transition hover:text-accent-dark sm:grid">
            <TelegramIcon />
          </TrackedLink>
          <Link prefetch={false}
            href={otherPath}
            hrefLang={other}
            onClick={() => goal('lang_switch', { to: other })}
            className="caps grid h-10 min-w-10 place-items-center px-2 text-muted transition hover:text-ink"
            aria-label={`${dict.langSwitch.other} — ${dict.langSwitch.otherName}`}
          >
            {dict.langSwitch.other}
          </Link>
          <a href={`${home}#contact`} className="caps hidden rounded-full bg-accent px-5 py-3 text-onaccent transition hover:bg-accent-dark sm:inline-flex">
            {dict.nav.cta}
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={dict.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 8h16M4 16h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label={dict.nav.menu} className="border-t border-line bg-bg lg:hidden">
          <ul className="container flex flex-col pb-6 pt-2">
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-line">
                <a href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4">
                  <span className="text-[14px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-2xl font-semibold uppercase">{l.label}</span>
                </a>
              </li>
            ))}
            <li className="pt-5">
              <a href={`${home}#contact`} onClick={() => setOpen(false)} className="caps flex w-full justify-center rounded-full bg-accent px-6 py-4 text-onaccent">
                {dict.nav.cta}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
