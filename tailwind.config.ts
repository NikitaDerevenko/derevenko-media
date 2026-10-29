import type { Config } from 'tailwindcss';

// Все цвета — из CSS-переменных в app/globals.css (:root). В компонентах цвета не хардкодятся.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2.5rem' },
      screens: { '2xl': '1240px' },
    },
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        accent: { DEFAULT: v('accent'), dark: v('accent-dark'), soft: v('accent-soft') },
        dark: { DEFAULT: v('dark'), 2: v('dark-2'), line: v('dark-line'), muted: v('dark-muted') },
        lime: v('lime'),
        onaccent: v('on-accent'),
        device: { DEFAULT: v('device'), body: v('device-body'), edge: v('device-edge') },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        caps: '0.08em',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--ink) / .05), 0 8px 24px -12px rgb(var(--ink) / .14)',
        device: '0 40px 80px -30px rgb(var(--ink) / .45), 0 18px 30px -18px rgb(var(--ink) / .35)',
        accent: 'none',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
