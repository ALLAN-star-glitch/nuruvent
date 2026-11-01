// app/(public)/events/[slug]/_components/DetailRecurringStrip.tsx

'use client';

import { CalendarDays } from 'lucide-react';

import type { Recurrence } from '@/lib/types/events';

interface DetailRecurringStripProps {
  /** Single-line summary, e.g. "Weekly on Mon & Thu · Jan 4, 2027 – Dec 28, 2028". */
  dateSummary: string;
  /** The event's recurrence config, if any. */
  recurrence?: Recurrence | null;
  /** True only for recurring events (not multi-day-only). */
  isRecurring: boolean;
}

/**
 * Highlight strip shown on the detail page for recurring or multi-day
 * events, so the full scope is unmistakable at a glance.
 */
export function DetailRecurringStrip({
  dateSummary,
  recurrence,
  isRecurring,
}: DetailRecurringStripProps) {
  const hasDays =
    isRecurring &&
    recurrence?.days_of_week &&
    recurrence.days_of_week.length > 0;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{dateSummary}</p>
        {hasDays && recurrence ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sessions run {recurrence.frequency}
          </p>
        ) : null}
      </div>
    </div>
  );
}