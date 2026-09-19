// app/events/page.tsx

import { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EventGrid } from '@/components/home/EventGrid';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Browse Training Events, Workshops & Online Courses | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Discover certified training events, live workshops, self-paced courses, and technical masterclasses. Filter by category, date, format, or topic.';
const PAGE_URL = `${SITE_URL}/events`;

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
        url: '/events.png',
        width: 1200,
        height: 630,
        alt: 'Browse Certified Training Events & Courses on Nuruvent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['/events.png'],
  },
  keywords: [
    'training events and courses',
    'online courses platform',
    'find professional workshops',
    'certified bootcamps',
    'CPD accredited webinars',
    'online training courses',
    'tech masterclasses',
    'M-Pesa course payments',
    'professional development courses',
    'Nuruvent events and courses',
  ],
};

export const revalidate = 3600;

function EventGridWrapper() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-4 animate-pulse"
            >
              <div className="h-32 bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      }
    >
      <EventGrid limit={12} />
    </Suspense>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
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
                    name: 'Events & Courses',
                    item: PAGE_URL,
                  },
                ],
              },
              {
                '@type': 'CollectionPage',
                name: PAGE_TITLE,
                description: PAGE_DESCRIPTION,
                url: PAGE_URL,
              },
            ],
          }),
        }}
      />

      {/* ===== HERO SECTION WITH FADE OUT & BACKGROUND IMAGE ===== */}
      <section className="relative overflow-hidden bg-background py-14 md:py-20 border-b border-border">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/how-it-works.png"
            alt="Training Events & Courses Catalog"
            fill
            className="object-cover object-right"
            priority
          />

          {/* Smooth left-to-right & bottom fade out gradient overlay */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Mobile & Tablet Fallback Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70 lg:hidden" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent lg:hidden" />
        </div>

        {/* Pattern Overlay on Left Side */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
          <svg
            className="absolute left-8 top-6 h-56 w-56"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="dotPatternEvents"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPatternEvents)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 shadow-xs cursor-default">
              <Sparkles className="h-4 w-4" />
              <span>Certified Events, Bootcamps & Courses</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-3">
              Explore Training Events &{' '}
              <span className="bg-gradient-to-r from-primary via-primary-600 to-primary-800 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Elevate your skills with certified online courses, live workshops, bootcamps, and technical masterclasses led by global practitioners.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog Grid + Category Filter */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Filter - Sticky Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <CategoryFilter />
          </div>

          {/* Event Grid - 4 columns */}
          <div className="flex-1">
            <EventGridWrapper />
          </div>
        </div>
      </div>
    </div>
  );
}