import { fill, getDict } from '@/lib/i18n';
import { packagePrice, servicePrice } from '@/lib/pricing';
import { DIRECTION_SERVICES, formatMoney, marketOf, RECOMMENDED_PACKAGE, SERVICES, type DirectionId, type Locale, type PackageId, type ServiceId } from '@/lib/site';
import { Arrow, btn, Check, cx } from './ui';

type CardData = {
  key: string;
  label: string;
  name: string;
  price: string;
  term?: string;
  includes: string[];
  extra?: string;
  highlight?: string;
  cta: { href: string; text: string };
};

/** Карточка цены — одна структура для всех: метка → название → цена → срок → состав → отдельно → кнопка (прижата к низу) */
function PriceCard({ c, dark, termLabel, extraLabel }: { c: CardData; dark: boolean; termLabel: string; extraLabel: string }) {
  return (
    <article
      id={c.key}
      className={cx(
        'relative flex h-full flex-col rounded-[24px] border p-6 md:p-7',
        dark ? 'bg-dark-2' : 'bg-surface',
        c.highlight ? 'border-accent ring-1 ring-accent' : dark ? 'border-dark-line' : 'border-line',
      )}
    >
      {c.highlight && <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[13px] font-bold uppercase tracking-caps text-onaccent">{c.highlight}</span>}
      <p className={cx('caps', dark ? 'text-dark-muted' : 'text-muted')}>{c.label}</p>
      <h3 className="mt-3 text-2xl font-semibold leading-tight">{c.name}</h3>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{c.price}</p>
      <p className={cx('mt-2 min-h-[1.5rem] text-[14px]', dark ? 'text-dark-muted' : 'text-muted')}>{c.term ? `${termLabel}: ${c.term}` : ' '}</p>
      <ul className={cx('mt-5 flex-1 space-y-2.5 border-t pt-5 text-[16px]', dark ? 'border-dark-line' : 'border-line')}>
        {c.includes.map((i) => (
          <li key={i} className="flex gap-2.5">
            <Check className={cx('mt-0.5 h-4 w-4', dark ? 'text-lime' : 'text-accent')} />
            {i}
          </li>
        ))}
      </ul>
      {c.extra && (
        <p className={cx('mt-5 text-[14px] leading-snug', dark ? 'text-dark-muted' : 'text-muted')}>
          <span className="font-semibold">{extraLabel}: </span>
          {c.extra}
        </p>
      )}
      <a href={c.cta.href} className={cx(c.highlight ? btn.primary : dark ? btn.secondaryDark : btn.secondary, 'mt-6 w-full')}>
        {c.cta.text}
        <Arrow />
      </a>
    </article>
  );
}

/** Сетка цен направления. base — куда ведут кнопки (якоря #audit / #contact) */
export function DirectionPrices({ direction, locale, dark = false, base }: { direction: DirectionId; locale: Locale; dark?: boolean; base?: string }) {
  const dict = getDict(locale);
  const market = marketOf(locale);
  const p = dict.pricing;
  const s = dict.services.items;
  const w = dict.common;
  const home = base ?? `/${locale}`;
  const audit = { href: `${home}#audit`, text: p.chooseAudit };
  const project = { href: `${home}#contact`, text: p.choose };
  const extra = dict.directions[direction].page.extra[0];

  const serviceCard = (id: ServiceId): CardData => {
    const row = SERVICES[market][id];
    return {
      key: id,
      label: row?.monthly ? p.labels.monthly : row?.price === null ? p.labels.custom : p.labels.once,
      name: s[id].name,
      price: servicePrice(id, market, locale, w),
      term: s[id].term,
      includes: s[id].scope.split(/;\s*/).filter(Boolean),
      extra,
      cta: direction === 'promotion' ? audit : project,
    };
  };

  let cards: CardData[] = [];
  let rest: ServiceId[] = [];

  if (direction === 'promotion') {
    const pk = dict.packages;
    const am = SERVICES[market][market === 'ru' ? 'adsManage' : 'gadsManage']?.price;
    const adsManage = typeof am === 'number' ? formatMoney(am, market, locale) : w.onRequest;
    cards = (['card', 'start', 'growth'] as PackageId[]).map((id) => ({
      key: `package-${id}`,
      label: p.labels.package,
      name: pk.items[id].name,
      price: packagePrice(id, market, locale, w),
      term: pk.items[id].term,
      includes: pk.items[id].items,
      extra: pk.items[id].extra ? fill(pk.items[id].extra!, { adsManage }) : extra,
      highlight: id === RECOMMENDED_PACKAGE ? pk.recommended : undefined,
      cta: audit,
    }));
    cards.push({ key: 'package-custom', label: p.labels.custom, name: pk.custom.name, price: w.afterAudit, includes: [pk.custom.text], cta: project });
    rest = DIRECTION_SERVICES[market].promotion;
  } else {
    const ids = DIRECTION_SERVICES[market][direction];
    const main = ids.filter((id) => !SERVICES[market][id]?.monthly);
    cards = main.map(serviceCard);
    if (direction === 'telegram-bots') cards.push({ ...serviceCard('miniApp'), highlight: dict.services.miniAppLabel });
    rest = ids.filter((id) => SERVICES[market][id]?.monthly);
  }

  return (
    <div>
      <div className={cx('grid gap-5 md:grid-cols-2', cards.length >= 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3')}>
        {cards.map((c) => (
          <PriceCard key={c.key} c={c} dark={dark} termLabel={p.term} extraLabel={p.extra} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-10">
          <h3 className={cx('caps mb-2', dark ? 'text-dark-muted' : 'text-muted')}>{direction === 'promotion' ? p.otherServices : p.labels.monthly}</h3>
          <ul className={cx('divide-y border-y', dark ? 'divide-dark-line border-dark-line' : 'divide-line border-line')}>
            {rest.map((id) => (
              <li key={id} id={id === 'audit' ? undefined : id} className="grid gap-1 py-4 md:grid-cols-[1.1fr_1.6fr_180px] md:items-baseline md:gap-6">
                <span className="text-[16px] font-semibold">{s[id].name}</span>
                <span className={cx('text-[14px] leading-snug', dark ? 'text-dark-muted' : 'text-muted')}>
                  {s[id].scope}
                  {s[id].term ? ` · ${s[id].term}` : ''}
                </span>
                <span className="text-[16px] font-semibold md:text-right">{servicePrice(id, market, locale, w)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
