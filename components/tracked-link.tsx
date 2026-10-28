'use client';

import { goal, type Goal } from '@/lib/metrika';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { goalName: Goal };

/** Внешняя ссылка с целью Метрики (Telegram, email, демо-боты). */
export function TrackedLink({ goalName, onClick, children, ...rest }: Props) {
  const external = rest.href?.startsWith('http');
  return (
    <a
      {...rest}
      target={external ? '_blank' : rest.target}
      rel={external ? 'noopener noreferrer' : rest.rel}
      onClick={(e) => {
        goal(goalName);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
