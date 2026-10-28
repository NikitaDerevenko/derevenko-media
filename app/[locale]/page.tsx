import { Hero, type HeroSlide } from '@/components/hero';
import { AboutSection } from '@/components/sections/about';
import { CalculatorSection } from '@/components/sections/calculator';
import { BotsSection, FaqSection, StartSection } from '@/components/sections/leads';
import { PricingSection } from '@/components/sections/pricing';
import { ProjectsSection } from '@/components/sections/projects';
import { ReportsSection } from '@/components/sections/reports';
import { ServicesSection } from '@/components/sections/services';
import { SolutionsSection } from '@/components/sections/solutions';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { ProcessSection } from '@/components/sections/trust';
import { getProject } from '@/lib/projects';
import { DEMO_BOTS, type Locale } from '@/lib/site';

// Слайды ноутбука на первом экране. В английской версии — работы с английским интерфейсом там, где они есть
const SLIDES: Record<Locale, Omit<HeroSlide, 'title'>[]> = {
  ru: [
    { slug: 'ads-lumos', img: '/projects/ads-lumos/cover.webp', position: 'top' },
    { slug: 'site-mdk', img: '/projects/site-mdk/cover.webp', position: 'top' },
    { slug: 'solution-kontur', img: '/projects/solution-kontur/miniapp.webp', position: 'center' },
    { slug: 'solution-forma', img: '/projects/solution-forma/home.webp', position: 'top' },
  ],
  en: [
    { slug: 'ads-lumos' },
    { slug: 'site-mdk', img: '/projects/site-mdk/cover.webp', position: 'top' },
    { slug: 'solution-clinic', img: '/projects/solution-clinic/cover.webp', position: 'top' },
    { slug: 'solution-zerno', img: '/projects/solution-zerno/cover-en.webp', position: 'top' },
  ],
};

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  // в браузер уходят только заголовки слайдов, а не весь список кейсов
  const slides = SLIDES[locale].map((s) => ({ ...s, title: getProject(s.slug)?.title[locale] ?? '' }));
  const ba = getProject(locale === 'en' ? 'solution-gbp' : 'maps-cafe-1')?.beforeAfter;
  const showcase = ba && { before: ba.before, after: ba.after, w: ba.w, h: ba.h, focus: ba.focus };

  // Сквозная нумерация: номер получает каждая показанная секция, без пропусков
  const hasBots = Boolean(DEMO_BOTS.booking || DEMO_BOTS.lead);
  let n = 0;
  const next = () => String(++n).padStart(2, '0');

  return (
    <>
      <Hero slides={slides} showcase={showcase} />
      <ProjectsSection locale={locale} num={next()} />
      <SolutionsSection locale={locale} num={next()} />
      <TestimonialsSection locale={locale} num={next()} />
      <ServicesSection locale={locale} num={next()} />
      <CalculatorSection num={next()} />
      <ReportsSection num={next()} />
      <PricingSection locale={locale} num={next()} />
      <ProcessSection locale={locale} num={next()} />
      <AboutSection locale={locale} num={next()} />
      {hasBots && <BotsSection locale={locale} num={next()} />}
      <FaqSection locale={locale} num={next()} />
      <StartSection locale={locale} num={next()} />
    </>
  );
}
