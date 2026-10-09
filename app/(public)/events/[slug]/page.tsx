// app/(public)/events/[slug]/page.tsx

import type { Metadata } from 'next';
import { fetchEventBySlug, toOgImage } from '@/lib/server/events';
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
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Server-side fetch primes SEO + HTML for public events.
  //
  // It runs anonymously (no browser auth), so it will fail for
  // private events. We do NOT call notFound() here — instead we let
  // the client component retry with the user's auth token and decide
  // what to render. That way private-event members can still see the
  // page, and anonymous visitors get the client-side "private/not
  // found" state.
  //
  // Public events: this fetch succeeds and primes the client cache,
  // so the client's useGetEventBySlugQuery resolves instantly.
  await fetchEventBySlug(slug).catch(() => null);

  return <EventDetailClient slug={slug} />;
}