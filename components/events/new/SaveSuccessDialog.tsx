/* eslint-disable react-hooks/set-state-in-effect */
// components/events/new/SaveSuccessDialog.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { useGetEventByIdQuery } from '@/lib/store/api/eventsApi';
import type { EventType as EventTypeModel } from '@/lib/types/events';

import type { EventFormData } from '../types';

// ============================================================
// SAVE SUCCESS DIALOG
// ============================================================

interface SaveSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPublished: boolean;
  createdEventId: string | null;
  formData: EventFormData;
  selectedEventType?: EventTypeModel;
  onGoToEvents: () => void;
  onViewEvent: () => void;
  onDismiss: () => void;
}

type ProvisionState = 'idle' | 'polling' | 'done' | 'timed-out';

export function SaveSuccessDialog({
  open,
  onOpenChange,
  isPublished,
  createdEventId,
  formData,
  selectedEventType,
  onGoToEvents,
  onViewEvent,
  onDismiss,
}: SaveSuccessDialogProps) {
  const primarySchedule = formData.schedules?.[0];
  const dateLabel = primarySchedule?.start_date || 'TBD';
  const titleLabel = formData.name || 'Untitled Event';
  const typeLabel =
    selectedEventType?.display_name || selectedEventType?.name || 'No type';

  const hasVirtualSessions = !!formData.schedules?.some(
    (s) => s.is_virtual && !!s.platform,
  );
  const shouldPoll = isPublished && hasVirtualSessions && !!createdEventId;

  const [provisionState, setProvisionState] =
    useState<ProvisionState>('idle');
  const [pollAttempts, setPollAttempts] = useState(0);

  // Poll the event every 2s while the dialog is open and meetings
  // haven't been provisioned yet. Stops when all sessions have
  // video_meeting_id (or after 15 attempts — 30s timeout).
  const { data: eventResponse, refetch } = useGetEventByIdQuery(
    createdEventId ?? '',
    { skip: !shouldPoll || !open },
  );

  const event = eventResponse?.data;
  const allProvisioned = useMemo(() => {
    if (!event?.schedules?.length) return false;
    return event.schedules.every(
      (s) => !s.is_virtual || !!s.video_meeting_id,
    );
  }, [event]);

  // Reset state when the dialog opens for a fresh save.
  useEffect(() => {
    if (open && shouldPoll) {
      setProvisionState('polling');
      setPollAttempts(0);
    } else if (!open) {
      setProvisionState('idle');
    }
  }, [open, shouldPoll]);

  // Drive the poll.
  useEffect(() => {
    if (!open || provisionState !== 'polling') return;

    if (allProvisioned) {
      setProvisionState('done');
      return;
    }
    if (pollAttempts >= 15) {
      setProvisionState('timed-out');
      return;
    }

    const t = setTimeout(() => {
      refetch();
      setPollAttempts((n) => n + 1);
    }, 2000);
    return () => clearTimeout(t);
  }, [open, provisionState, allProvisioned, pollAttempts, refetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-6 w-6 text-tertiary-500" />
            {isPublished ? 'Event Published' : 'Draft Saved'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isPublished
              ? 'Your event has been published and is now visible to attendees.'
              : 'Your event has been saved as a draft. You can publish it anytime.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center gap-4">
          <div className="w-full p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">{titleLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {dateLabel} • {typeLabel}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  isPublished
                    ? 'text-tertiary-600 dark:text-tertiary-400 border-tertiary-200 dark:border-tertiary-900/50 bg-tertiary-50 dark:bg-tertiary-950/40'
                    : 'text-muted-foreground border-border bg-muted',
                )}
              >
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>

          {shouldPoll && provisionState === 'polling' && (
            <div className="w-full flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">
                  Generating meeting links…
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This usually takes a few seconds.
                </p>
              </div>
            </div>
          )}

          {shouldPoll && provisionState === 'done' && (
            <div className="w-full flex items-start gap-2.5 rounded-lg border border-tertiary-500/30 bg-tertiary-50 dark:bg-tertiary-950/20 p-3">
              <CheckCircle2 className="h-4 w-4 text-tertiary-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-tertiary-700 dark:text-tertiary-300">
                  Meeting links ready
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open the event to share them with attendees.
                </p>
              </div>
            </div>
          )}

          {shouldPoll && provisionState === 'timed-out' && (
            <div className="w-full flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 p-3">
              <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Still provisioning
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Links will appear on the event page shortly.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onGoToEvents}
            >
              Go to Events
            </Button>
            {isPublished && createdEventId && (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                onClick={onViewEvent}
              >
                View Event
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="w-full cursor-pointer"
            onClick={onDismiss}
          >
            {isPublished ? 'Done' : 'Create Another'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}