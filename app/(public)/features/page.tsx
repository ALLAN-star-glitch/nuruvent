// app/(public)/features/page.tsx

import { Metadata } from 'next';
import { FeaturesContent } from './FeaturesContent';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Features — M-Pesa Payments, QR Certificates & Event Automation | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore Nuruvent features: M-Pesa & card payments, QR-verified CPD certificates, automated WhatsApp/Email reminders, Zoom attendance tracking, and 7-day payouts for training hosts.';
const PAGE_URL = `${SITE_URL}/features`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: '/features.png',
        width: 1200,
        height: 630,
        alt: 'Nuruvent Platform Features — M-Pesa Payments, QR Certificates & Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['/features.png'],
  },
  keywords: [
    'Nuruvent features',
    'M-Pesa event payments',
    'QR-verified CPD certificates',
    'automated event reminders',
    'Zoom attendance tracking',
    'Google Meet CPD tracking',
    'mobile money ticket sales',
    'event management platform',
    'online course hosting',
    'training host payouts',
    'event analytics dashboard',
    'Nuruvent',
  ],
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function FeaturesPage() {
  return (
    <>
      {/* JSON-LD Structured Data for Feature / WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            url: PAGE_URL,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${SITE_URL}/`,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Features',
                  item: PAGE_URL,
                },
              ],
            },
          }),
        }}
      />
      <FeaturesContent />
    </>
  );
}