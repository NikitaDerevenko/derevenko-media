// Сохраняем utm_* и yclid/gclid из URL на время сессии и передаём их в заявку.

const KEY = 'utm';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'] as const;

export type Utm = Partial<Record<(typeof PARAMS)[number], string>>;

export function captureUtm() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const p of PARAMS) {
      const v = sp.get(p);
      if (v) found[p] = v.slice(0, 200);
    }
    if (Object.keys(found).length === 0) return;
    // новые метки перезаписывают старые: учитываем последнее касание
    window.sessionStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    // sessionStorage недоступен — работаем без меток
  }
}

export function readUtm(): Utm {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Utm = {};
    for (const p of PARAMS) {
      if (typeof parsed[p] === 'string') out[p] = parsed[p] as string;
    }
    return out;
  } catch {
    return {};
  }
}
