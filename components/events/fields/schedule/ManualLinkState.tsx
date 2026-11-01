// components/events/fields/schedule/ManualLinkState.tsx

import Image from 'next/image';
import { Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TextField } from '@/components/form';
import type { ScheduleForm } from '../../types';

export function ManualLinkState({
  schedule,
  index,
  disabled,
  onUpdateZoomLink,
  onUpdateMeetLink,
  onUseAuto,
}: {
  schedule: ScheduleForm;
  index: number;
  disabled?: boolean;
  onUpdateZoomLink: (v: string) => void;
  onUpdateMeetLink: (v: string) => void;
  onUseAuto: () => void;
}) {
  return (
    <div className="p-4 space-y-4 border-t border-border bg-background">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
          <Link2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Manual link</p>
          <p className="text-xs text-muted-foreground">
            Attendance won&apos;t be tracked automatically for this session.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'shrink-0 h-10 w-10 mt-6 rounded-lg flex items-center justify-center',
              'bg-background border border-border overflow-hidden p-1.5',
            )}
          >
            <Image
              src="/platforms/zoom.png"
              alt="Zoom logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <TextField
              name={`schedule_${index}_zoom_link`}
              label="Zoom Link"
              placeholder="https://zoom.us/j/..."
              value={schedule.zoom_link}
              onChange={onUpdateZoomLink}
              optional
              disabled={disabled}
              type="url"
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'shrink-0 h-10 w-10 mt-6 rounded-lg flex items-center justify-center',
              'bg-background border border-border overflow-hidden p-1.5',
            )}
          >
            <Image
              src="/platforms/google-meet.png"
              alt="Google Meet logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <TextField
              name={`schedule_${index}_meet_link`}
              label="Google Meet Link"
              placeholder="https://meet.google.com/..."
              value={schedule.meet_link}
              onChange={onUpdateMeetLink}
              optional
              disabled={disabled}
              type="url"
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onUseAuto}
        disabled={disabled}
        className={cn(
          'cursor-pointer font-semibold',
          'border-primary/40 text-primary hover:bg-primary/5 hover:border-primary',
        )}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Use automatic meeting creation instead
      </Button>
    </div>
  );
}