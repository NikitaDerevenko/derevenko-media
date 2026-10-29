import Image from 'next/image';
import { getDict } from '@/lib/i18n';
import { ABOUT_PHOTO, REVIEWS_URL, type Locale } from '@/lib/site';
import { publicFileExists } from '../project-cards';
import { ArrowUpRight, Section, SectionHead } from '../ui';

const VIDEO = '/about/intro.mp4';

export function AboutSection({ locale }: { locale: Locale; num?: string }) {
  const t = getDict(locale).about;
  const hasPhoto = publicFileExists(ABOUT_PHOTO);
  const hasVideo = publicFileExists(VIDEO);

  return (
    <Section id="about" tone="surface">
      <SectionHead title={t.title} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-bg lg:mx-0">
            {hasPhoto ? (
              <Image src={ABOUT_PHOTO} alt={t.photoAlt} fill sizes="(min-width: 1024px) 384px, 90vw" className="object-cover" />
            ) : (
              // заглушка до появления настоящего фото: инициалы в фирменном цвете
              <div role="img" aria-label={t.photoAlt} className="grid h-full w-full place-items-center bg-accent-soft">
                <span className="text-[96px] font-semibold tracking-tight text-accent">{t.initials}</span>
              </div>
            )}
            
          </div>
          {hasVideo && (
            <figure className="mx-auto mt-5 max-w-sm">
              <video controls preload="none" playsInline className="w-full rounded-2xl bg-dark" aria-label={t.video}>
                <source src={VIDEO} type="video/mp4" />
              </video>
              <figcaption className="mt-2 text-center text-[14px] text-muted">{t.video}</figcaption>
            </figure>
          )}
        </div>

        <div>
          <div className="space-y-5 text-[17px] leading-relaxed text-ink/85">
            {t.paragraphs.map((p, i) => (
              <p key={p.slice(0, 24)} className={i === 0 ? 'text-[22px] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[26px]' : undefined}>
                {p}
              </p>
            ))}
          </div>
          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {t.stats.map((s) => (
              <div key={s.label} className="border-t border-line pt-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-[30px] font-semibold leading-none tracking-[-0.02em] md:text-[34px]">{s.value}</dd>
                <dd className="mt-2 text-[14px] leading-snug text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Отзывы клиентов — дословно, с источником для проверки */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h3 className="h3">{t.reviews.title}</h3>
          <a href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent hover:underline">
            {t.reviews.source} · t.me/otzivyMDK
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {t.reviews.items.map((r) => (
            <li key={r.who}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-bg p-6">
                <blockquote className="flex-1 text-[16px] leading-relaxed">{locale === 'ru' ? `«${r.text}»` : `“${r.text}”`}</blockquote>
                <figcaption className="mt-4 text-[14px] text-muted">— {r.who}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] text-muted">{t.reviews.note}</p>
      </div>
    </Section>
  );
}
