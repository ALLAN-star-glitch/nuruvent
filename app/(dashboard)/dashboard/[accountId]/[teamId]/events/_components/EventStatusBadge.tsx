'use client';

import { StatusBadge } from "@/components/registrations/status_badge";


/**
 * Event statuses come through as display names ("Draft", "Published", etc.)
 * We normalize them to the slugs that `StatusBadge` understands.
 */
const EVENT_STATUS_SLUG: Record<string, string> = {
  Draft: 'draft',
  Published: 'published',
  Cancelled: 'cancelled',
  Completed: 'completed',
  Postponed: 'pending',
};

interface Props {
  status: string;
  className?: string;
}

export function EventStatusBadge({ status, className }: Props) {
  const slug = EVENT_STATUS_SLUG[status] ?? status.toLowerCase();

  return (
    <StatusBadge
      status={slug}
      label={status}
      variant="dot"
      className={className}
    />
  );
}