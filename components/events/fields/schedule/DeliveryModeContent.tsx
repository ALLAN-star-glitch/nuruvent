// components/events/fields/schedule/DeliveryModeContent.tsx

'use client';

import { useEffect, useMemo } from 'react';
import type { VideoPlatform } from '@/lib/types/events';
import type { ScheduleForm } from '../../types';
import type { PlatformMeta } from '../../video/PlatformPickerModal';
import type { useVideoConnection } from '../../video/useVideoConnection';
import { PLATFORMS } from '../../video/PlatformPickerModal';
import { ManualLinkState } from './ManualLinkState';
import { ConnectedState } from './ConnectedState';
import { NotConnectedState } from './NotConnectedState';

export function DeliveryModeContent({
  schedule,
  index,
  disabled,
  video,
  manualMode,
  setManualMode,
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
  const hasLink = !!(schedule.zoom_link?.trim() || schedule.meet_link?.trim());
  const hasMeeting = !!schedule.video_meeting_id;
  const showManual = manualMode || (hasLink && !hasMeeting);

  const connectedPlatforms: PlatformMeta[] = useMemo(
    () => PLATFORMS.filter((p) => p.available && !!video.getConnection(p.platform)),
    [video],
  );
  const anyConnected = connectedPlatforms.length > 0;
  const onlyOneConnected = connectedPlatforms.length === 1;

  // Auto-select the platform when exactly one is connected and the
  // schedule doesn't have one yet. Runs once per (schedule, connection)
  // pair — safe because onSelectPlatform is a no-op when the value
  // doesn't change.
  useEffect(() => {
    if (!onlyOneConnected) return;
    if (showManual) return;
    if (schedule.platform) return;
    const sole = connectedPlatforms[0];
    if (!sole) return;
    onSelectPlatform(sole.platform);
  }, [
    onlyOneConnected,
    showManual,
    schedule.platform,
    connectedPlatforms,
    onSelectPlatform,
  ]);

  const selectedPlatform: PlatformMeta | undefined = schedule.platform
    ? connectedPlatforms.find((p) => p.platform === schedule.platform)
    : onlyOneConnected
      ? connectedPlatforms[0]
      : undefined;

  if (showManual) {
    return (
      <ManualLinkState
        schedule={schedule}
        index={index}
        disabled={disabled}
        onUpdateZoomLink={onUpdateZoomLink}
        onUpdateMeetLink={onUpdateMeetLink}
        onUseAuto={() => {
          setManualMode(false);
          onUpdateZoomLink('');
          onUpdateMeetLink('');
          onClearMeeting();
        }}
      />
    );
  }

  if (anyConnected) {
    return (
      <ConnectedState
        schedule={schedule}
        platforms={connectedPlatforms}
        selected={selectedPlatform}
        video={video}
        disabled={disabled}
        hasMeeting={hasMeeting}
        onSelect={onSelectPlatform}
        onUseManual={() => setManualMode(true)}
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
    );
  }

  return (
    <NotConnectedState
      disabled={disabled}
      onConnect={() => onOpenConnectModal?.()}
      onUseManual={() => setManualMode(true)}
    />
  );
}