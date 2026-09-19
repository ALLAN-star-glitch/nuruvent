// components/events/fields/ScheduleSummary.tsx

'use client';

import { AlertCircle, Calendar, Clock, Globe, Video } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ScheduleForm } from '../types';

// ============================================================
// SCHEDULE SUMMARY
// ============================================================

interface ScheduleSummaryProps {
  schedule: ScheduleForm;
}

export function ScheduleSummary({ schedule }: ScheduleSummaryProps) {
  const hasStart = !!schedule.start_date;
  const hasTime = !!schedule.start_time && !!schedule.end_time;
  const isComplete = hasStart && hasTime;

  // ---- Empty state ----
  if (!hasStart && !hasTime) {
    return (
      <span className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5" />
        Not scheduled yet — click to add date and time
      </span>
    );
  }

  // ---- Incomplete state ----
  if (!isComplete) {
    return (
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5" />
        Needs {!hasStart ? 'a date' : 'a start and end time'}
      </span>
    );
  }

  // ---- Complete state ----
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {formatDateRange(schedule.start_date, schedule.end_date)}
      </span>

      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {schedule.start_time}–{schedule.end_time}
      </span>

      {schedule.timezone && (
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {shortTimezone(schedule.timezone)}
        </span>
      )}

      {schedule.is_virtual && (
        <span
          className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded',
            'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40',
          )}
        >
          <Video className="h-3 w-3" />
          Virtual
        </span>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDateRange(start: string, end: string): string {
  if (!start) return '—';

  const startLabel = formatShortDate(start);
  if (!end || end === start) return startLabel;

  return `${startLabel} – ${formatShortDate(end)}`;
}

function formatShortDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Africa/Nairobi" → "Nairobi" */
function shortTimezone(tz: string): string {
  if (!tz) return '';
  const parts = tz.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}