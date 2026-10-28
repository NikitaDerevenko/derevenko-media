// Подписи цен: «от 6 900 ₽», «15 000–25 000 ₽», «от 4 900 ₽/мес», «бесплатно», «после разбора», «по запросу».
// Числа — из lib/site.ts, слова — из словаря (common).
import { formatMoney, isPlaceholder, PACKAGES, SERVICES, showPrices, type Locale, type Market, type PackageId, type Price, type ServiceId } from './site';

type Words = { from: string; perMonth: string; free: string; afterAudit: string; onRequest: string };

export function formatPrice(price: Price | undefined, monthly: boolean | undefined, market: Market, locale: Locale, w: Words, to?: number) {
  if (price === undefined || isPlaceholder(price) || !showPrices(market)) return w.onRequest;
  if (price === null) return w.afterAudit;
  if (price === 0) return w.free;
  // диапазон: «15 000–25 000 ₽»
  if (to) {
    const first = formatMoney(price, market, locale);
    return `${market === 'ru' ? first.replace(' ₽', '') : first}–${formatMoney(to, market, locale)}${monthly ? w.perMonth : ''}`;
  }
  return `${w.from} ${formatMoney(price, market, locale)}${monthly ? w.perMonth : ''}`;
}

export function servicePrice(id: ServiceId, market: Market, locale: Locale, w: Words) {
  const s = SERVICES[market][id];
  return formatPrice(s?.price, s?.monthly, market, locale, w, s?.to);
}

export function packagePrice(id: PackageId, market: Market, locale: Locale, w: Words) {
  return formatPrice(PACKAGES[market][id], false, market, locale, w);
}
