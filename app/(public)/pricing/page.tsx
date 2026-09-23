// app/(public)/pricing/page.tsx

import { Metadata } from 'next';
import { PricingContent } from './PricingContent';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Pricing — From 6% All-In on M-Pesa | Transparent Event Ticketing for Kenyan Hosts | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Honest, zero-risk pricing for event hosts in Kenya. Host free events for KES 0 forever, or sell paid tickets at 4.5% + payment handling (from 1.5% on M-Pesa). No fixed per-ticket fees. Weekly M-Pesa payouts. Cheaper than Luma, Enkare, and Eventbrite.';
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
        alt: 'Nuruvent pricing — 4.5% platform fee, 1.5% M-Pesa handling, KES 0 fixed fees',
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
    'event ticketing fees Kenya',
    'M-Pesa ticketing platform',
    'cheapest ticketing platform Kenya',
    'free event hosting Kenya',
    'Luma alternative Kenya',
    'Eventbrite alternative Kenya',
    'Enkare alternative',
    'event platform 6% fee',
    'M-Pesa payouts events',
    'CPD certificate pricing',
    'training host payouts',
    'Nuruvent',
  ],
};

export const dynamic = 'force-static';
export const revalidate = false;

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Nuruvent Event Ticketing Platform',
  description:
    'Event ticketing and registration platform for Kenyan training hosts. Free events forever, paid events at 4.5% + payment handling.',
  url: PAGE_URL,
  brand: {
    '@type': 'Brand',
    name: SITE_NAME,
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Events',
      description:
        'Unlimited free webinars, meetups, and workshops with attendance tracking, reminders, and certificates.',
      price: '0',
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
    },
    {
      '@type': 'Offer',
      name: 'Paid Tickets',
      description:
        'Sell paid tickets at 4.5% platform fee plus payment handling (1.5% M-Pesa, 3.5% local cards, 4.5% international cards). No fixed per-ticket fees.',
      price: '4.5',
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
    },
  ],
};

const BREADCRUMB_DATA = {
  '@context': 'https://schema.org',
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
};

const FAQ_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are free events really 100% free forever?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can host unlimited free webinars, workshops, or meetups globally without ever entering a credit card. We only charge when you sell paid tickets or choose to issue verified credentials.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the total cost for a paid event?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 4.5% platform fee plus payment handling — 1.5% for M-Pesa/Airtel Money, 3.5% for local cards, and 4.5% for international cards. That works out to about 6% all-in for M-Pesa payments, cheaper than Luma and far cheaper than Eventbrite.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do payouts work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Host earnings are paid out every Monday on a 7-day rolling cycle via direct mobile money transfer (M-Pesa / Airtel Money) or direct bank transfer. No minimums.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which payment methods can my attendees use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Attendees worldwide can pay using M-Pesa, Airtel Money, or credit/debit cards (Visa, Mastercard) — local and international.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I pass transaction fees to my attendees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. At checkout, you choose whether to absorb the platform fee and handling fees, or pass them on to attendees as a service fee.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does automated Zoom / Google Meet tracking work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paste your Zoom or Google Meet link when creating your event. Nuruvent connects via webhooks to log attendee join and leave times automatically — used for accurate CPD hour reporting.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Nuruvent compare to Luma and Eventbrite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On a KES 39,000 M-Pesa event, Nuruvent hosts keep KES 36,660 — about KES 741 more than Luma and KES 5,668 more than Eventbrite. Nuruvent also pays out directly to M-Pesa weekly, which Luma and Eventbrite do not.',
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      {/* Primary structured data — Product with offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_DATA) }}
      />

      {/* FAQ — drives rich snippets in Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_DATA) }}
      />

      <PricingContent />
    </>
  );
}