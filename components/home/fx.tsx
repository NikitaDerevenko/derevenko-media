'use client';

import { useEffect } from 'react';

/** Блоки главной (.rv-up) мягко появляются при прокрутке. Без JS и при «уменьшить движение» всё видно сразу. */
export function HomeFx() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.hm .rv-up'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}
