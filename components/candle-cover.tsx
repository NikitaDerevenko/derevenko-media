import type { Locale } from '@/lib/site';
import { cx } from './ui';

/**
 * Обложка главного кейса: типографика на «свете свечей», без логотипа клиента.
 * Это изображение кейса — тёплые цвета заданы в app/globals.css (.candle-*), а не в палитре интерфейса.
 * Позиционирование (relative/absolute) задаёт тот, кто вставляет обложку.
 */
export function CandleCover({ className, size = 'md', locale }: { className?: string; size?: 'md' | 'lg'; locale: Locale }) {
  const big = size === 'lg';
  const en = locale === 'en';
  return (
    <div aria-hidden="true" className={cx('candle-cover overflow-hidden', className)}>
      <div className={cx('absolute inset-0 flex flex-col justify-center gap-1 font-semibold leading-none tracking-tight text-onaccent', big ? 'px-[8%]' : 'px-[7%]')}>
        <span className={cx('candle-warm', big ? 'text-6xl md:text-8xl' : 'text-[clamp(26px,4.6vw,60px)]')}>{en ? '×2.7' : '×2,7'}</span>
        <span className={cx('ml-[18%]', big ? 'text-7xl md:text-[9rem]' : 'text-[clamp(34px,6.4vw,80px)]')}>×4</span>
        <span className={cx('ml-[6%] text-onaccent/80', big ? 'text-5xl md:text-7xl' : 'text-[clamp(22px,3.8vw,50px)]')}>{en ? '98%' : '98 %'}</span>
      </div>
      <span className="candle-flame absolute right-[18%] top-[22%] h-[10%] w-[3%] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] opacity-90 blur-[1px]" />
    </div>
  );
}
