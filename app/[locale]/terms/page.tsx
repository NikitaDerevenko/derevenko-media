import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import type { Locale } from '@/lib/site';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return legalMetadata('terms', params.locale);
}

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  return <LegalPage id="terms" locale={params.locale} />;
}
