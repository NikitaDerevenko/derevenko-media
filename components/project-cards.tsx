import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { fill, getDict } from '@/lib/i18n';
import { clientLabel, coverFor, type Project } from '@/lib/projects';
import { isFilled, LUMOS_PROOF, LUMOS_PROOF_IMAGE, type Locale } from '@/lib/site';
import { BeforeAfter } from './before-after';
import { CandleCover } from './candle-cover';
import { Arrow, Badge, cx } from './ui';

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
    <article className="card group grid overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Link
        prefetch={false}
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cx('relative block overflow-hidden bg-dark', cover ? 'lg:flex lg:items-center' : 'min-h-[260px] md:min-h-[420px]')}
      >
        {cover ? (
          // обложка целиком, в своих пропорциях — цифры на слайде не обрезаются
          <Image src={cover.src} alt="" width={cover.w} height={cover.h} sizes="(min-width: 1024px) 640px, 100vw" className="h-auto w-full" />
        ) : (
          <CandleCover locale={locale} className="absolute inset-0" />
        )}
      </Link>
      <div className="flex flex-col p-6 md:p-10">
        <p className="text-[15px] text-muted">
          {clientLabel(project, locale)}, {project.year}
        </p>
        <h3 className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[32px]">
          <Link prefetch={false} href={href} className="hover:text-accent">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-4 text-muted">{project.summary[locale]}</p>

        {project.results.length > 0 && project.highlights && (
          <>
            <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-3 sm:gap-4">
              {project.highlights.map((h) => (
                <div key={h.label.ru}>
                  <dt className="sr-only">{h.label[locale]}</dt>
                  <dd className="whitespace-nowrap text-[32px] font-semibold leading-none tracking-[-0.02em] text-accent">{h.value[locale]}</dd>
                  <dd className="mt-2 text-[14px] leading-snug text-muted">{h.label[locale]}</dd>
                </div>
              ))}
            </dl>
            {proof && <p className="mt-5 text-[14px] leading-relaxed text-muted">{proof}</p>}
            {project.resultsSource && (
              <p className="mt-4 text-[14px] text-muted">
                {dict.projects.source}: {project.resultsSource[locale]}
              </p>
            )}
            {proofImg && (
              <a href={LUMOS_PROOF_IMAGE} className="mt-2 text-[14px] text-accent underline underline-offset-4">
                {dict.projects.proofImage}
              </a>
            )}
          </>
        )}

        <Link prefetch={false} href={href} className="mt-8 inline-flex items-center gap-2 self-start font-semibold text-accent hover:underline">
          {dict.common.readCase}
          <Arrow />
        </Link>
      </div>
    </article>
  );
}

/** Карточка готового решения для светлого блока «Готовые решения» */
export function SolutionCard({ project, locale, compact }: { project: Project; locale: Locale; compact?: boolean }) {
  const dict = getDict(locale);
  const href = `/${locale}/projects/${project.slug}`;
  const cover = coverFor(project, locale);
  const ba = project.beforeAfter;
  const img = cover ?? (ba ? { src: ba.after, alt: project.title } : undefined);
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition hover:border-ink/40">
      <div className="relative aspect-[3/2] overflow-hidden border-b border-line bg-surface">
        {img && <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 420px, 85vw" className="object-cover object-top" />}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-[14px] text-muted">{clientLabel(project, locale)}</p>
        <h3 className="mt-1.5 text-[19px] font-semibold leading-snug">
          {/* ссылка растянута на всю карточку */}
          <Link prefetch={false} href={href} className="after:absolute after:inset-0 hover:text-accent">
            {project.title[locale]}
          </Link>
        </h3>
        {!compact && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{project.summary[locale]}</p>}
        {!compact && <p className="mt-4 text-[15px] font-semibold text-accent">{dict.solutions.open}</p>}
      </div>
    </article>
  );
}

/** Плитка кейса. wide — карточка на полряда (последний ряд из двух): картинка ниже по пропорции */
export function ProjectCard({ project, locale, wide }: { project: Project; locale: Locale; wide?: boolean }) {
  const dict = getDict(locale);
  const href = `/${locale}/projects/${project.slug}`;
  const ba = project.beforeAfter;
  const cover = coverFor(project, locale);
  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:border-ink/40">
      <div className="relative overflow-hidden border-b border-line">
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
          // единая рамка 3:2; широкие картинки вписываются целиком, высокие скриншоты страниц показываются с верха
          <Link prefetch={false} href={href} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden bg-surface" style={{ aspectRatio: '3 / 2' }}>
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 700px, (min-width: 768px) 50vw, 100vw"
              className={cx(cover.w / cover.h >= 1.3 ? 'object-contain' : 'object-cover object-top')}
            />
          </Link>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <p className="text-[14px] text-muted">
          {project.isSolution ? `${dict.solutions.label}: ${clientLabel(project, locale)}` : `${clientLabel(project, locale)}, ${project.year}`}
        </p>
        <h3 className="mt-1.5 text-[19px] font-semibold leading-snug">
          {/* ссылка растянута на текстовую часть карточки (на картинке может быть слайдер «до/после») */}
          <Link prefetch={false} href={href} className="after:absolute after:inset-0 hover:text-accent">
            {project.title[locale]}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{project.summary[locale]}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <Badge key={t.ru} tone="tag">
              {t[locale]}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
