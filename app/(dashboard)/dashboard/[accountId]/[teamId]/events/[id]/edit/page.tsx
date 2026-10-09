// app/dashboard/events/[id]/edit/page.tsx

import { EditEventWizard } from '@/components/events/EditEventWizard';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditEventWizard eventId={id} />;
}