import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import type { Locale } from '@/lib/site';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return legalMetadata('privacy', params.locale);
}

export default function PrivacyPage({ params }: { params: { locale: Locale } }) {
  return <LegalPage id="privacy" locale={params.locale} />;
}
