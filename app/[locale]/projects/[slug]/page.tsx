import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BeforeAfter } from '@/components/before-after';
import { ProjectOpenGoal } from '@/components/chrome';
import { BrowserFrame, Phone } from '@/components/mockups';
import { CandleCover, lumosProofLine, publicFileExists } from '@/components/project-cards';
import { TwoPathButtons } from '@/components/two-paths';
import { Arrow, Badge, cx } from '@/components/ui';
import { getDict } from '@/lib/i18n';
import { clientLabel, coverFor, galleryFor, getProject, isVisible, neighbours, PROJECTS } from '@/lib/projects';
import { isFilled, LOCALES, LUMOS_PROOF_IMAGE, PHOTO_CASE_RESULTS, type Locale } from '@/lib/site';

type Params = { locale: Locale; slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROJECTS.filter((p) => isVisible(p, locale)).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params: paramsP }: { params: Promise<Params> }): Promise<Metadata> {
  const params = await paramsP;
  const p = getProject(params.slug);
  if (!p) return {};
  const alt = LOCALES.filter((l) => isVisible(p, l));
  return {
    title: p.title[params.locale],
    description: p.summary[params.locale],
    alternates: {
      canonical: `/${params.locale}/projects/${p.slug}`,
      languages: Object.fromEntries(alt.map((l) => [l, `/${l}/projects/${p.slug}`])),
    },
    openGraph: { title: p.title[params.locale], description: p.summary[params.locale], url: `/${params.locale}/projects/${p.slug}`, type: 'article', images: [{ url: `/og/${params.locale}.png`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [`/og/${params.locale}.png`] },
  };
}

export default async function ProjectPage({ params: paramsP }: { params: Promise<Params> }) {
  const params = await paramsP;
  const { locale, slug } = params;
  const p = getProject(slug);
  if (!p || !isVisible(p, locale)) notFound();
  const dict = getDict(locale);
  const t = dict.projects;
  const isLumos = p.slug === 'ads-lumos';
  const cover = coverFor(p, locale);
  const gallery = galleryFor(p, locale);
  const proof = isLumos ? lumosProofLine(locale) : null;
  const proofImg = isLumos && publicFileExists(LUMOS_PROOF_IMAGE);
  const photoResult = PHOTO_CASE_RESULTS[p.slug];
  const showPhotoResult = photoResult && isFilled(photoResult.items, photoResult.published, photoResult.term);
  const { prev, next } = neighbours(p, locale);

  return (
    <article>
      <ProjectOpenGoal slug={p.slug} />

      <header className="bg-bg">
        <div className="container pb-12 pt-8 md:pb-16 md:pt-12">
          <Link prefetch={false} href={`/${locale}#${p.isSolution ? 'solutions' : 'projects'}`} className="inline-flex items-center gap-2 text-[15px] font-medium text-muted hover:text-ink">
            <Arrow className="h-3.5 w-3.5 rotate-180" />
            {p.isSolution ? dict.solutions.back : dict.common.back}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {p.tags.map((tag) => (
              <Badge key={tag.ru} tone="tag">
                {tag[locale]}
              </Badge>
            ))}
          </div>
          <h1 className="h1 mt-6 max-w-[24ch]">{p.title[locale]}</h1>
          <p className="mt-5 text-[16px] text-muted">
            {p.isSolution ? `${dict.solutions.label}: ${clientLabel(p, locale)}` : `${clientLabel(p, locale)}, ${p.year}`}
          </p>
        </div>
      </header>

      {/* обложка на спокойной серой подложке */}
      <section className="bg-surface">
        <div>
          <div className="container py-10 md:py-16">
            {isLumos && cover ? (
              <figure className="mx-auto max-w-5xl overflow-hidden rounded-2xl">
                <Image src={cover.src} alt={cover.alt[locale]} width={cover.w} height={cover.h} priority sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
              </figure>
            ) : isLumos ? (
              <CandleCover locale={locale} size="lg" className="relative aspect-[16/9] w-full rounded-2xl md:aspect-[21/9]" />
            ) : p.beforeAfter ? (
              <div className={cx('mx-auto', p.beforeAfter.w / p.beforeAfter.h > 0.6 ? 'max-w-[460px]' : 'max-w-[340px]')}>
                <Phone label={p.title[locale]} aspect={p.beforeAfter.w / p.beforeAfter.h}>
                  <BeforeAfter
                    {...p.beforeAfter}
                    labels={{ before: dict.beforeAfter.before, after: dict.beforeAfter.after, slider: dict.beforeAfter.label }}
                    alt={p.title[locale]}
                    priority
                    sizes="460px"
                    className="[&_.ba-slider]:rounded-none [&_figure]:rounded-none"
                  />
                </Phone>
              </div>
            ) : cover && cover.w === 1536 ? (
              // готовый слайд-презентация: показываем как есть, без рамки браузера
              <figure className="mx-auto max-w-5xl overflow-hidden rounded-2xl">
                <Image src={cover.src} alt={cover.alt[locale]} width={cover.w} height={cover.h} priority sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
              </figure>
            ) : cover ? (
              <BrowserFrame className="mx-auto max-w-5xl">
                <div className="relative max-h-[720px] overflow-hidden">
                  <Image src={cover.src} alt={cover.alt[locale]} width={cover.w} height={cover.h} priority sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
                </div>
              </BrowserFrame>
            ) : null}
            {p.coverCaption && <p className="mx-auto mt-4 max-w-5xl text-center text-[14px] text-muted">{p.coverCaption[locale]}</p>}
          </div>
        </div>
      </section>

      <div className="container py-16 md:py-24">
        {/* задача и что сделал */}
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <section>
            <h2 className="text-[15px] font-semibold text-muted">{p.isSolution ? dict.solutions.task : t.task}</h2>
            <p className="mt-4 text-[22px] font-medium leading-snug tracking-[-0.01em] md:text-[26px]">{p.task[locale]}</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold text-muted">{t.did}</h2>
            <ol className="mt-5 border-t border-line">
              {p.steps.map((s, i) => (
                <li key={s.ru} className="grid grid-cols-[32px_1fr] gap-3 border-b border-line py-5">
                  <span className="text-[15px] font-semibold text-muted">{i + 1}</span>
                  <span className="text-[17px] leading-relaxed">{s[locale]}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* «Итог работы» для кейсов с фото — только когда значения заполнены в lib/site.ts */}
        {showPhotoResult && (
          <section className="card mt-16 p-7 md:p-10">
            <h2 className="h3">{t.resultBlock}</h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                [t.resultItems, photoResult.items],
                [t.resultPublished, photoResult.published],
                [t.resultTerm, photoResult.term],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-line pt-4">
                  <dt className="text-[14px] text-muted">{k}</dt>
                  <dd className="mt-2 text-lg font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* результаты — только при наличии данных */}
        {p.results.length > 0 && (
          <section className="mt-20 rounded-2xl bg-surface p-6 md:p-12">
            <h2 className="h2">{t.resultsTitle}</h2>
            <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {p.results.map((r) => (
                <li key={r.text.ru} className="border-t border-line pt-5">
                  <p className="flex items-center gap-2 text-[14px] text-muted">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                    {r.label[locale]}
                  </p>
                  <p className="mt-2 text-[19px] font-semibold leading-snug md:text-[21px]">{r.text[locale]}</p>
                  {r.note && <p className="mt-2 text-[14px] text-muted">{r.note[locale]}</p>}
                </li>
              ))}
            </ul>
            {proof && (
              <div className="mt-10 rounded-2xl border border-line bg-bg p-5">
                <p className="text-[14px] text-muted">{t.proofTitle}</p>
                <p className="mt-2 text-[16px] leading-relaxed">{proof}</p>
              </div>
            )}
            {proofImg && (
              <figure className="mt-8 overflow-hidden rounded-2xl border border-line bg-bg">
                <Image src={LUMOS_PROOF_IMAGE} alt={t.proofImage} width={1600} height={1000} sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
                <figcaption className="px-4 py-3 text-[14px] text-muted">{t.proofImage}</figcaption>
              </figure>
            )}
            <p className="mt-10 text-[14px] text-muted">
              {p.resultsSource && (
                <>
                  {t.source}: {p.resultsSource[locale]}
                </>
              )}
              {p.resultsPeriod && (
                <>
                  {'. '}
                  {t.period}: {p.resultsPeriod[locale]}
                </>
              )}
            </p>
          </section>
        )}

        {p.testimonial && (
          <figure className="mx-auto mt-20 max-w-4xl">
            <p className="text-[15px] font-semibold text-muted">{t.testimonial}</p>
            <blockquote className="mt-4 border-l-4 border-accent pl-6 text-[24px] font-medium leading-snug tracking-[-0.01em] md:text-[32px]">
              {locale === 'ru' ? `«${p.testimonial.text.ru}»` : `“${p.testimonial.text.en}”`}
            </blockquote>
            <figcaption className="mt-5 text-muted">— {p.testimonial.author?.[locale] ?? t.defaultAuthor}</figcaption>
          </figure>
        )}

        {gallery.length > 0 && (
          <section className="mt-20">
            <h2 className="h2 mb-10">{t.gallery}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img) =>
                img.tall ? (
                  <figure key={img.src} className="mx-auto w-full max-w-[320px]">
                    <Phone>
                      <div className="no-scrollbar absolute inset-0 overflow-y-auto" tabIndex={0} aria-label={`${img.alt[locale]}. ${t.mobile}`}>
                        <Image src={img.src} alt={img.alt[locale]} width={img.w} height={img.h} sizes="320px" className="h-auto w-full" />
                      </div>
                    </Phone>
                    <figcaption className="mt-3 text-center text-[14px] text-muted">{t.mobile}</figcaption>
                  </figure>
                ) : (
                  <figure key={img.src} className={cx('card overflow-hidden', img.w / img.h > 1.2 && 'sm:col-span-2 lg:col-span-3')}>
                    <Image src={img.src} alt={img.alt[locale]} width={img.w} height={img.h} sizes="(min-width: 1024px) 1100px, 100vw" className="h-auto w-full" />
                    {img.caption && <figcaption className="px-5 py-4 text-[14px] text-muted">{img.caption[locale]}</figcaption>}
                  </figure>
                ),
              )}
            </div>
          </section>
        )}

        {/* CTA: два равноправных пути; для готового решения главный — «Обсудить проект» */}
        <section className="card mt-24 grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:items-end md:p-12">
          <div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{p.isSolution ? dict.solutions.pageCta.title : t.cta.title}</h2>
            <p className="mt-5 max-w-2xl text-muted">{p.isSolution ? dict.solutions.pageCta.text : t.cta.text}</p>
          </div>
          <TwoPathButtons locale={locale} primary={p.isSolution ? 'project' : 'audit'} />
        </section>

        {/* Соседние работы того же раздела */}
        {(prev || next) && (
          <nav aria-label={t.more} className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { p: prev, label: t.prev, dir: 'prev' },
              { p: next, label: t.next, dir: 'next' },
            ].map(
              (x) =>
                x.p && (
                  <Link
                    key={x.dir}
                    prefetch={false}
                    href={`/${locale}/projects/${x.p.slug}`}
                    className={cx('card group flex flex-col gap-2 p-6 transition hover:border-accent', x.dir === 'next' && 'sm:text-right')}
                  >
                    <span className={cx('caps flex items-center gap-2 text-muted', x.dir === 'next' && 'sm:justify-end')}>
                      {x.dir === 'prev' && <Arrow className="h-3.5 w-3.5 rotate-180" />}
                      {x.label}
                      {x.dir === 'next' && <Arrow className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-lg font-semibold leading-snug group-hover:text-accent">{x.p.title[locale]}</span>
                  </Link>
                ),
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
