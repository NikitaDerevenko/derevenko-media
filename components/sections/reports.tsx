'use client';

import { useState } from 'react';
import { fill, plural } from '@/lib/i18n/helpers';
import { goal } from '@/lib/metrika';
import { REPORT_CURRENCY, REPORT_TABS, REPORT_WEEKS, totals, type ReportId } from '@/lib/reports';
import { useApp } from '../providers';
import { Arrow, Check, Section, SectionHead, btn, cx } from '../ui';

export function ReportsSection({ num }: { num: string }) {
  const { locale, dict, market } = useApp();
  const t = dict.reports;
  // вкладки зависят от рынка: в России — Директ и VK, за рубежом — Google Ads
  const REPORT_IDS = REPORT_TABS[market];
  const [tab, setTab] = useState<ReportId>(REPORT_IDS[0]);

  const nfLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  const currency = REPORT_CURRENCY[tab];
  const money = (v: number, digits = 0) =>
    new Intl.NumberFormat(nfLocale, { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
  const num2 = (v: number, digits = 0) => new Intl.NumberFormat(nfLocale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);

  const s = totals(tab);
  const weeks = REPORT_WEEKS[tab];
  const copy = t.perTab[tab];
  const small = currency === 'EUR';
  const pct = locale === 'ru' ? ' %' : '%';

  const metrics = [
    { label: t.metrics.impressions, value: num2(s.impressions) },
    { label: t.metrics.clicks, value: num2(s.clicks) },
    { label: t.metrics.ctr, value: `${num2(s.ctr, 2)}${pct}` },
    { label: t.metrics.cpc, value: money(s.cpc, small ? 2 : 1) },
    { label: t.metrics.leads, value: num2(s.leads), accent: true },
    { label: t.metrics.cpl, value: money(s.cpl, small ? 2 : 0), accent: true },
    { label: t.metrics.spend, value: money(s.spend) },
  ];

  const conclusion = fill(copy.conclusion, {
    leads: num2(s.leads),
    leadsWord: plural(s.leads, t.leadWords, locale),
    cpl: money(s.cpl, small ? 2 : 0),
    growth: `${num2(Math.round(s.leadsGrowth))}${pct}`,
  });

  const select = (id: ReportId) => {
    setTab(id);
    goal(`report_tab_${id}`);
  };

  // мини-график: заявки по неделям
  const maxLeads = Math.max(...weeks.map((w) => w.leads));
  const W = 320;
  const H = 140;
  const barW = 44;
  const gap = (W - barW * weeks.length) / (weeks.length + 1);

  return (
    <Section id="reports">
      <SectionHead title={t.title} sub={t.sub} num={num} />

      <div role="tablist" aria-label={t.title} className={cx('mb-8 flex flex-wrap gap-2', REPORT_IDS.length < 2 && 'hidden')}>
        {REPORT_IDS.map((id) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            type="button"
            aria-selected={tab === id}
            aria-controls="report-panel"
            tabIndex={tab === id ? 0 : -1}
            onClick={() => select(id)}
            onKeyDown={(e) => {
              const i = REPORT_IDS.indexOf(tab);
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const next = REPORT_IDS[(i + (e.key === 'ArrowRight' ? 1 : REPORT_IDS.length - 1)) % REPORT_IDS.length];
                select(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            className={cx('shrink-0 rounded-full border px-5 py-3 text-[15px] font-semibold transition', tab === id ? 'border-accent bg-accent text-onaccent' : 'border-line text-muted hover:text-ink')}
          >
            {t.tabs[id]}
          </button>
        ))}
      </div>

      <div id="report-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="card relative overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="border-b border-line pb-5">
            <p className="caps text-muted">
              {t.period} · {t.tabs[tab]}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{t.brand}</p>
            {/* честная пометка одной строкой: цифры в примере условные */}
            <p className="mt-2 text-[14px] text-muted">{t.sampleNote}</p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
            {metrics.map((m) => (
              <div key={m.label} className={cx('border-t-2 pt-3', m.accent ? 'border-accent' : 'border-line')}>
                <dt className="caps text-muted">{m.label}</dt>
                <dd className={cx('mt-2 text-2xl font-semibold tracking-tight md:text-[28px]', m.accent && 'text-accent')}>{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <figure>
              <figcaption className="caps mb-4 text-muted">{t.chart}</figcaption>
              <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full max-w-md" role="img" aria-label={`${t.chart}: ${weeks.map((w) => w.leads).join(', ')}`}>
                <line x1="0" y1={H} x2={W} y2={H} className="stroke-line" />
                {weeks.map((w, i) => {
                  const hh = Math.max(6, (w.leads / maxLeads) * (H - 24));
                  const x = gap + i * (barW + gap);
                  return (
                    <g key={i}>
                      <rect x={x} y={H - hh} width={barW} height={hh} rx="8" className={i === weeks.length - 1 ? 'fill-accent' : 'fill-accent-soft'} />
                      <text x={x + barW / 2} y={H - hh - 6} textAnchor="middle" fontSize="14" fontWeight="700" className="fill-ink">
                        {w.leads}
                      </text>
                      <text x={x + barW / 2} y={H + 20} textAnchor="middle" fontSize="13" className="fill-muted">
                        {t.week} {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </figure>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="caps mb-3 text-muted">{t.done}</p>
                <ul className="space-y-2 text-[16px]">
                  {copy.done.map((d) => (
                    <li key={d} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="caps mb-3 text-muted">{t.next}</p>
                <ul className="space-y-2 text-[16px]">
                  {copy.next.map((d) => (
                    <li key={d} className="flex gap-2">
                      <Arrow className="mt-1 h-3.5 w-3.5 text-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-accent-soft p-5 sm:col-span-2">
                <p className="caps text-accent">{t.conclusion}</p>
                <p className="mt-2 text-[16px] leading-relaxed">{conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <a href={`/${locale}#audit`} className={btn.primary}>
          {dict.common.auditCta}
          <Arrow />
        </a>
      </div>
    </Section>
  );
}
