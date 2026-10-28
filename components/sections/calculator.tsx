'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { NICHES } from '@/lib/calculator';
import { goal } from '@/lib/metrika';
import { formatPrice } from '@/lib/pricing';
import { PACKAGES, RECOMMENDED_PACKAGE, SERVICES, TELEGRAM_URL, type ServiceId } from '@/lib/site';
import { readUtm } from '@/lib/utm';
import { ConsentField } from '../consent-field';
import { QuizIcon } from '../mockups';
import { useApp } from '../providers';
import { TrackedLink } from '../tracked-link';
import { Arrow, Check, cx, DarkPanel, SectionHead, btn } from '../ui';

type Branch = 'promotion' | 'website' | 'bot' | 'miniapp' | 'unsure';
type StepId = 'q1' | 'sphere' | 'geo' | 'goal' | 'adBudget' | 'siteFormat' | 'siteFeatures' | 'content' | 'timing' | 'siteBudget' | 'botTasks' | 'botBudget' | 'describe' | 'contact';

/** Ветки квиза: шаги после «Что нужно?» зависят от выбора */
const BRANCH_STEPS: Record<Branch, StepId[]> = {
  promotion: ['sphere', 'geo', 'goal', 'adBudget'],
  website: ['siteFormat', 'siteFeatures', 'content', 'timing', 'siteBudget'],
  bot: ['botTasks', 'sphere', 'timing', 'botBudget'],
  miniapp: ['botTasks', 'sphere', 'timing', 'botBudget'],
  unsure: ['describe'],
};
const MULTI: StepId[] = ['siteFeatures', 'botTasks'];
const BRANCHES: Branch[] = ['promotion', 'website', 'bot', 'miniapp', 'unsure'];

type Answers = Partial<Record<StepId, string | string[]>>;

/** Квиз «С чего начать»: ветвление по направлению, в конце — контакт */
export function CalculatorSection({ num }: { num: string }) {
  const { locale, dict, market } = useApp();
  const q = dict.quiz;
  const uid = useId();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sphereOther, setSphereOther] = useState('');
  const [geoText, setGeoText] = useState('');
  const [describe, setDescribe] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<{ contact?: string; consent?: string }>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const used = useRef(false);
  const startedAt = useRef(0);
  const headRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const steps: StepId[] = useMemo(() => ['q1', ...(branch ? BRANCH_STEPS[branch] : []), 'contact'], [branch]);
  // прогресс считается по длине выбранной ветки; до выбора — по самой частой длине (6 шагов)
  const total = branch ? steps.length : 6;
  const step = steps[idx];

  const touch = () => {
    if (used.current) return;
    used.current = true;
    goal('calc_used');
  };

  // фокус на вопросе при смене шага — для клавиатуры и экранных читалок
  useEffect(() => {
    if (idx > 0) headRef.current?.focus();
  }, [idx]);

  const pick = (s: StepId, value: string) => {
    touch();
    setAnswers((a) => {
      if (MULTI.includes(s)) {
        const cur = (a[s] as string[] | undefined) ?? [];
        return { ...a, [s]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
      }
      return { ...a, [s]: a[s] === value ? undefined : value };
    });
  };
  const isOn = (s: StepId, v: string) => (MULTI.includes(s) ? ((answers[s] as string[] | undefined) ?? []).includes(v) : answers[s] === v);

  /** Варианты ответа для шага */
  const options = (s: StepId): { id: string; label: string }[] => {
    const map = (o: Record<string, string>) => Object.entries(o).map(([id, label]) => ({ id, label }));
    switch (s) {
      case 'sphere':
        return [...NICHES.map((n) => ({ id: n, label: dict.calculator.niches[n] })), { id: 'other', label: q.sphere.other }];
      case 'geo':
        return map(q.geo.options);
      case 'goal':
        return map(q.goal.options);
      case 'adBudget':
        return map(q.adBudget.options);
      case 'siteFormat':
        return map(q.siteFormat.options);
      case 'siteFeatures':
        return map(q.siteFeatures.options);
      case 'content':
        return map(q.content.options);
      case 'timing':
        return map(q.timing.options);
      case 'siteBudget':
        return map(q.siteBudget.options);
      case 'botTasks':
        return map(q.botTasks.options);
      case 'botBudget':
        return map(q.botBudget.options);
      default:
        return [];
    }
  };
  const title = (s: StepId): string => {
    if (s === 'q1') return q.q1.title;
    if (s === 'contact') return q.contactTitle;
    return (q as unknown as Record<string, { title: string }>)[s].title;
  };
  const label = (s: StepId, v: string) => options(s).find((o) => o.id === v)?.label ?? v;

  /** Ориентир по стоимости — из lib/site.ts по выбранной услуге */
  const estimate = (): string | null => {
    const w = dict.common;
    let id: ServiceId | null = null;
    if (branch === 'promotion') {
      const price = formatPrice(PACKAGES[market][RECOMMENDED_PACKAGE], false, market, locale, w);
      return /\d/.test(price) ? `${dict.packageNames[RECOMMENDED_PACKAGE]} — ${price}` : null;
    }
    if (branch === 'website') {
      const f = answers.siteFormat as string | undefined;
      id = f === 'card' ? 'website' : f === 'custom' || f === 'redo' ? 'customSite' : 'landing';
    }
    if (branch === 'bot') {
      const t = (answers.botTasks as string[] | undefined) ?? [];
      id = t.includes('payment') || t.includes('crm') ? 'botPay' : t.includes('catalog') ? 'botCatalog' : 'botLeads';
    }
    if (branch === 'miniapp') id = 'miniApp';
    if (!id) return null;
    const row = SERVICES[market][id];
    const price = formatPrice(row?.price, row?.monthly, market, locale, w, row?.to);
    return /\d/.test(price) ? `${dict.serviceNames[id]} — ${price}` : null;
  };

  const summary = (): string[] => {
    if (!branch) return [];
    const lines = [`${q.q1.title} ${q.q1.options[branch]}`];
    for (const s of BRANCH_STEPS[branch]) {
      if (s === 'describe') {
        if (describe.trim()) lines.push(`${title(s)}: ${describe.trim()}`);
        continue;
      }
      const a = answers[s];
      let text = Array.isArray(a) ? a.map((v) => label(s, v)).join(', ') : a ? label(s, a) : '';
      if (s === 'sphere' && a === 'other' && sphereOther.trim()) text = sphereOther.trim();
      if (s === 'geo') text = [geoText.trim(), a ? label(s, a as string) : ''].filter(Boolean).join(', ');
      if (text) lines.push(`${title(s)}: ${text}`);
    }
    return lines;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (contact.trim().length < 3) er.contact = q.errors.contact;
    if (!consent) er.consent = dict.consentField.error;
    setErrors(er);
    if (er.contact) return document.getElementById(`${uid}-contact`)?.focus();
    if (er.consent) return document.getElementById(`${uid}-consent`)?.focus();
    setStatus('sending');
    try {
      const est = estimate();
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz',
          consent,
          name,
          contact,
          message: [...summary(), est ? `= ${est}` : ''].filter(Boolean).join('\n'),
          company,
          elapsed: Date.now() - startedAt.current,
          market,
          locale,
          page: window.location.pathname,
          utm: readUtm(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
      goal('lead_form_success', { type: 'quiz', branch });
    } catch {
      setStatus('error');
    }
  };

  const optBtn = (on: boolean) =>
    cx(
      'relative rounded-2xl border px-4 py-3.5 text-left text-[16px] font-medium transition',
      on ? 'border-accent bg-accent/20 text-onaccent' : 'border-dark-line bg-dark text-dark-muted hover:border-accent/60 hover:text-onaccent',
    );

  const est = branch ? estimate() : null;

  return (
    <DarkPanel id="calculator">
      <SectionHead dark align="center" title={q.title} sub={q.sub} num={num} />

      <div className="mx-auto max-w-5xl rounded-[28px] border border-dark-line bg-dark-2 p-5 md:p-9">
        {status === 'success' ? (
          <div role="status" className="py-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-onaccent">
              <Check className="h-8 w-8" />
            </span>
            <p className="mt-6 text-3xl font-semibold">{q.success.title}</p>
            <p className="mt-2 text-dark-muted">{q.success.text}</p>
            <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className={cx(btn.secondaryDark, 'mt-8')}>
              Telegram
            </TrackedLink>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-[14px] text-dark-muted">
                {q.step} <span className="font-semibold text-onaccent">{String(idx + 1).padStart(2, '0')}</span> {q.of} {String(total).padStart(2, '0')}
              </p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-dark-line" aria-hidden="true">
                <div className="h-full rounded-full bg-lime transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
              </div>
            </div>

            <p ref={headRef} tabIndex={-1} className="mt-8 text-2xl font-semibold outline-none md:text-3xl">
              {title(step)}
            </p>
            {MULTI.includes(step) && <p className="mt-1 text-[14px] text-dark-muted">{q.multiHint}</p>}

            {step === 'q1' && (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                {BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={branch === b}
                    onClick={() => {
                      touch();
                      setBranch(b);
                    }}
                    className={cx(optBtn(branch === b), 'flex flex-col items-center gap-3 py-5 text-center', b === 'unsure' && 'col-span-2 md:col-span-1')}
                  >
                    {branch === b && <Check className="absolute right-3 top-3 h-5 w-5 text-lime" />}
                    <QuizIcon kind={b} />
                    {q.q1.options[b]}
                  </button>
                ))}
              </div>
            )}

            {step === 'describe' && (
              <textarea rows={3} value={describe} onChange={(e) => setDescribe(e.target.value)} placeholder={q.describe.ph} aria-label={q.describe.title} className="field-dark mt-6 resize-y" />
            )}

            {step === 'geo' && (
              <input type="text" value={geoText} onChange={(e) => setGeoText(e.target.value)} placeholder={q.geo.ph} aria-label={q.geo.title} className="field-dark mt-6 max-w-md" />
            )}

            {step !== 'q1' && step !== 'contact' && step !== 'describe' && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {options(step).map((o) => (
                  <button key={o.id} type="button" aria-pressed={isOn(step, o.id)} onClick={() => pick(step, o.id)} className={optBtn(isOn(step, o.id))}>
                    <span className="flex items-center gap-2">
                      {isOn(step, o.id) && <Check className="h-4 w-4 text-lime" />}
                      {o.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 'sphere' && answers.sphere === 'other' && (
              <input type="text" value={sphereOther} onChange={(e) => setSphereOther(e.target.value)} placeholder={q.sphere.otherPh} aria-label={q.sphere.other} className="field-dark mt-4 max-w-md" />
            )}

            {step === 'contact' && (
              <form noValidate onSubmit={submit} className="relative mt-6 grid gap-8 md:grid-cols-[1fr_1.1fr]">
                <div>
                  <p className="caps text-dark-muted">{q.chosen}</p>
                  <ul className="mt-3 space-y-2 text-[16px] text-dark-muted">
                    {summary().map((s) => (
                      <li key={s} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-lime" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 rounded-2xl border border-accent/60 p-4 text-[16px] text-onaccent">{est ? q.estimate.replace('{price}', est) : q.estimateLater}</p>
                  <p className="mt-3 text-[14px] text-dark-muted">{q.result}</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label htmlFor={`${uid}-name`} className="caps mb-2 block text-dark-muted">
                      {q.nameLabel}
                    </label>
                    <input id={`${uid}-name`} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={q.namePh} className="field-dark" />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-contact`} className="caps mb-2 block text-dark-muted">
                      {q.contactLabel}
                    </label>
                    <input
                      id={`${uid}-contact`}
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors((x) => ({ ...x, contact: undefined }));
                      }}
                      placeholder={q.contactPh}
                      aria-invalid={Boolean(errors.contact) || undefined}
                      aria-describedby={errors.contact ? `${uid}-contact-err` : undefined}
                      className={cx('field-dark', errors.contact && 'border-accent')}
                    />
                    {errors.contact && (
                      <p id={`${uid}-contact-err`} className="mt-2 text-[14px] font-medium text-accent-soft">
                        {errors.contact}
                      </p>
                    )}
                  </div>
                  <ConsentField
                    id={`${uid}-consent`}
                    dark
                    checked={consent}
                    onChange={(v) => {
                      setConsent(v);
                      if (v && errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
                    }}
                    error={errors.consent}
                  />
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  {status === 'error' && (
                    <p role="alert" className="text-[14px] text-accent-soft">
                      {dict.audit.errors.server}
                    </p>
                  )}
                  <button type="submit" disabled={status === 'sending'} className={cx(btn.primary, 'w-full disabled:opacity-60')}>
                    {status === 'sending' ? q.sending : q.submit}
                    <Arrow />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 flex items-center gap-3">
              {idx > 0 && (
                <button type="button" onClick={() => setIdx((i) => i - 1)} className={btn.secondaryDark}>
                  <Arrow className="rotate-180" />
                  {q.backBtn}
                </button>
              )}
              {step !== 'contact' && (
                <button type="button" disabled={step === 'q1' && !branch} onClick={() => setIdx((i) => i + 1)} className={cx(btn.primary, 'flex-1 disabled:cursor-not-allowed disabled:opacity-40')}>
                  {q.nextBtn}
                  <Arrow />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </DarkPanel>
  );
}
