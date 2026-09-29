// app/(meeting)/meeting/[id]/page.tsx

import { GoogleMeetRedirect } from './GoogleMeetRedirect';
import { ZoomMeetingClient } from './ZoomMeetingClient';


export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  // Zoom (or unknown) → embedded Zoom client
  return <ZoomMeetingClient meetingId={id} returnHref={returnHref} />;
}