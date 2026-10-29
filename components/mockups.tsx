import { cx } from './ui';

export function Phone({ children, className, label, aspect = 9 / 19 }: { children: React.ReactNode; className?: string; label?: string; aspect?: number }) {
  return (
    <div className={cx('relative rounded-[34px] bg-device p-[7px] shadow-device ring-1 ring-device/30', className)} role={label ? 'img' : undefined} aria-label={label}>
      <div className="relative overflow-hidden rounded-[28px] bg-surface" style={{ aspectRatio: String(aspect) }}>
        {children}
        <div className="absolute left-1/2 top-2 h-[16px] w-[32%] -translate-x-1/2 rounded-full bg-device" />
      </div>
    </div>
  );
}

/** Окно браузера с точками — для сайтов. */
export function BrowserFrame({ children, className, url }: { children: React.ReactNode; className?: string; url?: string }) {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-line bg-surface shadow-device', className)}>
      <div className="flex items-center gap-1.5 border-b border-line bg-bg px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        {url && <span className="ml-3 truncate rounded-md bg-surface px-3 py-0.5 text-[13px] text-muted">{url}</span>}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

