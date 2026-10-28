import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { fill, getDict } from '@/lib/i18n';
import { clientLabel, coverFor, type Project } from '@/lib/projects';
import { isFilled, LUMOS_PROOF, LUMOS_PROOF_IMAGE, type Locale } from '@/lib/site';
import { BeforeAfter } from './before-after';
import { CandleCover } from './candle-cover';
import { Arrow, ArrowUpRight, Badge, cx } from './ui';

export { CandleCover };

export function publicFileExists(p: string) {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', p));
  } catch {
    return false;
  }
}

/** Строка с данными под «×4»: показывается, только когда все плейсхолдеры в lib/site.ts заполнены */
export function lumosProofLine(locale: Locale) {
  const p = LUMOS_PROOF;
  if (!isFilled(p.period, p.spend, p.revenue, p.purchases, p.attribution, p.cutoff)) return null;
  return fill(getDict(locale).projects.proofLine, p);
}

export function FeaturedProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const dict = getDict(locale);
  const href = `/${locale}/projects/${project.slug}`;
  const proof = lumosProofLine(locale);
  const proofImg = publicFileExists(LUMOS_PROOF_IMAGE);
  const cover = coverFor(project, locale);
  return (
    <article className="card-dark group grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      <Link
        prefetch={false}
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cx('relative block overflow-hidden', cover ? 'bg-dark lg:flex lg:items-center' : 'min-h-[260px] md:min-h-[420px]')}
      >
        {cover ? (
          // обложка целиком, в своих пропорциях — цифры на слайде не обрезаются
          <Image src={cover.src} alt="" width={cover.w} height={cover.h} sizes="(min-width: 1024px) 640px, 100vw" className="h-auto w-full transition duration-700 group-hover:scale-[1.02]" />
        ) : (
          <CandleCover locale={locale} className="absolute inset-0 transition duration-700 group-hover:scale-[1.02]" />
        )}
      </Link>
      <div className="flex flex-col p-7 md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{dict.projects.featured}</Badge>
          {project.tags.map((t) => (
            <Badge key={t.ru} tone="tagDark">
              {t[locale]}
            </Badge>
          ))}
        </div>
        <p className="caps mt-6 text-dark-muted">
          {clientLabel(project, locale)} · {project.year}
        </p>
        <h3 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-onaccent md:text-[40px]">
          <Link prefetch={false} href={href} className="hover:text-accent-soft">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-4 text-dark-muted">{project.summary[locale]}</p>

        {project.results.length > 0 && project.highlights && (
          <>
            <dl className="mt-auto grid grid-cols-1 gap-4 pt-8 sm:grid-cols-3 sm:gap-3">
              {project.highlights.map((h) => (
                <div key={h.label.ru} className="border-t border-dark-line pt-4">
                  <dt className="sr-only">{h.label[locale]}</dt>
                  <dd className="flex items-center gap-2 whitespace-nowrap text-3xl font-semibold text-onaccent md:text-4xl">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lime" />
                    {h.value[locale]}
                  </dd>
                  <dd className="mt-2 text-[14px] leading-snug text-dark-muted">{h.label[locale]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[14px] leading-relaxed text-dark-muted">{dict.projects.knownLine}</p>
            {proof && <p className="mt-2 text-[14px] leading-relaxed text-dark-muted">{proof}</p>}
            {project.resultsSource && (
              <p className="mt-2 text-[14px] text-dark-muted">
                {dict.projects.source}: {project.resultsSource[locale]}
              </p>
            )}
            {proofImg && (
              <a href={LUMOS_PROOF_IMAGE} className="mt-2 text-[14px] text-accent-soft underline underline-offset-4">
                {dict.projects.proofImage}
              </a>
            )}
          </>
        )}

        <Link prefetch={false} href={href} className="caps mt-8 inline-flex items-center gap-2 self-start text-accent-soft hover:text-onaccent">
          {dict.common.readCase}
          <Arrow />
        </Link>
      </div>
    </article>
  );
}

/** Карточка готового решения для светлого блока «Готовые решения» */
export function SolutionCard({ project, locale }: { project: Project; locale: Locale }) {
  const dict = getDict(locale);
  const href = `/${locale}/projects/${project.slug}`;
  const cover = coverFor(project, locale);
  const ba = project.beforeAfter;
  const img = cover ?? (ba ? { src: ba.after, alt: project.title } : undefined);
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition hover:border-accent">
      <div className="relative aspect-[3/2] overflow-hidden bg-bg">
        {img && <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 420px, 85vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="caps text-accent">{clientLabel(project, locale)}</p>
        <h3 className="mt-2 text-[19px] font-semibold leading-snug">
          {/* ссылка растянута на всю карточку */}
          <Link prefetch={false} href={href} className="after:absolute after:inset-0 hover:text-accent">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{project.summary[locale]}</p>
        <p className="caps mt-4 flex items-center gap-2 text-accent">
          {dict.solutions.open}
          <Arrow className="h-3.5 w-3.5" />
        </p>
      </div>
    </article>
  );
}

/** Плитка кейса для тёмного блока */
/** wide — карточка на полряда (последний ряд из двух): картинка ниже по пропорции, чтобы не вытягивать ряд */
export function ProjectCard({ project, locale, wide }: { project: Project; locale: Locale; wide?: boolean }) {
  const dict = getDict(locale);
  const href = `/${locale}/projects/${project.slug}`;
  const ba = project.beforeAfter;
  const cover = coverFor(project, locale);
  return (
    <article className="card-dark group flex h-full flex-col overflow-hidden transition hover:border-accent">
      <div className="relative overflow-hidden">
        {ba ? (
          <BeforeAfter
            {...ba}
            aspect={wide ? 3 / 2 : 4 / 3}
            position={ba.focus ?? 'bottom'}
            labels={{ before: dict.beforeAfter.before, after: dict.beforeAfter.after, slider: dict.beforeAfter.label }}
            alt={project.title[locale]}
            sizes="(min-width: 1024px) 440px, (min-width: 768px) 50vw, 100vw"
            className="[&_.ba-slider]:rounded-none [&_figure]:rounded-none"
          />
        ) : cover ? (
          // единая рамка 3:2; широкие картинки (слайды, скриншоты экрана) вписываются целиком, без обрезки краёв,
          // высокие скриншоты страниц показываются с верха
          <Link prefetch={false} href={href} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden bg-dark" style={{ aspectRatio: '3 / 2' }}>
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 700px, (min-width: 768px) 50vw, 100vw"
              className={cx('transition duration-700 group-hover:scale-[1.04]', cover.w / cover.h >= 1.3 ? 'object-contain' : 'object-cover object-top')}
            />
          </Link>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className={project.isSolution ? 'caps text-accent-soft' : 'caps text-dark-muted'}>
          {project.isSolution ? `${dict.solutions.label} · ${clientLabel(project, locale)}` : `${clientLabel(project, locale)} · ${project.year}`}
        </p>
        <h3 className="mt-2 text-[22px] font-semibold leading-tight text-onaccent">
          <Link prefetch={false} href={href} className="hover:text-accent-soft">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[16px] leading-relaxed text-dark-muted">{project.summary[locale]}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <Badge key={t.ru} tone="tagDark">
                {t[locale]}
              </Badge>
            ))}
          </div>
          <Link
            prefetch={false}
            href={href}
            aria-label={`${dict.common.readCase}: ${project.title[locale]}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-onaccent transition group-hover:rotate-45"
          >
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
