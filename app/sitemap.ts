import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { isVisible, PROJECTS } from '@/lib/projects';
import { DIRECTIONS, LOCALES, SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // статьи — только в русской версии
  const articles: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/ru/stati`, changeFrequency: 'weekly', priority: 0.8 },
    ...ARTICLES.map((a) => ({ url: `${SITE.url}/ru/stati/${a.slug}`, lastModified: a.date, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
  return [...articles, ...LOCALES.flatMap((locale) => {
    const items = [
      { path: '', langs: [...LOCALES], priority: 1 },
      ...DIRECTIONS.map((d) => ({ path: `/services/${d}`, langs: [...LOCALES], priority: 0.9 })),
      ...PROJECTS.filter((p) => isVisible(p, locale)).map((p) => ({ path: `/projects/${p.slug}`, langs: LOCALES.filter((l) => isVisible(p, l)), priority: 0.7 })),
    ];
    return items.map(({ path, langs, priority }) => ({
      url: `${SITE.url}/${locale}${path}`,
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages: Object.fromEntries(langs.map((l) => [l, `${SITE.url}/${l}${path}`])) },
    }));
  })];
}
