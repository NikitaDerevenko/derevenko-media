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
const CLIENT_KEYS = [
  'brand',
  'miniAudit',
  'nav', 'langSwitch', 'common', 'hero', 'beforeAfter', 'audit', 'contact', 'cookie', 'footer', 'sticky', 'consentField'] as const;
export type ClientDict = Pick<Dict, (typeof CLIENT_KEYS)[number]>;

export function clientDict(dict: Dict): ClientDict {
  const out: Record<string, unknown> = {};
  for (const k of CLIENT_KEYS) out[k] = dict[k];
  return out as ClientDict;
}
