// app/(meeting)/meeting/[id]/page.tsx

import { ZoomMeetingClient } from './ZoomMeetingClient';

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ZoomMeetingClient meetingId={id} />;
}