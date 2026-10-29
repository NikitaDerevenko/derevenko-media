import Link from 'next/link';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-[10px] text-[16px] font-semibold leading-none transition active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Главная кнопка — зелёная заливка; вторая — спокойная обводка в цвет текста */
export const btn = {
  primary: `${base} bg-accent px-6 py-[15px] text-onaccent hover:bg-accent-dark`,
  secondary: `${base} border border-line bg-bg px-6 py-[14px] text-ink hover:border-ink`,
  /** Контурная на тёмном фоне */
  secondaryDark: `${base} border border-dark-line px-6 py-[14px] text-onaccent hover:border-onaccent`,
  link: 'inline-flex items-center gap-1.5 text-[16px] font-semibold text-accent underline-offset-4 hover:underline',
};

/** Секция: белая или второго тона (surface) */
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
    <section id={id} className={cx('cv-auto py-16 md:py-24', tone === 'surface' ? 'bg-surface' : 'bg-bg', className)}>
      <div className="container">{children}</div>
    </section>
  );
}

/** Тёмная секция — ровный графитовый фон, используется точечно */
export function DarkPanel({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cx('cv-auto bg-dark text-onaccent', className)}>
      <div className="container relative py-16 md:py-24">{children}</div>
    </section>
  );
}

/** Заголовок секции: h2 и подзаголовок. num оставлен в сигнатуре для совместимости и не выводится. */
export function SectionHead({
  title,
  sub,
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
    <div className={cx('mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center')}>
      <div className="max-w-2xl">
        <h2 className={cx('h2', dark && 'text-onaccent')}>{title}</h2>
        {sub && <p className={cx('mt-4 text-[17px] leading-relaxed md:text-lg', dark ? 'text-dark-muted' : 'text-muted')}>{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

export function Badge({ children, tone = 'tag' }: { children: React.ReactNode; tone?: 'concept' | 'sample' | 'tag' | 'tagDark' | 'accent' }) {
  const styles = {
    // заметная плашка: залитый акцент
    concept: 'bg-accent-soft text-accent-dark',
    sample: 'bg-accent-soft text-accent-dark',
    tag: 'bg-surface text-muted',
    tagDark: 'bg-dark-2 text-dark-muted',
    accent: 'bg-accent-soft text-accent-dark',
  }[tone];
  return <span className={cx('inline-flex items-center rounded-md px-2.5 py-1 text-[13px] font-medium leading-tight', styles)}>{children}</span>;
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

/** Словесный знак: имя и фамилия. name передаётся из словаря (RU/EN). */
export function Logo({ className, dark, name = 'Nikita Derevenko' }: { className?: string; dark?: boolean; name?: string }) {
  return (
    <span className={cx('block whitespace-nowrap text-[18px] font-semibold tracking-[-0.01em]', dark ? 'text-onaccent' : 'text-ink', className)}>
      {name}
    </span>
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
