// Образцы ежемесячных отчётов. ДЕМО-ДАННЫЕ для вымышленной кофейни «Зерно».
// Задаются только недельные показы, клики, заявки и расход —
// CTR, CPC, цена заявки и итоги считаются формулами ниже, поэтому всегда согласованы.

export type ReportId = 'direct' | 'vk' | 'google';

export type Week = { impressions: number; clicks: number; leads: number; spend: number };

export const REPORT_IDS: ReportId[] = ['direct', 'vk', 'google'];

/** Какие отчёты показывать на каждом рынке: Google Ads в России не работает */
export const REPORT_TABS: Record<'ru' | 'intl', ReportId[]> = { ru: ['direct', 'vk'], intl: ['google'] };

export const REPORT_WEEKS: Record<ReportId, Week[]> = {
  direct: [
    { impressions: 11200, clicks: 392, leads: 11, spend: 9800 },
    { impressions: 12650, clicks: 430, leads: 13, spend: 10750 },
    { impressions: 13100, clicks: 472, leads: 15, spend: 11330 },
    { impressions: 13800, clicks: 510, leads: 17, spend: 12240 },
  ],
  vk: [
    { impressions: 24500, clicks: 196, leads: 6, spend: 5880 },
    { impressions: 26800, clicks: 228, leads: 8, spend: 6610 },
    { impressions: 25900, clicks: 233, leads: 8, spend: 6760 },
    { impressions: 28300, clicks: 263, leads: 10, spend: 7360 },
  ],
  google: [
    { impressions: 3900, clicks: 168, leads: 7, spend: 134 },
    { impressions: 4300, clicks: 189, leads: 8, spend: 149 },
    { impressions: 4650, clicks: 209, leads: 10, spend: 163 },
    { impressions: 5020, clicks: 231, leads: 11, spend: 178 },
  ],
};

export const REPORT_CURRENCY: Record<ReportId, 'RUB' | 'EUR'> = {
  direct: 'RUB',
  vk: 'RUB',
  google: 'EUR',
};

export type ReportTotals = {
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number; // %
  cpc: number;
  cpl: number;
  leadsGrowth: number; // %, последняя неделя к первой
};

export function totals(id: ReportId): ReportTotals {
  const weeks = REPORT_WEEKS[id];
  const sum = (k: keyof Week) => weeks.reduce((acc, w) => acc + w[k], 0);
  const impressions = sum('impressions');
  const clicks = sum('clicks');
  const leads = sum('leads');
  const spend = sum('spend');
  const first = weeks[0].leads;
  const last = weeks[weeks.length - 1].leads;
  return {
    impressions,
    clicks,
    leads,
    spend,
    ctr: (clicks / impressions) * 100,
    cpc: spend / clicks,
    cpl: spend / leads,
    leadsGrowth: ((last - first) / first) * 100,
  };
}
