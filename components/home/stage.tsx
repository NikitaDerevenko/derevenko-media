'use client';

import { useEffect, useRef, useState } from 'react';

type Copy = {
  sites: { src: string; url: string }[];
  adSource: string;
  adTitle: string;
  adText: string;
  adBtn: string;
  toastTitle: string;
  toastNow: string;
  people: string[];
  leads: string;
  mark: string;
};

const FINAL = 'stage s-build s-site s-ad s-lead';

/**
 * Сцена первого экрана — маленькая история о том, что я продаю:
 * сайт собирается из блоков → проявляется настоящий сайт из портфолио → выезжает объявление,
 * курсор жмёт «Перейти на сайт» → в Telegram приходит заявка, счётчик заявок растёт. Цикл ≈ 9,4 с.
 * В HTML и при «уменьшить движение» — финальный кадр без анимации. Вне экрана цикл на паузе.
 */
export function HeroStage({ copy }: { copy: Copy }) {
  const ref = useRef<HTMLDivElement>(null);
  const adBtn = useRef<HTMLSpanElement>(null);
  const [cls, setCls] = useState(FINAL);
  const [site, setSite] = useState(0);
  const [person, setPerson] = useState(0);
  const [count, setCount] = useState(13);
  const [bump, setBump] = useState(false);
  const [click, setClick] = useState(false);
  const [cursor, setCursor] = useState<{ left: string; top: string }>({ left: '70%', top: '75%' });

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timers: number[] = [];
    let loop = 0;
    let n = 12;
    let visible = true;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const run = () => {
      clear();
      const i = loop++;
      setSite(i % copy.sites.length);
      setCursor({ left: '70%', top: '75%' });
      setCls('stage');
      setBump(false);
      at(150, () => setCls('stage s-build'));
      at(1500, () => setCls('stage s-build s-site'));
      at(2900, () => setCls('stage s-build s-site s-ad'));
      at(3700, () => {
        setCls('stage s-build s-site s-ad s-click');
        const b = adBtn.current?.getBoundingClientRect();
        const s = el.getBoundingClientRect();
        if (b) setCursor({ left: `${b.left - s.left + b.width * 0.6}px`, top: `${b.top - s.top + b.height * 0.5}px` });
      });
      at(4700, () => setClick(true));
      at(5000, () => {
        setClick(false);
        setPerson(i % copy.people.length);
        n += 1;
        setCount(n);
        setBump(true);
        setCls('stage s-build s-site s-ad s-lead');
      });
      at(8600, () => setCls('stage s-build s-site s-ad s-lead s-out'));
      at(9400, () => (visible ? run() : clear()));
    };
    // запускаем и останавливаем цикл по видимости сцены
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && (!was || timers.length === 0)) run();
      if (!visible) {
        clear();
        setCls(FINAL);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [copy.sites.length, copy.people.length]);

  const s = copy.sites[site];
  return (
    <div ref={ref} className={cls} aria-hidden="true">
      <div className="browser">
        <div className="bar">
          <i />
          <i />
          <i />
          <span className="url">{s.url}</span>
        </div>
        <div className="screen">
          <div className="skel">
            <span className="sk sk-nav" />
            <span className="sk sk-h1" />
            <span className="sk sk-h1 short" />
            <span className="sk sk-btn" />
            <div className="sk-cards">
              <span className="sk sk-card" />
              <span className="sk sk-card" />
              <span className="sk sk-card" />
            </div>
          </div>
          {copy.sites.map((x, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={x.src} className="site" src={x.src} alt="" width={1440} height={900} style={i === site ? undefined : { display: 'none' }} fetchPriority={i === 0 ? 'high' : 'low'} loading={i === 0 ? 'eager' : 'lazy'} />
          ))}
          <span className="cursor" style={cursor} />
        </div>
      </div>

      <div className={click ? 'ad click' : 'ad'}>
        <div className="ad-top">
          <span className="ad-dot">{copy.mark}</span>
          <span>{copy.adSource}</span>
        </div>
        <b>{copy.adTitle}</b>
        <p>{copy.adText}</p>
        <span ref={adBtn} className="ad-btn">
          {copy.adBtn}
        </span>
      </div>

      <div className="toast">
        <span className="tg">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
            <path d="M21.9 4.3c.3-1.2-.5-1.7-1.4-1.4L2.9 9.7c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l2.8-14.4z" />
          </svg>
        </span>
        <div>
          <b>{copy.toastTitle}</b>
          <span className="line">{copy.people[person]}</span>
        </div>
        <small>{copy.toastNow}</small>
      </div>

      <div className="leads">
        <small>{copy.leads}</small>
        <b className={bump ? 'bump' : undefined} key={count}>
          {count}
        </b>
        <div className="bars">
          {[30, 45, 40, 62, 55, 78].map((h) => (
            <i key={h} style={{ '--h': `${h}%` } as React.CSSProperties} />
          ))}
          <i className="last" style={{ '--h': '92%' } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
}
