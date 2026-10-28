import { getDict } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import { Arrow, btn, cx } from './ui';

/**
 * Два равноправных пути обращения: бесплатный разбор (действующий бизнес) и обсуждение проекта (с нуля).
 * primary — какой из них главный на этой странице.
 */
export function TwoPathButtons({ locale, dark, primary = 'audit', base }: { locale: Locale; dark?: boolean; primary?: 'audit' | 'project'; base?: string }) {
  const c = getDict(locale).common;
  const home = base ?? `/${locale}`;
  const audit = { href: `${home}#audit`, label: c.auditCta };
  const project = { href: `${home}#contact`, label: c.projectCta };
  const [first, second] = primary === 'audit' ? [audit, project] : [project, audit];
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={first.href} className={cx(btn.primary, 'shrink-0')}>
        {first.label}
        <Arrow />
      </a>
      <a href={second.href} className={cx(dark ? btn.secondaryDark : btn.secondary, 'shrink-0')}>
        {second.label}
      </a>
    </div>
  );
}
