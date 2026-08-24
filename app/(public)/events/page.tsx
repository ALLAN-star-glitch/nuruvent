// app/events/page.tsx

import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBar } from '@/components/layout/SearchBar';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EventGrid } from '@/components/home/EventGrid';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Browse Training Events & Workshops | ${SITE_NAME}`,
  description:
    'Discover upcoming professional workshops, bootcamps, webinars, and certified training courses. Filter by category, date, and format.',
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
  openGraph: {
    title: `Browse Training Events & Workshops | ${SITE_NAME}`,
    description:
      'Explore certified professional training events, hands-on workshops, and online masterclasses.',
    url: `${SITE_URL}/events`,
    siteName: SITE_NAME,
    type: 'website',
  },
};

export const revalidate = 3600;

function EventGridWrapper() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    }>
      <EventGrid limit={12} />
    </Suspense>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
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

      {/* Catalog Header */}
      <div className="bg-white border-b border-gray-200 py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Explore Training Events
            </h1>
            <p className="mt-2 text-base sm:text-lg text-gray-600">
              Elevate your skills with certified courses, live bootcamps, and technical masterclasses led by global practitioners.
            </p>
          </div>

          <div className="mt-6 max-w-2xl">
            <SearchBar placeholder="Search events by title, topic, or speaker..." />
          </div>
        </div>
      </div>

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