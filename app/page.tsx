import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EventGrid } from '@/components/home/EventGrid';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { PushNotificationManager } from '@/components/PWA/PushNotificationManager';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Global Training Event Platform`,
  description:
    SITE_DESCRIPTION +
    ' The all-in-one platform for training institutes, coaches, and professional bodies to manage workshops, webinars, bootcamps, and meetups worldwide.',
  keywords: [
    'training events',
    'professional development',
    'workshops',
    'webinars',
    'bootcamps',
    'meetups',
    'CPD events',
    'professional training',
    'Nuruvent',
    'global training platform',
    'event management',
    'virtual events',
  ].join(', '),
  robots: 'index, follow',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Light Your Training Events. Illuminate Your Growth.`,
    description:
      SITE_DESCRIPTION +
      ' The all-in-one platform for training institutes, coaches, and professional bodies to manage workshops, webinars, bootcamps, and meetups worldwide.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/hero-image.png`,
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
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            description: SITE_DESCRIPTION,
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'Global',
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
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/events?search={search_term_string}`,
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
                item: `${SITE_URL}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Events',
                item: `${SITE_URL}/events`,
              },
            ],
          }),
        }}
      />

      <HeroSection />

      <section id="events" className="container mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <CategoryFilter />
          </div>
          <div className="flex-1">
            <EventGrid />
          </div>
        </div>
      </section>

      {/* PWA Components */}
      <PushNotificationManager />
      <InstallPrompt />
    </>
  );
}