// components/events/fields/schedule/ConnectedState.tsx

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Pencil, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';
import type { ScheduleForm } from '../../types';
import type { PlatformMeta } from '../../video/PlatformPickerModal';
import type { useVideoConnection } from '../../video/useVideoConnection';
import { SinglePlatformHeader } from './SinglePlatformHeader';
import { MeetingActionsInline } from './MeetingActionsInline';

export function ConnectedState({
  schedule,
  platforms,
  selected,
  video,
  disabled,
  hasMeeting,
  onSelect,
  onUseManual,
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
  platforms: PlatformMeta[];
  selected: PlatformMeta | undefined;
  video: ReturnType<typeof useVideoConnection>;
  disabled?: boolean;
  hasMeeting: boolean;
  onSelect: (platform: VideoPlatform) => void;
  onUseManual: () => void;
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
  const onlyOne = platforms.length === 1;
  const meetingLink = schedule.zoom_link || schedule.meet_link || undefined;

  const canCreateMeeting = !!selected?.platform && !hasMeeting;

  return (
    <div className="p-4 border-t border-border bg-primary/5 space-y-4">
      {onlyOne ? (
        <SinglePlatformHeader
          platform={platforms[0]}
          connection={video.getConnection(platforms[0].platform)}
          hasMeeting={hasMeeting}
          isSelected={selected?.platform === platforms[0].platform}
        />
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Create the meeting on
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You have more than one account connected. Choose which one
              should host this session.
            </p>
          </div>

          <div className="space-y-2">
            {platforms.map((p) => {
              const connection = video.getConnection(p.platform);
              const isActive = selected?.platform === p.platform;

              return (
                <button
                  key={p.platform}
                  type="button"
                  onClick={() => onSelect(p.platform)}
                  disabled={disabled}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer',
                    isActive
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5',
                  )}
                >
                  <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center p-1.5 shrink-0">
                    <Image
                      src={p.logo}
                      alt={`${p.label} logo`}
                      width={28}
                      height={28}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {p.label}
                    </p>
                    {connection && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {connection.external_email}
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                      isActive
                        ? 'border-primary bg-primary'
                        : 'border-border bg-background',
                    )}
                  >
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <p className="text-xs text-muted-foreground">
              {hasMeeting
                ? `This session will update on ${selected.label}. The join link stays the same.`
                : isRecurring
                  ? `A ${selected.label} meeting will be created for each occurrence when you publish.`
                  : `A ${selected.label} meeting will be created when you publish.`}
            </p>
          )}
        </>
      )}

      <MeetingActionsInline
        meetingLink={meetingLink}
        platform={selected}
        isPersisted={isPersisted}
        hasMeeting={hasMeeting}
        canCreateMeeting={canCreateMeeting}
        isRunning={isMeetingActionRunning}
        otherSessionsMissingMeeting={otherSessionsMissingMeeting}
        onCreate={onCreateMeeting}
        onRegenerate={onRegenerateMeeting}
        onDelete={onDeleteMeeting}
        onCopy={onCopyMeetingLink}
        copied={copied}
        disabled={disabled}
        isRecurring={isRecurring} // <--- NEW
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUseManual}
          disabled={disabled}
          className="cursor-pointer font-semibold h-9 border-border text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Use a different link
        </Button>

        {onOpenConnectModal && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenConnectModal}
            disabled={disabled}
            className="cursor-pointer font-semibold h-9 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
          >
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            Manage connections
          </Button>
        )}
      </div>
    </div>
  );
}