import { cx } from './ui';

/** Ноутбук, нарисованный CSS: экран — любой контент. */
export function Laptop({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className={cx('relative', className)} role={label ? 'img' : undefined} aria-label={label}>
      <div className="relative mx-auto w-[86%] rounded-t-[18px] bg-device p-[1.6%] pb-[2.4%] shadow-device ring-1 ring-device/40">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-surface">{children}</div>
      </div>
      {/* корпус */}
      <div className="relative mx-auto h-0 w-full pb-[3.2%]">
        <div className="absolute inset-0 rounded-b-[22px] rounded-t-[4px] bg-gradient-to-b from-device-body via-device-body to-device-edge" />
        <div className="absolute left-1/2 top-0 h-[38%] w-[16%] -translate-x-1/2 rounded-b-[10px] bg-device-edge" />
      </div>
    </div>
  );
}

/** Телефон, нарисованный CSS. */
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

/** Изометрическая «лестница» из блоков с шаром — для этапов работы. Цвета — из палитры. */
export function Stairs({ className }: { className?: string }) {
  const steps = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 420 220" className={className} aria-hidden="true">
      {steps.map((i) => {
        const x = 20 + i * 74;
        const h = 34 + i * 26;
        const y = 190 - h;
        return (
          <g key={i}>
            <path d={`M${x} ${y} l18 -12 h64 l-18 12z`} className="fill-surface" />
            <rect x={x} y={y} width="64" height={h} rx="3" className="fill-line" />
            <path d={`M${x + 64} ${y} l18 -12 v${h} l-18 12z`} className="fill-device-body" />
          </g>
        );
      })}
      <ellipse cx="358" cy="46" rx="16" ry="3" className="fill-ink/10" />
      <circle cx={358} cy={26} r="19" className="fill-accent" />
      <circle cx={351} cy={19} r="5" className="fill-onaccent/70" />
    </svg>
  );
}

/** Иконки-плитки для квиза: объёмные SVG в цветах палитры (тёмный блок, фиолетовый + лаймовый маркер). */
export function QuizIcon({ kind }: { kind: string }) {
  const common = { viewBox: '0 0 96 96', className: 'h-14 w-14 md:h-16 md:w-16', 'aria-hidden': true } as const;
  const a = 'fill-accent';
  const d = 'fill-dark-line';
  const m = 'fill-lime';
  switch (kind) {
    case 'promotion':
      return (
        <svg {...common}>
          <path d="M48 12c-14 0-24 10-24 23 0 17 24 41 24 41s24-24 24-41c0-13-10-23-24-23z" className={a} />
          <circle cx="48" cy="35" r="9" className={d} />
          <path d="M66 62l12-12 6 6" className="fill-none stroke-lime" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'website':
      return (
        <svg {...common}>
          <rect x="10" y="18" width="70" height="52" rx="8" className={d} />
          <rect x="18" y="36" width="28" height="24" rx="4" className={a} />
          <rect x="52" y="36" width="20" height="4" rx="2" className="fill-dark-muted" />
          <rect x="52" y="44" width="16" height="4" rx="2" className="fill-dark-muted" />
          <rect x="52" y="52" width="20" height="8" rx="4" className={m} />
        </svg>
      );
    case 'bot':
      return (
        <svg {...common}>
          <rect x="16" y="26" width="64" height="46" rx="14" className={d} />
          <rect x="44" y="14" width="8" height="14" rx="4" className={a} />
          <circle cx="36" cy="49" r="7" className={a} />
          <circle cx="60" cy="49" r="7" className={a} />
          <path d="M30 72l-6 12 18-12" className={d} />
        </svg>
      );
    case 'miniapp':
      return (
        <svg {...common}>
          <rect x="26" y="10" width="44" height="76" rx="10" className={d} />
          <rect x="32" y="20" width="32" height="20" rx="5" className={a} />
          <rect x="32" y="46" width="14" height="14" rx="4" className={a} />
          <rect x="50" y="46" width="14" height="14" rx="4" className={m} />
          <rect x="32" y="66" width="32" height="8" rx="4" className="fill-dark-muted" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="48" cy="48" r="30" className={d} />
          <path d="M40 40a8 8 0 1 1 11 7c-2 1-3 3-3 5v2" className="fill-none stroke-accent" strokeWidth="6" strokeLinecap="round" />
          <circle cx="48" cy="64" r="4" className={m} />
        </svg>
      );
  }
}
