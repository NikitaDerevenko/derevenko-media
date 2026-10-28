'use client';

import Link from 'next/link';
import { useApp } from './providers';
import { cx } from './ui';

/**
 * Отметка согласия на обработку персональных данных.
 * Отдельная, не отмечена заранее и обязательна для отправки (152-ФЗ, ст. 9).
 */
export function ConsentField({
  id,
  checked,
  onChange,
  error,
  dark,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  dark?: boolean;
}) {
  const { locale, dict } = useApp();
  const c = dict.consentField;
  const muted = dark ? 'text-dark-muted' : 'text-muted';
  const linkCls = cx('underline underline-offset-2', dark ? 'hover:text-onaccent' : 'hover:text-ink');
  return (
    <div>
      <label htmlFor={id} className={cx('flex items-start gap-3 text-[14px] leading-relaxed', muted)}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
        />
        <span>
          {c.before}{' '}
          <Link prefetch={false} href={`/${locale}/consent`} target="_blank" className={linkCls}>
            {c.link}
          </Link>{' '}
          {c.middle}{' '}
          <Link prefetch={false} href={`/${locale}/privacy`} target="_blank" className={linkCls}>
            {c.policy}
          </Link>
        </span>
      </label>
      {error && (
        <p id={`${id}-err`} className={cx('mt-2 text-[14px] font-medium', dark ? 'text-accent-soft' : 'text-accent')}>
          {error}
        </p>
      )}
    </div>
  );
}
