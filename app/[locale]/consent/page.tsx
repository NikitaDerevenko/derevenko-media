import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import type { Locale } from '@/lib/site';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return legalMetadata('consent', params.locale);
}

export default function ConsentPage({ params }: { params: { locale: Locale } }) {
  return <LegalPage id="consent" locale={params.locale} />;
}
