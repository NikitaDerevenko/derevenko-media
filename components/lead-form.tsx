'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { goal } from '@/lib/metrika';
import { LEAD_URL, TELEGRAM_URL } from '@/lib/site';
import { readUtm } from '@/lib/utm';
import { useApp } from './providers';
import { ConsentField } from './consent-field';
import { TrackedLink } from './tracked-link';
import { Arrow, btn, Check, cx } from './ui';

type Variant = 'audit' | 'contact';

/** Ответы экспресс-разбора (ниша, город, что есть) — дописываются в заявку на разбор */
function miniAuditContext() {
  try {
    const v = sessionStorage.getItem('mini-audit');
    return v ? `Экспресс-разбор: ${v}` : '';
  } catch {
    return '';
  }
}
type Status = 'idle' | 'sending' | 'success' | 'error';
type Field = 'link' | 'contact' | 'message' | 'consent';
type Errors = Partial<Record<Field, string>>;

/**
 * Две формы обращения:
 *  audit   — «Получить бесплатный разбор»: ссылка на карточку/сайт/кабинет + контакт;
 *  contact — «Обсудить проект»: направление + коротко о задаче + контакт.
 * Не больше трёх полей, без автофокуса, понятные ошибки, экран успеха.
 */
export function LeadForm({ variant, defaultDirection }: { variant: Variant; defaultDirection?: string }) {
  const { locale, dict, market } = useApp();
  const a = dict.audit;
  const c = dict.contact;
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ link: '', contact: '', message: '', direction: defaultDirection ?? 'other', company: '' });
  const [consent, setConsent] = useState(false);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as Field]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = (): Errors => {
    const er: Errors = {};
    if (variant === 'audit' && values.link.trim().length < 4) er.link = a.errors.link;
    if (variant === 'contact' && values.message.trim().length < 2) er.message = c.errors.message;
    if (values.contact.trim().length < 3) er.contact = variant === 'audit' ? a.errors.contact : c.errors.contact;
    if (!consent) er.consent = dict.consentField.error;
    return er;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    const first = (['link', 'message', 'contact', 'consent'] as Field[]).find((f) => er[f]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      if (!LEAD_URL) throw new Error('NEXT_PUBLIC_LEAD_URL не задан');
      const res = await fetch(LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: variant,
          link: values.link,
          contact: values.contact,
          message: variant === 'audit' ? miniAuditContext() : values.message,
          direction: variant === 'contact' ? c.fields.directionOptions[values.direction as keyof typeof c.fields.directionOptions] : undefined,
          consent, // отметка согласия на обработку ПД
          company: values.company, // ловушка для спам-ботов
          elapsed: Date.now() - startedAt.current,
          market,
          locale,
          page: window.location.pathname,
          utm: readUtm(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
      if (variant === 'audit') goal('audit_request', { market });
      goal('lead_form_success', { type: variant, market });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-start justify-center rounded-2xl border border-line bg-bg p-7">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-onaccent">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-5 text-2xl font-semibold">{a.success.title}</p>
        <p className="mt-2 text-muted">{a.success.text}</p>
        <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className={cx(btn.secondary, 'mt-6')}>
          Telegram
        </TrackedLink>
      </div>
    );
  }

  const errText = (f: Field) =>
    errors[f] ? (
      <p id={`${uid}-${f}-err`} className="mt-2 text-[14px] font-medium text-accent">
        {errors[f]}
      </p>
    ) : null;
  const errProps = (f: Field) => ({
    'aria-invalid': Boolean(errors[f]) || undefined,
    'aria-describedby': errors[f] ? `${uid}-${f}-err` : undefined,
  });
  const fieldCls = (f?: Field) => cx('field', f && errors[f] && 'border-accent');
  const labelCls = 'mb-2 block text-[14px] font-medium text-ink';

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-5">
      {variant === 'audit' ? (
        <div>
          <label htmlFor={`${uid}-link`} className={labelCls}>
            {a.fields.link}
          </label>
          <input id={`${uid}-link`} name="link" type="text" inputMode="url" autoComplete="url" placeholder={a.fields.linkPh} value={values.link} onChange={set('link')} className={fieldCls('link')} {...errProps('link')} />
          {errText('link')}
        </div>
      ) : (
        <>
          <div>
            <label htmlFor={`${uid}-direction`} className={labelCls}>
              {c.fields.direction}
            </label>
            <select id={`${uid}-direction`} name="direction" value={values.direction} onChange={set('direction')} className={fieldCls()}>
              {Object.entries(c.fields.directionOptions).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-message`} className={labelCls}>
              {c.fields.message}
            </label>
            <textarea id={`${uid}-message`} name="message" rows={3} placeholder={c.fields.messagePh} value={values.message} onChange={set('message')} className={cx(fieldCls('message'), 'resize-y')} {...errProps('message')} />
            {errText('message')}
          </div>
        </>
      )}

      <div>
        <label htmlFor={`${uid}-contact`} className={labelCls}>
          {variant === 'audit' ? a.fields.contact : c.fields.contact}
        </label>
        <input
          id={`${uid}-contact`}
          name="contact"
          type="text"
          autoComplete="on"
          placeholder={variant === 'audit' ? a.fields.contactPh : c.fields.contactPh}
          value={values.contact}
          onChange={set('contact')}
          className={fieldCls('contact')}
          {...errProps('contact')}
        />
        {errText('contact')}
      </div>

      {/* honeypot: скрыто от людей, боты заполняют */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set('company')} />
        </label>
      </div>

      <ConsentField
        id={`${uid}-consent`}
        checked={consent}
        onChange={(v) => {
          setConsent(v);
          if (v && errors.consent) setErrors((er) => ({ ...er, consent: undefined }));
        }}
        error={errors.consent}
      />

      {status === 'error' && (
        <p role="alert" className="text-[14px] font-medium text-accent">
          {a.errors.server}{' '}
          <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className="underline">
            @{TELEGRAM_URL.split('/').pop()}
          </TrackedLink>
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className={cx(btn.primary, 'w-full disabled:opacity-60')}>
        {status === 'sending' ? a.sending : variant === 'audit' ? a.submit : c.submit}
        {status !== 'sending' && <Arrow />}
      </button>
    </form>
  );
}
