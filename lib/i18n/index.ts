// Только для серверных компонентов: импортирует оба словаря.
// Клиентские компоненты берут функции из ./helpers, а тексты — из контекста (components/providers.tsx).
import type { Locale } from '../site';
import { en } from './en';
import { ru, type Dict } from './ru';

export type { Dict };
export { fill, plural } from './helpers';

const DICTS: Record<Locale, Dict> = { ru, en };

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}

/** В браузер уходят только тексты интерактивных частей — остальное рисуется на сервере */
const CLIENT_KEYS = ['nav', 'langSwitch', 'common', 'hero', 'beforeAfter', 'quiz', 'calculator', 'reports', 'audit', 'contact', 'cookie', 'footer', 'sticky', 'consentField'] as const;
export type ClientDict = Pick<Dict, (typeof CLIENT_KEYS)[number]> & {
  /** Названия услуг и пакетов — для ориентира цены в квизе */
  serviceNames: Record<string, string>;
  packageNames: Record<string, string>;
};

export function clientDict(dict: Dict): ClientDict {
  const out: Record<string, unknown> = {};
  for (const k of CLIENT_KEYS) out[k] = dict[k];
  out.serviceNames = Object.fromEntries(Object.entries(dict.services.items).map(([k, v]) => [k, v.name]));
  out.packageNames = Object.fromEntries(Object.entries(dict.packages.items).map(([k, v]) => [k, v.name]));
  return out as ClientDict;
}
