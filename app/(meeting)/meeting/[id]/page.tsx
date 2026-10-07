// app/(meeting)/meeting/[id]/page.tsx

import type { Metadata } from 'next';
import {
  fetchEventById,
  extractEventIdFromPath,
  toOgImage,
} from '@/lib/server/events';
import { GoogleMeetRedirect } from './GoogleMeetRedirect';
import { ZoomMeetingClient } from './ZoomMeetingClient';

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://www.nuruvent.com';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;

  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : (v ?? '');
  };

  const meetingName = get('name');
  const hostName = get('host');
  const returnHref = get('return');

  const eventId = extractEventIdFromPath(returnHref);
  const event = eventId ? await fetchEventById(eventId) : null;

  const eventTitle =
    event?.display_name || event?.name || meetingName || 'Training session';

  const title = hostName
    ? `${eventTitle} · Hosted by ${hostName}`
    : eventTitle;

  const description =
    event?.short_description?.trim() ||
    event?.description?.trim()?.slice(0, 200) ||
    `You're invited to join ${eventTitle} on Nuruvent.`;

  const ogImage = toOgImage(event, PUBLIC_SITE_URL);
  const canonicalUrl = `${PUBLIC_SITE_URL}/meeting/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Nuruvent',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: eventTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function MeetingPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : (v ?? '');
  };

  const platform = get('platform');
  const meetingName = get('name');
  const hostName = get('host');
  const returnHref = get('return') || '/dashboard/events';

  if (platform === 'google_meet') {
    return (
      <GoogleMeetRedirect
        meetingId={id}
        meetingName={meetingName}
        hostName={hostName}
        returnHref={returnHref}
      />
    );
  }

  return <ZoomMeetingClient meetingId={id} returnHref={returnHref} />;
}