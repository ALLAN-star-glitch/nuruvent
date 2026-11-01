'use client';

import { StatusBadge } from '@/components/registrations/status_badge';

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
  // Defensive: if `status` is missing (raw Event was passed where a
  // UIEvent was expected, or the event has no event_status), default
  // to Draft instead of crashing.
  const safeStatus = status ?? 'Draft';
  const slug = EVENT_STATUS_SLUG[safeStatus] ?? safeStatus.toLowerCase();

  return (
    <StatusBadge
      status={slug}
      label={safeStatus}
      variant="dot"
      className={className}
    />
  );
}