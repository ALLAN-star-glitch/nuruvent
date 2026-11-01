// components/events/fields/schedule/DeliveryModeSection.tsx

'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';
import type { VideoPlatform } from '@/lib/types/events';
import type { ScheduleForm } from '../../types';
import type { useVideoConnection } from '../../video/useVideoConnection';
import { DeliveryModeContent } from './DeliveryModeContent';

export function DeliveryModeSection({
  schedule,
  index,
  disabled,
  video,
  manualMode,
  setManualMode,
  onToggleVirtual,
  onSelectPlatform,
  onUpdateZoomLink,
  onUpdateMeetLink,
  onClearMeeting,
  onOpenConnectModal,
  isPersisted,
  isMeetingActionRunning,
  otherSessionsMissingMeeting,
  copied,
  onCreateMeeting,
  onRegenerateMeeting,
  onDeleteMeeting,
  onCopyMeetingLink,
  isRecurring, // <--- NEW
}: {
  schedule: ScheduleForm;
  index: number;
  disabled?: boolean;
  video: ReturnType<typeof useVideoConnection>;
  manualMode: boolean;
  setManualMode: (on: boolean) => void;
  onToggleVirtual: (on: boolean) => void;
  onSelectPlatform: (platform: VideoPlatform) => void;
  onUpdateZoomLink: (v: string) => void;
  onUpdateMeetLink: (v: string) => void;
  onClearMeeting: () => void;
  onOpenConnectModal?: () => void;
  isPersisted: boolean;
  isMeetingActionRunning: boolean;
  otherSessionsMissingMeeting: number;
  copied: boolean;
  onCreateMeeting: () => void;
  onRegenerateMeeting: () => void;
  onDeleteMeeting: () => void;
  onCopyMeetingLink: () => void;
  isRecurring?: boolean; // <--- NEW
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center justify-between p-4 bg-muted/50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg transition-colors',
              schedule.is_virtual
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Video className="h-4 w-4" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-foreground">
              Virtual session
            </Label>
            <p className="text-sm text-muted-foreground">
              {schedule.is_virtual
                ? 'A meeting link will be created automatically.'
                : 'This session takes place in person.'}
            </p>
          </div>
        </div>
        <Switch
          checked={schedule.is_virtual}
          onCheckedChange={onToggleVirtual}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>

      {schedule.is_virtual && (
        <DeliveryModeContent
          schedule={schedule}
          index={index}
          disabled={disabled}
          video={video}
          manualMode={manualMode}
          setManualMode={setManualMode}
          onSelectPlatform={onSelectPlatform}
          onUpdateZoomLink={onUpdateZoomLink}
          onUpdateMeetLink={onUpdateMeetLink}
          onClearMeeting={onClearMeeting}
          onOpenConnectModal={onOpenConnectModal}
          isPersisted={isPersisted}
          isMeetingActionRunning={isMeetingActionRunning}
          otherSessionsMissingMeeting={otherSessionsMissingMeeting}
          copied={copied}
          onCreateMeeting={onCreateMeeting}
          onRegenerateMeeting={onRegenerateMeeting}
          onDeleteMeeting={onDeleteMeeting}
          onCopyMeetingLink={onCopyMeetingLink}
          isRecurring={isRecurring} // <--- NEW
        />
      )}
    </div>
  );
}