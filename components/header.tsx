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
  // статьи есть только на русском — из них переключаем на главную другой версии
  const onlyHere = (slug && missingInOther.includes(slug)) || /\/stati(\/|$)/.test(pathname);
  const otherPath = onlyHere ? `/${other}` : pathname.replace(/^\/(ru|en)(?=\/|$)/, `/${other}`);
  const home = `/${locale}`;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: `${home}#projects`, label: dict.nav.projects },
    { href: `${home}#about`, label: dict.nav.about },
    { href: `${home}#reviews`, label: dict.nav.reviews },
    { href: `${home}#pricing`, label: dict.nav.pricing },
    { href: `${home}#faq`, label: dict.nav.faq },
  ];

  return (
    // При прокрутке шапка сжимается в «таблетку» по центру — меньше места, главная кнопка остаётся под рукой
    <header className="sticky top-0 z-40">
      <div className={cx('transition-all duration-300', scrolled && !open ? 'px-3 pt-2 lg:px-4' : 'border-b border-line bg-bg')}>
        <div
          className={cx(
            'mx-auto flex items-center justify-between gap-2 transition-all duration-300 sm:gap-6',
            scrolled && !open ? 'h-14 max-w-[1080px] rounded-full border border-line bg-bg/85 pl-5 pr-2 shadow-soft backdrop-blur-md' : 'container h-[68px]',
          )}
        >
          <Link prefetch={false} href={home} aria-label={dict.brand.name}>
            <Logo name={dict.brand.name} />
          </Link>

          <nav aria-label={dict.nav.menu} className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[15px] font-medium text-ink/80 transition hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} aria-label="Telegram" className="hidden h-10 w-10 place-items-center text-ink/70 transition hover:text-ink sm:grid">
              <TelegramIcon />
            </TrackedLink>
            <Link
              prefetch={false}
              href={otherPath}
              hrefLang={other}
              onClick={() => goal('lang_switch', { to: other })}
              className="grid h-10 min-w-10 place-items-center px-2 text-[14px] font-medium text-muted transition hover:text-ink"
              aria-label={`${dict.langSwitch.other} — ${dict.langSwitch.otherName}`}
            >
              {dict.langSwitch.other}
            </Link>
            <a href={`${home}#start`} className={cx('hidden rounded-full bg-accent px-5 text-[15px] font-semibold text-onaccent transition hover:bg-accent-dark sm:inline-flex sm:items-center', scrolled && !open ? 'h-10' : 'h-11')}>
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
      </div>

      {open && (
        <nav id="mobile-nav" aria-label={dict.nav.menu} className="border-t border-line bg-bg lg:hidden">
          <ul className="container flex flex-col pb-6 pt-2">
            {links.map((l) => (
              <li key={l.href} className="border-b border-line">
                <a href={l.href} onClick={() => setOpen(false)} className="block py-4 text-[20px] font-semibold">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-5">
              <a href={`${home}#start`} onClick={() => setOpen(false)} className="flex w-full justify-center rounded-[10px] bg-accent px-6 py-4 font-semibold text-onaccent">
                {dict.nav.cta}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
