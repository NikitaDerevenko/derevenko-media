import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import type { Locale } from '@/lib/site';

export async function generateMetadata({ params: paramsP }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await paramsP;
  return legalMetadata('privacy', params.locale);
}

export default async function PrivacyPage({ params: paramsP }: { params: Promise<{ locale: Locale }> }) {
  const params = await paramsP;
  return <LegalPage id="privacy" locale={params.locale} />;
}
