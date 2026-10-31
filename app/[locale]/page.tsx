import { Hero } from '@/components/hero';
import { AboutSection } from '@/components/sections/about';
import { MiniAuditSection } from '@/components/sections/mini-audit';
import { ScrollScene } from '@/components/sections/scroll-scene';
import { getDict } from '@/lib/i18n';
import { getProject } from '@/lib/projects';
import { BotsSection, FaqSection, StartSection } from '@/components/sections/leads';
import { PricingSection } from '@/components/sections/pricing';
import { ProjectsSection } from '@/components/sections/projects';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { ProcessSection } from '@/components/sections/trust';
import type { Locale } from '@/lib/site';

/**
 * Главная — короткий путь клиента: обещание → доказательства (кейсы) → кто делает → что говорят клиенты →
 * что и сколько стоит → как проходит работа → вопросы → заявка.
 * Квиз и образец отчёта с главной убраны: они удлиняли страницу и дублировали формы и кейсы.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  // сцена «до → после» — на реальных фото из кейса (в EN — решение с английским интерфейсом)
  const sceneSlug = locale === 'en' ? 'solution-gbp' : 'maps-cafe-1';
  const ba = getProject(sceneSlug)?.beforeAfter;
  return (
    <>
      <Hero locale={locale} />
      {/* экспресс-разбор: советы написаны под российские площадки, поэтому только в RU */}
      {locale === 'ru' && <MiniAuditSection />}
      {ba && <ScrollScene before={ba.before} after={ba.after} href={`/projects/${sceneSlug}`} copy={getDict(locale).scene} aspect={ba.w / ba.h} />}
      <ProjectsSection locale={locale} />
      <AboutSection locale={locale} />
      <TestimonialsSection locale={locale} />
      <PricingSection locale={locale} />
      <ProcessSection locale={locale} />
      <BotsSection locale={locale} />
      <FaqSection locale={locale} />
      <StartSection locale={locale} />
    </>
  );
}
