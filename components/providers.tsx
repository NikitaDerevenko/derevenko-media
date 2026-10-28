'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ClientDict } from '@/lib/i18n';
import { marketOf, type Locale, type Market } from '@/lib/site';
import { captureUtm } from '@/lib/utm';

type Ctx = {
  locale: Locale;
  dict: ClientDict;
  /** Рынок определяется языком: RU — Россия и СНГ, EN — зарубежье */
  market: Market;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ locale, dict, children }: { locale: Locale; dict: ClientDict; children: React.ReactNode }) {
  useEffect(() => {
    captureUtm();
  }, []);

  const value = useMemo(() => ({ locale, dict, market: marketOf(locale) }), [locale, dict]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
