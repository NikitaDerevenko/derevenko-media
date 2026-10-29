import { getDict } from '@/lib/i18n';
import { homeProjects, homeSolutions } from '@/lib/projects';
import type { Locale } from '@/lib/site';
import { FeaturedProjectCard, ProjectCard, SolutionCard } from '../project-cards';
import { cx, Section, SectionHead } from '../ui';

/** Кейсы клиентов + ниже, отдельно и с пояснением, готовые решения для ниш */
export function ProjectsSection({ locale }: { locale: Locale; num?: string }) {
  const dict = getDict(locale);
  const [featured, ...rest] = homeProjects(locale);
  const solutions = homeSolutions(locale);
  // ряды по 3; если в последнем ряду 2 — они шире
  const tail = rest.length % 3;
  return (
    <Section id="projects">
      <SectionHead title={dict.projects.title} sub={dict.projects.sub} />
      {featured && <FeaturedProjectCard project={featured} locale={locale} />}
      {/* На телефоне — лента с прокруткой вбок, чтобы пять карточек не растягивали страницу; с планшета — сетка */}
      <div className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-6">
        {rest.map((p, i) => {
          const inTail = tail === 2 && i >= rest.length - 2;
          return (
            <div key={p.slug} className={cx('w-[82%] shrink-0 snap-start md:w-auto', inTail ? 'lg:col-span-3' : 'lg:col-span-2')}>
              <ProjectCard project={p} locale={locale} wide={inTail} />
            </div>
          );
        })}
      </div>

      {solutions.length > 0 && (
        <div id="solutions" className="mt-16 border-t border-line pt-12 md:mt-20">
          <div className="max-w-2xl">
            <h3 className="h3">{dict.solutions.title}</h3>
            <p className="mt-3 text-muted">{dict.solutions.sub}</p>
          </div>
          {/* Лента: листается пальцем на телефоне и колесом/тачпадом на компьютере */}
          <ul className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {solutions.map((p) => (
              <li key={p.slug} className="w-[260px] shrink-0 snap-start lg:w-auto">
                <SolutionCard project={p} locale={locale} compact />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
