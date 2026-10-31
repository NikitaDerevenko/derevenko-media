'use client';

import { useRef, useState } from 'react';
import { goal } from '@/lib/metrika';
import type { QuizOption, QuizResult } from '@/lib/home';

type Copy = {
  step: string;
  done: string;
  priceLabel: string;
  cta: string;
  again: string;
  noSiteNote: string;
  questions: { title: string; key: string; options: QuizOption[] }[];
  results: Record<string, QuizResult>;
};

/** Расчёт стоимости в 3 шага: что нужно → есть ли сайт → когда старт. Итог — вилка цены, срок и состав. */
export function Quiz({ copy }: { copy: Copy }) {
  const [i, setI] = useState(0);
  const [a, setA] = useState<Record<string, string>>({});
  const body = useRef<HTMLDivElement>(null);
  const total = copy.questions.length;

  const pick = (key: string, v: string) => {
    const next = { ...a, [key]: v };
    setA(next);
    setI(i + 1);
    if (i + 1 === total) goal('calc_done', { what: next.what, has: next.has, when: next.when });
    // фокус на новый вопрос — для клавиатуры и скринридеров
    requestAnimationFrame(() => body.current?.querySelector<HTMLElement>('h3, .price')?.focus());
  };

  // реклама без сайта — сразу показываем комплект
  const noSite = a.what === 'ads' && a.has === 'no';
  const r = i >= total ? copy.results[noSite ? 'both' : a.what] : null;
  const q = copy.questions[i];

  return (
    <div className="quiz">
      <div className="q-top">
        <span>{r ? copy.done : copy.step.replace('{n}', String(i + 1))}</span>
        <span className="q-bar">
          <i style={{ width: `${(Math.min(i + 1, total) / total) * 100}%` }} />
        </span>
      </div>
      <div className="q-body" ref={body} aria-live="polite">
        {q && (
          <div key={q.key}>
            <h3 tabIndex={-1}>{q.title}</h3>
            <div className="q-opts">
              {q.options.map((o) => (
                <button key={o.v} type="button" onClick={() => pick(q.key, o.v)}>
                  {o.label}
                  {o.hint && <small>{o.hint}</small>}
                </button>
              ))}
            </div>
          </div>
        )}
        {r && (
          <div className="q-res" key="res">
            <small style={{ color: '#9DA2AB' }}>{copy.priceLabel}</small>
            <div className="price" tabIndex={-1}>
              {r.price}
            </div>
            <div style={{ color: '#D6D9DE' }}>{r.term}</div>
            {noSite && <p style={{ color: '#9DA2AB', fontSize: 14, marginTop: 8 }}>{copy.noSiteNote}</p>}
            <ul>
              {r.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="acts">
              <a className="hm-btn hm-main" href="#start" onClick={() => goal('calc_cta')}>
                {copy.cta} →
              </a>
              <button
                type="button"
                className="again"
                onClick={() => {
                  setI(0);
                  setA({});
                }}
              >
                {copy.again}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
