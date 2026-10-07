// app/(public)/events/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchEventBySlug,
  toOgImage,
} from '@/lib/server/events';
import { EventDetailClient } from './_components/EventDetailClient';


const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://www.nuruvent.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    return {
      title: 'Event not found · Nuruvent',
      robots: { index: false, follow: false },
    };
  }

  const title = event.display_name || event.name || 'Event';
  const description =
    event.short_description?.trim() ||
    event.description?.trim()?.slice(0, 200) ||
    `Join ${title} on Nuruvent.`;

  const ogImage = toOgImage(event, PUBLIC_SITE_URL);
  const canonicalUrl = `${PUBLIC_SITE_URL}/events/${slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Nuruvent',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    notFound();
  }

  // Server-fetched event primes both the HTML and the client cache.
  return <EventDetailClient slug={slug} />;
}