// app/(public)/events/[slug]/_components/DetailFooterMeta.tsx

'use client';

import { Clock as ClockIcon, FileText, Tag } from 'lucide-react';

interface DetailFooterMetaProps {
  /** Human-readable duration, e.g. "2h 30m". Empty string hides it. */
  duration: string;
  /** Whether to show the certificate row. */
  hasCertificate: boolean;
  /** Full event UUID. Only the first 8 chars are shown. */
  eventId: string;
}

/**
 * Footer meta row under the description: duration, certificate note,
 * and short reference number. Renders only the items that apply.
 */
export function DetailFooterMeta({
  duration,
  hasCertificate,
  eventId,
}: DetailFooterMetaProps) {
  const showDuration = !!duration;
  const showCertificate = hasCertificate;

  return (
    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
      {showDuration && (
        <div className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" />
          <span>Duration: {duration}</span>
        </div>
      )}

      {showDuration && (showCertificate || eventId) && (
        <span className="h-1 w-1 rounded-full bg-border" />
      )}

      {showCertificate && (
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          <span>Certificate of completion included</span>
        </div>
      )}

      {showCertificate && eventId && (
        <span className="h-1 w-1 rounded-full bg-border" />
      )}

      {eventId && (
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4" />
          <span>Ref: #{eventId.slice(0, 8)}</span>
        </div>
      )}
    </div>
  );
}