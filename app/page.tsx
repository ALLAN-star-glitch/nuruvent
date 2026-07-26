// app/(public)/page.tsx

import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EventGrid } from '@/components/home/EventGrid';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Kenya's Training Event Platform`,
  description:
    SITE_DESCRIPTION +
    ' The all-in-one platform for training institutes, coaches, and professional bodies to manage workshops, webinars, bootcamps, and meetups in Kenya.',
  keywords: [
    'training events Kenya',
    'professional development Kenya',
    'workshops Kenya',
    'webinars Kenya',
    'bootcamps Kenya',
    'meetups Kenya',
    'CPD events',
    'professional training',
    'Nuruvent',
    'Kenya training platform',
  ].join(', '),
  robots: 'index, follow',
  alternates: {
    canonical: 'https://nuruvent.vercel.app',
  },
  openGraph: {
    title: `${SITE_NAME} | Light Your Training Events. Illuminate Your Growth.`,
    description:
      SITE_DESCRIPTION +
      ' The all-in-one platform for training institutes, coaches, and professional bodies to manage workshops, webinars, bootcamps, and meetups in Kenya.',
    url: 'https://nuruvent.vercel.app',
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: 'https://nuruvent.vercel.app/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'Nuruvent - Light Your Training Events. Illuminate Your Growth.',
      },
    ],
  },
};

export const revalidate = 2592000; // 30 days

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: 'https://nuruvent.vercel.app',
            logo: 'https://nuruvent.vercel.app/logo.png',
            description: SITE_DESCRIPTION,
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'KE',
            },
            sameAs: [
              'https://www.linkedin.com/company/nuruvent',
              'https://twitter.com/nuruvent',
            ],
          }),
        }}
      />

      {/* JSON-LD for WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: 'https://nuruvent.vercel.app',
            description: SITE_DESCRIPTION,
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://nuruvent.vercel.app/events?search={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://nuruvent.vercel.app/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Events',
                item: 'https://nuruvent.vercel.app/events',
              },
            ],
          }),
        }}
      />

      <HeroSection />

      <section id="events" className="container mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Category Filter */}
          <div className="lg:w-64 flex-shrink-0">
            <CategoryFilter />
          </div>

          {/* Right: Events */}
          <div className="flex-1">
            <EventGrid />
          </div>
        </div>
      </section>
    </>
  );
}