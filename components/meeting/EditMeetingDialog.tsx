/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { Check, Edit, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Schedule } from '@/lib/types/events';

export interface EditMeetingFormValues {
  session_name: string;
  start_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

interface EditMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | undefined;
  saving: boolean;
  onSave: (values: EditMeetingFormValues) => void;
}

export function EditMeetingDialog({
  open,
  onOpenChange,
  schedule,
  saving,
  onSave,
}: EditMeetingDialogProps) {
  const [form, setForm] = useState<EditMeetingFormValues>({
    session_name: '',
    start_date: '',
    start_time: '',
    end_time: '',
    timezone: 'Africa/Nairobi',
  });

  // Re-seed the form whenever the dialog opens or the schedule changes.
  useEffect(() => {
    if (!open || !schedule) return;
    setForm({
      session_name: schedule.session_name ?? '',
      start_date: schedule.start_date ?? '',
      start_time: schedule.start_time?.slice(0, 5) ?? '',
      end_time: schedule.end_time?.slice(0, 5) ?? '',
      timezone: schedule.timezone ?? 'Africa/Nairobi',
    });
  }, [open, schedule]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Meeting
          </DialogTitle>
          <DialogDescription>
            Changes to the session name, time, or timezone update the Zoom
            meeting too. Attendees keep the same join link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="session_name">Session Name</Label>
            <Input
              id="session_name"
              value={form.session_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, session_name: e.target.value }))
              }
              placeholder="Introduction to Chess Rules"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Becomes the Zoom meeting topic.
            </p>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_date: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_time: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_time: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={form.timezone}
              onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
            >
              <SelectTrigger id="timezone" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                <SelectItem value="Africa/Johannesburg">
                  Africa/Johannesburg
                </SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="America/New_York">
                  America/New_York
                </SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={saving}
            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}