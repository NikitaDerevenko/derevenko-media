import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { CookieConsent, Footer, StickyCta } from '@/components/chrome';
import { Header } from '@/components/header';
import { AppProvider } from '@/components/providers';
import { clientDict, getDict } from '@/lib/i18n';
import { isVisible, PROJECTS } from '@/lib/projects';
import { isLocale, LEGAL, LOCALES, SITE, TELEGRAM_URL, type Locale } from '@/lib/site';

// Шрифт Onest подключается в app/globals.css (свои woff2, см. комментарий там)

export const dynamicParams = false;

/** Точный переход к якорю при ленивой отрисовке секций: клики по ссылкам на этой же странице и открытие страницы с #хэшем */
const ANCHOR_SCRIPT = `(function(){
var d=document.documentElement;
function go(id,smooth){var el=document.getElementById(id);if(!el)return false;d.classList.add('cv-off');
requestAnimationFrame(function(){requestAnimationFrame(function(){el.scrollIntoView({behavior:smooth?'smooth':'auto'})})});return true}
document.addEventListener('click',function(e){
if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
var a=e.target.closest&&e.target.closest('a[href*="#"]');if(!a||a.target==='_blank')return;
var u=new URL(a.href,location.href);
if(u.origin!==location.origin||u.pathname!==location.pathname||!u.hash)return;
if(go(decodeURIComponent(u.hash.slice(1)),true)){e.preventDefault();history.pushState(null,'',u.hash)}
},true);
if(location.hash)document.addEventListener('DOMContentLoaded',function(){go(decodeURIComponent(location.hash.slice(1)),false)});
})();`;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params: paramsP }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await paramsP;
  if (!isLocale(params.locale)) return {};
  const dict = getDict(params.locale);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: dict.meta.title, template: `%s — Nikita Derevenko` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${params.locale}`,
      languages: { ru: '/ru', en: '/en', 'x-default': '/ru' },
    },
    openGraph: {
      type: 'website',
      siteName: 'Nikita Derevenko',
      title: dict.meta.title,
      description: dict.meta.description,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      url: `/${params.locale}`,
      images: [{ url: `/og/${params.locale}.png`, width: 1200, height: 630, alt: dict.meta.ogLine }],
    },
    twitter: { card: 'summary_large_image', title: dict.meta.title, description: dict.meta.description, images: [`/og/${params.locale}.png`] },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params: paramsP }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const params = await paramsP;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDict(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Nikita Derevenko',
    description: dict.meta.description,
    url: `${SITE.url}/${locale}`,
    founder: { '@type': 'Person', name: dict.about.name, jobTitle: dict.about.role, taxID: LEGAL.inn, image: `${SITE.url}/about/photo.jpg` },
    areaServed: locale === 'ru' ? ['RU', 'Europe', 'US'] : ['Europe', 'US'],
    sameAs: [TELEGRAM_URL],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Шрифт первого экрана грузим сразу, вместе с HTML */}
        <link rel="preload" href="/fonts/onest-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {locale === 'ru' && <link rel="preload" href="/fonts/onest-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        {/* Отмечаем, что JS работает — для слайдера до/после без сдвига вёрстки */}
        {/* + прячем баннер cookie до первой отрисовки, если выбор уже сделан */}
        <script
          dangerouslySetInnerHTML={{
            __html: "var d=document.documentElement;d.classList.add('js');try{if(localStorage.getItem('cookie-consent'))d.classList.add('has-consent')}catch(e){}",
          }}
        />
        {/* Переход по якорю: сначала раскладываем все секции (.cv-off), потом прокручиваем — см. .cv-auto в globals.css */}
        <script dangerouslySetInnerHTML={{ __html: ANCHOR_SCRIPT }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AppProvider locale={locale} dict={clientDict(dict)}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-onaccent">
            {dict.common.skip}
          </a>
          <Header missingInOther={PROJECTS.filter((p) => isVisible(p, locale) && !isVisible(p, locale === 'ru' ? 'en' : 'ru')).map((p) => p.slug)} />
          <main id="main">{children}</main>
          <Footer />
          <StickyCta />
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
