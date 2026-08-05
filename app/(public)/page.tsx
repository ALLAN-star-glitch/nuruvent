import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { EventGrid } from '@/components/home/EventGrid';
import { Button } from '@/components/ui/button';
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
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      {/* PWA Prompts */}
      <InstallPrompt />
      <PushNotificationManager />

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

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Programs Section */}
      <section className="bg-gray-50/50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Programs
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Upcoming Training & Workshops
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Explore handpicked professional development sessions led by industry experts.
              </p>
            </div>
            
            <Link href="/events" className="cursor-pointer">
              <Button variant="outline" className="gap-2 group border-gray-300 hover:border-primary cursor-pointer">
                Explore All Events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Grid without sidebar filter */}
          <EventGrid limit={8} />

          <div className="mt-12 text-center">
            <Link href="/events" className="cursor-pointer">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-8 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer">
                View Full Event Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}