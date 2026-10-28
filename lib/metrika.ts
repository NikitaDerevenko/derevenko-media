// Яндекс Метрика: счётчик подключается только после согласия на cookie (components/cookie-consent.tsx).

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 0);

export type Goal =
  | 'audit_request'
  | 'lead_form_success'
  | 'calc_used'
  | `report_tab_${string}`
  | `project_open_${string}`
  | 'before_after_drag'
  | 'click_telegram'
  | 'click_email'
  | 'market_switch'
  | 'lang_switch'
  | 'demo_bot_click';

type YmFn = (id: number, method: string, ...args: unknown[]) => void;

export function goal(name: Goal, params?: Record<string, unknown>) {
  if (!YM_ID || typeof window === 'undefined') return;
  try {
    const ym = (window as unknown as { ym?: YmFn }).ym;
    if (typeof ym === 'function') ym(YM_ID, 'reachGoal', name, params);
  } catch {
    // аналитика не должна ломать сайт
  }
}

export function hit(url: string) {
  if (!YM_ID || typeof window === 'undefined') return;
  try {
    const ym = (window as unknown as { ym?: YmFn }).ym;
    if (typeof ym === 'function') ym(YM_ID, 'hit', url);
  } catch {
    // ignore
  }
}

// ---------- Согласие на cookie ----------

export const CONSENT_KEY = 'cookie-consent';
export type Consent = 'all' | 'necessary';

export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'all' || v === 'necessary' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(v: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    // приватный режим — согласие действует до перезагрузки
  }
}
