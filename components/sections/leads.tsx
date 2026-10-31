import { getDict } from '@/lib/i18n';
import { DEMO_BOTS, SITE, TELEGRAM_URL, type Locale } from '@/lib/site';
import { LeadForm } from '../lead-form';
import { TrackedLink } from '../tracked-link';
import Image from 'next/image';
import Link from 'next/link';
import { ARTICLES } from '@/lib/articles';
import { publicFileExists } from '../project-cards';
import { Tabs } from '../tabs';
import { Check, Section, SectionHead, TelegramIcon, btn, cx } from '../ui';

/**
 * Финальный блок: кто ответит, что будет после заявки и одна форма с двумя вкладками:
 *  #audit   — бесплатный разбор для действующего бизнеса (ссылка + контакт);
 *  #contact — новый проект: сайт, бот или Mini App (направление + задача + контакт).
 */
export function StartSection({ locale, defaultDirection, primary = 'audit' }: { locale: Locale; num?: string; defaultDirection?: string; primary?: 'audit' | 'project' }) {
  const dict = getDict(locale);
  const a = dict.audit;
  const c = dict.contact;
  const s = dict.start;
  const avatar = '/about/avatar.jpg';
  const auditPanel = (
    <div key="audit">
      <p className="text-muted">{a.sub}</p>
      <ul className="mt-4 space-y-1.5">
        {a.gets.map((g) => (
          <li key={g} className="flex gap-2.5 text-[16px]">
            <Check className="mt-1 h-4 w-4 text-accent" />
            {g}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <LeadForm variant="audit" />
      </div>
    </div>
  );
  const projectPanel = (
    <div key="contact">
      <p className="text-muted">{c.sub}</p>
      <div className="mt-6">
        <LeadForm variant="contact" defaultDirection={defaultDirection} />
      </div>
    </div>
  );
  const order = primary === 'audit' ? ['audit', 'contact'] : ['contact', 'audit'];
  return (
    <Section id="start">
      <span id="audit" className="block" aria-hidden="true" />
      <span id="contact" className="block" aria-hidden="true" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <h2 className="h2">{s.title}</h2>
          <p className="mt-4 text-[17px] text-muted">{s.sub}</p>

          {/* Кто ответит на заявку — живой человек, а не «менеджер» */}
          <div className="mt-8 flex items-center gap-4">
            {publicFileExists(avatar) && <Image src={avatar} alt="" width={64} height={64} sizes="64px" className="h-16 w-16 shrink-0 rounded-full object-cover object-top" />}
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{s.personal.name}</p>
              <p className="mt-1 text-[15px] leading-snug text-muted">{s.personal.reply}</p>
            </div>
          </div>
          <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className={cx(btn.secondary, 'mt-6')}>
            <TelegramIcon className="h-[18px] w-[18px]" />
            {dict.hero.ctaSecondary}
          </TrackedLink>
          {(SITE.phone || SITE.email) && (
            <ul className="mt-4 space-y-1 text-[15px]">
              {SITE.phone && (
                <li>
                  <span className="font-semibold">{SITE.phone}</span> <span className="text-muted">— {dict.footer.messengers}</span>
                </li>
              )}
              {SITE.email && (
                <li>
                  <TrackedLink goalName="click_email" href={`mailto:${SITE.email}`} className="font-semibold text-accent hover:underline">
                    {SITE.email}
                  </TrackedLink>
                </li>
              )}
            </ul>
          )}

          <h3 className="mt-12 text-[17px] font-semibold">{s.after.title}</h3>
          <ol className="mt-4 space-y-4">
            {s.after.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[14px] font-semibold">{i + 1}</span>
                <div>
                  <p className="font-semibold leading-snug">{step.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line bg-bg p-6 shadow-soft md:p-8">
          <Tabs
            id="lead"
            hashes={order}
            labels={order.map((k) => (k === 'audit' ? a.title : c.title))}
            panels={order.map((k) => (k === 'audit' ? auditPanel : projectPanel))}
          />
          <p className="mt-6 border-t border-line pt-5 text-[14px] text-muted">{dict.guarantees.short}</p>
        </div>
      </div>
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

/** Вопросы аккордеоном: ответы в HTML (видны поисковикам), раскрываются по клику */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <ul className="border-t border-line">
      {items.map((f) => (
        <li key={f.q} className="border-b border-line">
          <details className="group">
            <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-[17px] font-semibold leading-snug transition hover:text-accent md:text-[18px]">
              {f.q}
              <svg aria-hidden="true" viewBox="0 0 20 20" className="faq-icon mt-1 h-4 w-4 shrink-0 text-muted transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            </summary>
            <p className="max-w-[68ch] pb-6 text-[16px] leading-relaxed text-muted">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

export function FaqSection({ locale }: { locale: Locale; num?: string }) {
  const dict = getDict(locale);
  const t = dict.faq;
  // разметка FAQPage для поиска
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <Section id="faq" tone="surface">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <h2 className="h2">{t.title}</h2>
          <p className="mt-4 text-muted">
            {dict.faqAside.text}{' '}
            <TrackedLink goalName="click_telegram" href={TELEGRAM_URL} className="font-semibold text-accent hover:underline">
              @{SITE.telegram}
            </TrackedLink>
          </p>
          {/* ссылки на статьи — с главной, чтобы поиск их нашёл (только RU) */}
          {locale === 'ru' && (
            <nav aria-label={dict.articles.home} className="mt-8 border-t border-line pt-6">
              <p className="text-[15px] font-semibold">{dict.articles.home}</p>
              <ul className="mt-3 space-y-2.5">
                {ARTICLES.slice(0, 4).map((a) => (
                  <li key={a.slug}>
                    <Link prefetch={false} href={`/ru/stati/${a.slug}`} className="text-[15px] leading-snug text-ink/85 hover:text-accent">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href="/ru/stati" className="mt-3 inline-block text-[15px] font-semibold text-accent hover:underline">
                {dict.articles.all}
              </Link>
            </nav>
          )}
        </div>
        <FaqList items={t.items} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
}
