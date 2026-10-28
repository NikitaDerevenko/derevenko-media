import { getDict } from '@/lib/i18n';
import { homeProjects } from '@/lib/projects';
import type { Locale } from '@/lib/site';
import { FeaturedProjectCard, ProjectCard } from '../project-cards';
import { TwoPathButtons } from '../two-paths';
import { DarkPanel, SectionHead } from '../ui';

export function ProjectsSection({ locale, num }: { locale: Locale; num: string }) {
  const dict = getDict(locale);
  const [featured, ...rest] = homeProjects(locale);
  // ряды по 3; если в последнем ряду 2 — они шире
  const tail = rest.length % 3;
  return (
    <DarkPanel id="projects">
      <SectionHead dark title={dict.projects.title} sub={dict.projects.sub} num={num} />
      {featured && <FeaturedProjectCard project={featured} locale={locale} />}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {rest.map((p, i) => {
          const inTail = tail === 2 && i >= rest.length - 2;
          return (
            <div key={p.slug} className={inTail ? 'lg:col-span-3' : 'lg:col-span-2'}>
              <ProjectCard project={p} locale={locale} wide={inTail} />
            </div>
          );
        })}
      </div>
      <div className="mt-14 flex flex-col items-start gap-6 border-t border-dark-line pt-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-2xl font-semibold text-onaccent md:text-3xl">{dict.projects.cta.title}</p>
          <p className="mt-2 max-w-xl text-dark-muted">{dict.projects.cta.text}</p>
        </div>
        <TwoPathButtons locale={locale} dark />
      </div>
    </DarkPanel>
  );
}
