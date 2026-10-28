import Link from 'next/link';
import { LOGO } from './logo-paths';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full text-[14px] font-semibold uppercase tracking-caps transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Все кнопки — в фиолетовом акценте: залитая (главная) и контурная (вторая) */
export const btn = {
  primary: `${base} bg-accent px-7 py-4 text-onaccent shadow-accent hover:bg-accent-dark`,
  secondary: `${base} border border-accent px-7 py-[15px] text-accent hover:bg-accent hover:text-onaccent`,
  /** Контурная на тёмном фоне */
  secondaryDark: `${base} border border-accent/80 px-7 py-[15px] text-onaccent hover:bg-accent`,
  link: 'inline-flex items-center gap-1.5 text-[16px] font-semibold text-accent underline-offset-4 hover:underline',
};

/** Светлая секция: огромный заголовок капсом + сквозной номер справа */
export function Section({
  id,
  children,
  className,
  tone = 'bg',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: 'bg' | 'surface';
}) {
  return (
    <section id={id} className={cx('cv-auto py-20 md:py-28', tone === 'surface' ? 'bg-surface' : 'bg-bg', className)}>
      <div className="container">{children}</div>
    </section>
  );
}

/** Тёмная секция-панель со скруглением и сеткой */
export function DarkPanel({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cx('cv-auto bg-bg px-2 py-2 md:px-4 md:py-4', className)}>
      <div className="grid-bg relative overflow-hidden rounded-[28px] text-onaccent md:rounded-[40px]">
        <div className="container relative py-20 md:py-28">{children}</div>
      </div>
    </section>
  );
}

export function SectionHead({
  title,
  sub,
  num,
  dark,
  align = 'left',
  aside,
}: {
  title: string;
  sub?: string;
  num?: string;
  dark?: boolean;
  align?: 'left' | 'center';
  aside?: React.ReactNode;
}) {
  return (
    <div className={cx('mb-12 md:mb-16', align === 'center' && 'text-center')}>
      <div className={cx('flex items-end gap-6', align === 'center' ? 'justify-center' : 'justify-between')}>
        <h2
          className={cx(
            'display',
            // длинные заголовки — на ступень мельче, чтобы не рвались на 4 строки
            title.length > 18 ? 'text-[34px] sm:text-5xl lg:text-[64px]' : 'text-[44px] sm:text-6xl lg:text-[88px]',
            dark && 'text-onaccent',
          )}
        >
          {title}
        </h2>
        {num && align === 'left' && <span className={cx('mb-2 text-lg font-semibold', dark ? 'text-lime' : 'text-accent')}>{num}</span>}
      </div>
      {num && align === 'center' && <span className={cx('mt-3 block text-lg font-semibold', dark ? 'text-lime' : 'text-accent')}>{num}</span>}
      {(sub || aside) && (
        <div className={cx('mt-6 flex flex-col gap-6 md:flex-row md:items-end', align === 'center' ? 'items-center justify-center' : 'md:justify-between')}>
          {sub && <p className={cx('max-w-2xl text-lg leading-relaxed md:text-xl', dark ? 'text-dark-muted' : 'text-muted')}>{sub}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}

export function Badge({ children, tone = 'tag' }: { children: React.ReactNode; tone?: 'concept' | 'sample' | 'tag' | 'tagDark' | 'accent' }) {
  const styles = {
    // заметная плашка: залитый акцент
    concept: 'bg-accent text-onaccent',
    sample: 'bg-accent text-onaccent',
    tag: 'border border-line text-muted',
    tagDark: 'border border-dark-line text-dark-muted',
    accent: 'bg-accent text-onaccent',
  }[tone];
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-caps', styles)}>{children}</span>;
}

export function CtaLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link prefetch={false} href={href} className={cx(btn.primary, className)}>
      {children}
      <Arrow />
    </Link>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cx('h-4 w-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cx('h-4 w-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 14L14 6M7 6h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowDown({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cx('h-4 w-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M5 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cx('h-5 w-5 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cx('h-5 w-5 shrink-0', className)} fill="currentColor">
      <path d="M21.9 4.3c.3-1.2-.5-1.7-1.4-1.4L2.9 9.7c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l2.8-14.4zM8.3 12.3l9.6-6c.5-.3.9-.1.5.2l-7.8 7.1-.3 3.3-2-4.6z" />
    </svg>
  );
}

/** Логотип DEREVENKO / NIKITA. Буквы — цвет текста, деталь в K — акцент. */
export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <svg
      role="img"
      aria-label="Nikita Derevenko"
      viewBox={`0 0 ${LOGO.w} ${LOGO.h}`}
      className={cx('block h-[26px] w-auto min-[360px]:h-[30px]', dark ? 'text-onaccent' : 'text-ink', className)}
    >
      <path fillRule="evenodd" fill="currentColor" d={LOGO.ink} />
      <path className="text-accent" fill="currentColor" d={LOGO.accent} />
    </svg>
  );
}

/** Хлебные крошки */
export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumbs" className="text-[14px] text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {it.href ? (
              <Link prefetch={false} href={it.href} className="hover:text-accent">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
