// components/events/new/SaveSuccessDialog.tsx

'use client';

import { CheckCircle2 } from 'lucide-react';

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

import type { EventType as EventTypeModel } from '@/lib/types/events';

import type { EventFormData } from '../types';

// ============================================================
// SAVE SUCCESS DIALOG
// ============================================================
//
// Shown after a successful Save Draft or Publish. The parent owns
// `open` and the navigation callbacks; this component is purely
// presentational.

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-dark">
            <CheckCircle2 className="h-6 w-6 text-tertiary-500" />
            {isPublished ? 'Event Published' : 'Draft Saved'}
          </DialogTitle>
          <DialogDescription className="text-neutral-gray">
            {isPublished
              ? 'Your event has been published and is now visible to attendees.'
              : 'Your event has been saved as a draft. You can publish it anytime.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center gap-4">
          <div className="w-full p-4 bg-neutral-light rounded-lg border border-neutral-light">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-neutral-dark">{titleLabel}</p>
                <p className="text-sm text-neutral-gray">
                  {dateLabel} • {typeLabel}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  isPublished
                    ? 'text-tertiary-600 border-tertiary-200 bg-tertiary-50'
                    : 'text-neutral-gray border-neutral-light bg-neutral-light',
                )}
              >
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>

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
                className="flex-1 bg-primary hover:bg-primary-600 text-white cursor-pointer"
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