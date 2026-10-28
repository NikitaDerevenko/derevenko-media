// Лёгкие функции без импорта словарей — для клиентских компонентов.
// Сами словари (ru.ts, en.ts) в браузер не попадают: их отдаёт сервер через AppProvider.
import type { Locale } from '../site';

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '');
}

/** Склонение: plural(5, { one: 'заявка', few: 'заявки', many: 'заявок', other: 'заявки' }, 'ru') → «заявок» */
export function plural(n: number, forms: { one: string; few: string; many: string; other: string }, locale: Locale) {
  const rule = new Intl.PluralRules(locale === 'ru' ? 'ru-RU' : 'en-US').select(n) as keyof typeof forms;
  return forms[rule] ?? forms.other;
}
