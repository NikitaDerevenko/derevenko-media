import { getDict } from '@/lib/i18n';
import { DEMO_BOTS, SITE, TELEGRAM_URL, type Locale } from '@/lib/site';
import { LeadForm } from '../lead-form';
import { TrackedLink } from '../tracked-link';
import Image from 'next/image';
import { publicFileExists } from '../project-cards';
import { Check, Section, SectionHead, TelegramIcon, btn, cx } from '../ui';

/**
 * Два равноправных пути обращения рядом:
 *  #audit   — бесплатный разбор для действующего бизнеса (ссылка + контакт);
 *  #contact — обсудить проект для нового сайта, бота или Mini App (направление + задача + контакт).
 */
export function StartSection({ locale, num, defaultDirection, primary = 'audit' }: { locale: Locale; num?: string; defaultDirection?: string; primary?: 'audit' | 'project' }) {
  const dict = getDict(locale);
  const a = dict.audit;
  const c = dict.contact;
  const auditCard = (
    <div key="audit" id="audit" className="card flex flex-col p-6 md:p-8">
      <h3 className="text-2xl font-semibold md:text-3xl">{a.title}</h3>
      <p className="mt-2 text-muted">{a.sub}</p>
      <ul className="mt-5 space-y-2">
        {a.gets.map((g) => (
          <li key={g} className="flex gap-2.5 text-[16px]">
            <Check className="mt-0.5 h-4 w-4 text-accent" />
            {g}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] text-muted">{a.term}</p>
      <div className="mt-6">
        <LeadForm variant="audit" />
      </div>
    </div>
  );
  const projectCard = (
    <div key="contact" id="contact" className="card flex flex-col p-6 md:p-8">
      <h3 className="text-2xl font-semibold md:text-3xl">{c.title}</h3>
      <p className="mt-2 text-muted">{c.sub}</p>
      <div className="mt-6">
        <LeadForm variant="contact" defaultDirection={defaultDirection} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5 text-[14px] text-muted">
        <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
          <TelegramIcon className="h-4 w-4" />@{SITE.telegram}
        </TrackedLink>
        {SITE.email && (
          <TrackedLink goalName="click_email" href={`mailto:${SITE.email}`} className="font-semibold text-accent hover:underline">
            {SITE.email}
          </TrackedLink>
        )}
        <span>{c.hours}</span>
      </div>
    </div>
  );
  const s = dict.start;
  const photo = '/about/photo.jpg';
  return (
    <Section id="start">
      <SectionHead title={s.title} sub={s.sub} num={num} />
      {/* Кто ответит на заявку — живой человек, а не «менеджер» */}
      <div className="mb-6 flex items-center gap-4 rounded-[20px] border border-line bg-surface p-4 md:p-5">
        {publicFileExists(photo) && (
          <Image src={photo} alt={s.personal.name} width={96} height={120} sizes="96px" className="h-[110px] w-[88px] shrink-0 rounded-2xl object-cover object-top md:h-[120px] md:w-[96px]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold leading-tight">{s.personal.name}</p>
          <p className="mt-1 text-[14px] leading-snug text-muted">
            {s.personal.role} · {s.personal.reply}
          </p>
        </div>
        <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className={cx(btn.secondary, 'hidden shrink-0 px-5 py-3 sm:inline-flex')}>
          <TelegramIcon className="h-4 w-4" />
          Telegram
        </TrackedLink>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">{primary === 'audit' ? [auditCard, projectCard] : [projectCard, auditCard]}</div>
      {/* Что будет после заявки — чтобы не оставалось вопросов «а дальше что?» */}
      <div className="mt-10">
        <h3 className="caps text-muted">{s.after.title}</h3>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {s.after.steps.map((step, i) => (
            <li key={step.title} className="border-t border-line pt-4">
              <span className="text-[14px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-[17px] font-semibold">{step.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-8 text-[14px] text-muted">{dict.guarantees.short}</p>
    </Section>
  );
}

/** Демо-боты: рендерится, только когда в lib/site.ts заданы username. */
export function BotsSection({ locale, num }: { locale: Locale; num?: string }) {
  const t = getDict(locale).bots;
  const bots = [
    { user: DEMO_BOTS.booking, label: t.booking },
    { user: DEMO_BOTS.lead, label: t.lead },
  ].filter((b) => b.user);
  if (bots.length === 0) return null;
  return (
    <Section id="demo">
      <SectionHead title={t.title} sub={t.sub} num={num} />
      <div className="grid gap-5 md:grid-cols-2">
        {bots.map((b) => (
          <div key={b.user} className="card flex flex-col items-start gap-4 p-7">
            <p className="text-xl font-semibold">{b.label}</p>
            <TrackedLink goalName="demo_bot_click" href={`https://t.me/${b.user}`} className={cx(btn.secondary)}>
              <TelegramIcon className="h-4 w-4" />
              {t.open} · @{b.user}
            </TrackedLink>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Вопросы — таблицей, ответы видны сразу (лучше для SEO и для сканирования глазами) */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((f, i) => (
        <li key={f.q} className="grid gap-3 border-b border-line py-8 md:grid-cols-[64px_1fr_1.25fr] md:gap-6 md:py-10">
          <span className="text-[14px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="text-lg font-semibold leading-snug md:text-xl">{f.q}</h3>
          <p className="text-[16px] leading-relaxed text-muted">{f.a}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqSection({ locale, num }: { locale: Locale; num: string }) {
  const t = getDict(locale).faq;
  return (
    <Section id="faq">
      <SectionHead title={t.title} num={num} />
      <FaqList items={t.items} />
    </Section>
  );
}
