// components/events/new/PreviewModal.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EventType as EventTypeModel } from '@/lib/types/events';

import { EventPreviewCard } from './EventPreviewCard';
import { EventFormData } from '../types';

// ============================================================
// PREVIEW MODAL (mobile only)
// ============================================================

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EventFormData;
  selectedEventType?: EventTypeModel;
}

export function PreviewModal({
  open,
  onOpenChange,
  formData,
  selectedEventType,
}: PreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Event Preview</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preview of your event as it will appear to attendees
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <EventPreviewCard
            data={formData}
            eventType={selectedEventType}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full cursor-pointer"
          >
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}