// app/(public)/pricing/page.tsx

import { Metadata } from 'next';
import { PricingContent } from './PricingContent';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Pricing — Transparent Event Ticket Pricing & Payouts | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Transparent, zero-risk pricing for training hosts. Host free events for $0 forever or sell paid tickets at just 3.5%. M-Pesa & card processing with fast payouts.';
const PAGE_URL = `${SITE_URL}/pricing`;

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
        url: '/pricing.png',
        width: 1200,
        height: 630,
        alt: 'Nuruvent Transparent Pricing & Low Take-Rates for Event Hosts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['/pricing.png'],
  },
  keywords: [
    'Nuruvent pricing',
    'event ticketing fees',
    'free event hosting',
    'M-Pesa ticketing pricing',
    'low take rate event platform',
    'CPD certificate pricing',
    'training host payouts',
    'Eventbrite alternative pricing',
    'Luma alternative pricing',
    'Nuruvent',
  ],
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function PricingPage() {
  return (
    <>
      {/* JSON-LD Structured Data for Pricing Page */}
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
                  name: 'Pricing',
                  item: PAGE_URL,
                },
              ],
            },
          }),
        }}
      />
      <PricingContent />
    </>
  );
}