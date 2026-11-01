/* eslint-disable react/no-unescaped-entities */
// components/events/new/steps/ScheduleStep.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { CalendarDays, CalendarX, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { RecurrenceField } from '@/components/events/fields/RecurrenceField';
import { SchedulesField } from '@/components/events/fields/ScheduleField';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import type {
  EventFormData,
  FormErrors,
  ScheduleForm,
} from '../../types';

interface ScheduleStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
  onOpenConnectModal?: () => void;
  eventId?: string;
  onSchedulesCommitted?: (next: ScheduleForm[]) => void;
}

/**
 * Frontend mirror of the backend's ExpandRecurrence logic.
 * Helps the user see exactly what dates will be generated.
 */
function getPreviewDates(formData: EventFormData): string[] {
  const { is_recurring, recurrence, schedules } = formData;
  const startDateStr = schedules[0]?.start_date;

  if (!is_recurring || !recurrence?.pattern || !startDateStr) {
    return [];
  }

  const startDate = new Date(startDateStr);
  const endDate = recurrence.ends_on ? new Date(recurrence.ends_on) : null;
  const interval = recurrence.interval ?? 1;
  const maxCount = recurrence.occurrences ?? 100; // Safety cap

  const dates: string[] = [];
  const current = new Date(startDate);
  let count = 0;

  // Map our weekday codes to JS Date getDay() values (0 = Sunday)
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6
  };

  const allowedDays = recurrence.days_of_week.map(d => dayMap[d]);

  while (dates.length < maxCount && count < 1000) {
    // Check end date bounds
    if (endDate && current > endDate) break;

    // Check if this date should be included
    let shouldInclude = false;
    
    if (recurrence.pattern === 'daily') {
      shouldInclude = true;
    } else if (recurrence.pattern === 'weekly') {
      // If no specific days are picked, fall back to the start date's weekday
      const targets = allowedDays.length > 0 ? allowedDays : [startDate.getDay()];
      shouldInclude = targets.includes(current.getDay());
    } else if (recurrence.pattern === 'monthly') {
      // Not fully implemented in preview, but falls back to simple day matching
      shouldInclude = current.getDate() === startDate.getDate();
    }

    if (shouldInclude) {
      dates.push(current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    }

    // Advance the date
    if (recurrence.pattern === 'daily') {
      current.setDate(current.getDate() + interval);
    } else if (recurrence.pattern === 'weekly') {
      current.setDate(current.getDate() + 1); // Check every day for weekly
      // Skip ahead if we've moved to a new week to respect the interval
      if (current.getDay() === startDate.getDay()) { 
        // We only apply the interval when we wrap around the week
        if (interval > 1 && dates.length % (allowedDays.length || 1) === 0) {
            current.setDate(current.getDate() + (7 * (interval - 1)));
        }
      }
    } else {
      current.setMonth(current.getMonth() + interval); // Basic monthly
    }
    count++;
  }

  return dates;
}

export function ScheduleStep({
  formData,
  validationErrors,
  onFieldChange,
  onOpenConnectModal,
  eventId,
  onSchedulesCommitted,
}: ScheduleStepProps) {
  const searchParams = useSearchParams();
  const [isDatesDialogOpen, setIsDatesDialogOpen] = useState(false);
  const videoJustConnected = searchParams.get('video_connected') === 'true';

  const previewDates = getPreviewDates(formData);
  const displayDates = previewDates.slice(0, 6);
  const hasMore = previewDates.length > 6;

  return (
    <div className="space-y-6">
      <RecurrenceField
        enabled={formData.is_recurring}
        value={formData.recurrence}
        onEnabledChange={(enabled) =>
          onFieldChange('is_recurring', enabled)
        }
        onChange={(r) => onFieldChange('recurrence', r)}
        startDate={formData.schedules[0]?.start_date ?? ''}
        onStartDateChange={(date) => {
          const newSchedules = [...formData.schedules];
          if (newSchedules.length > 0) {
            newSchedules[0] = { ...newSchedules[0], start_date: date };
            onFieldChange('schedules', newSchedules);
          }
        }}
        error={validationErrors.recurrence}
      />

      {/* --- LIVE PREVIEW BOX --- */}
      {formData.is_recurring && formData.recurrence?.pattern && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            Your event will run on these dates:
          </h4>
          
          {displayDates.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              {displayDates.map((date, i) => (
                <span key={i} className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium text-foreground">
                  {date}
                </span>
              ))}
              
              {hasMore && (
                <Dialog open={isDatesDialogOpen} onOpenChange={setIsDatesDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                      + {previewDates.length - 6} more dates
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md w-[95vw] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>All Event Dates</DialogTitle>
                      <DialogDescription>
                        This event will run on {previewDates.length} dates in total.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-4 -mr-4 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {previewDates.map((date, i) => (
                          <span key={i} className="px-2.5 py-1 bg-muted border border-border rounded-md text-xs font-medium text-foreground">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <CalendarX className="h-3.5 w-3.5" />
              No dates match these rules. Try widening your end date or selecting more days.
            </p>
          )}
        </div>
      )}

      <SchedulesField
        value={formData.schedules}
        onChange={(v: ScheduleForm[]) => onFieldChange('schedules', v)}
        error={validationErrors.schedules}
        onOpenConnectModal={onOpenConnectModal}
        eventId={eventId}
        onSchedulesCommitted={onSchedulesCommitted}
        videoJustConnected={videoJustConnected}
        isRecurring={formData.is_recurring}
      />
    </div>
  );
}