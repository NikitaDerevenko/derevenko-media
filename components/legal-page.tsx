import type { Metadata } from 'next';
import Link from 'next/link';
import { fill, getDict } from '@/lib/i18n';
import type { LegalDoc } from '@/lib/i18n/ru';
import { LEGAL, SITE, type Locale } from '@/lib/site';

export const LEGAL_PAGES = ['privacy', 'consent', 'terms'] as const;
export type LegalPageId = (typeof LEGAL_PAGES)[number];

/** Документ страницы и подпись ссылки на него в подвале */
function docOf(id: LegalPageId, locale: Locale): { doc: LegalDoc; label: string } {
  const d = getDict(locale);
  if (id === 'privacy') return { doc: d.privacy, label: d.footer.privacy };
  if (id === 'consent') return { doc: d.consentDoc, label: d.footer.consent };
  return { doc: d.terms, label: d.footer.terms };
}

/** Подстановки в текст документов — из lib/site.ts */
function vars(locale: Locale) {
  return {
    name: LEGAL.name[locale],
    inn: LEGAL.inn,
    site: SITE.url.replace(/^https?:\/\//, ''),
    telegram: `@${SITE.telegram}`,
    email: SITE.email ? (locale === 'ru' ? ` или email ${SITE.email}` : ` or email ${SITE.email}`) : '',
  };
}

export function legalMetadata(id: LegalPageId, locale: Locale): Metadata {
  const { doc } = docOf(id, locale);
  return {
    title: doc.title,
    alternates: { canonical: `/${locale}/${id}`, languages: { ru: `/ru/${id}`, en: `/en/${id}` } },
  };
}

export function LegalPage({ id, locale }: { id: LegalPageId; locale: Locale }) {
  const dict = getDict(locale);
  const { doc } = docOf(id, locale);
  const v = vars(locale);
  const t = (s: string) => fill(s, v);
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight md:text-[44px] md:leading-tight">{doc.title}</h1>
      <p className="mt-3 text-[14px] text-muted">{fill(dict.legal.updated, { date: LEGAL.updated[locale] })}</p>
      <p className="mt-8 text-[17px] leading-relaxed text-ink/85">{t(doc.intro)}</p>
      <ol className="mt-10 space-y-10">
        {doc.sections.map((s, i) => (
          <li key={s.h} id={s.id}>
            <h2 className="text-xl font-semibold md:text-2xl">
              <span className="mr-3 text-accent">{i + 1}.</span>
              {s.h}
            </h2>
            {s.p?.map((p) => (
              <p key={p.slice(0, 32)} className="mt-3 text-[16px] leading-relaxed text-ink/85">
                {t(p)}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-ink/85 marker:text-accent">
                {s.list.map((x) => (
                  <li key={x.slice(0, 32)}>{t(x)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <nav aria-label={dict.legal.related} className="mt-14 border-t border-line pt-6">
        <p className="caps text-muted">{dict.legal.related}</p>
        <ul className="mt-3 flex flex-col gap-2 text-[16px]">
          {LEGAL_PAGES.filter((x) => x !== id).map((x) => (
            <li key={x}>
              <Link prefetch={false} href={`/${locale}/${x}`} className="font-semibold text-accent hover:underline">
                {docOf(x, locale).label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
