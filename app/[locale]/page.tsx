import { Hero } from '@/components/hero';
import { AboutSection } from '@/components/sections/about';
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
  return (
    <>
      <Hero locale={locale} />
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
