// components/events/fields/schedule/SchedulesField.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';

import {
  useCreateEventMeetingMutation,
  useDeleteEventMeetingMutation,
  useRegenerateEventMeetingMutation,
  useReorderSchedulesMutation,
} from '@/lib/store/api/eventsApi';

import {
  DateField,
  TextField,
  TimeField,
  TimezoneField,
  fieldId,
  type FieldBaseProps,
} from '@/components/form';

import { ScheduleSummary } from '../ScheduleSummary';
import { makeEmptySchedule, type ScheduleForm } from '../../types';
import { useVideoConnection } from '../../video/useVideoConnection';
import { PLATFORMS, type PlatformMeta } from '../../video/PlatformPickerModal';
import {
  PlatformChangeConfirmDialog,
  type PlatformChangeKind,
} from '../../video/PlatformChangeConfirmDialog';

import { PlatformBadge } from './PlatformBadge';
import { SortableScheduleRow } from './SortableScheduleRow';
import { DeliveryModeSection } from './DeliveryModeSection';
import {
  copyToClipboard,
  scheduleLink,
  buildPlatformChangePatch,
  buildToggleToInPersonPatch,
} from './scheduleUtils';

// ============================================================
// PROPS
// ============================================================

export interface SchedulesFieldProps extends FieldBaseProps {
  value: ScheduleForm[];
  onChange: (value: ScheduleForm[]) => void;
  onOpenConnectModal?: () => void;
  eventId?: string;
  onMeetingChanged?: () => void;
  onSchedulesCommitted?: (next: ScheduleForm[]) => void;
  videoJustConnected?: boolean;
  isRecurring?: boolean;
}

const MAX_SCHEDULES = 20;

interface PendingPlatformChange {
  key: string;
  kind: PlatformChangeKind;
  fromPlatform?: VideoPlatform;
  toPlatform?: VideoPlatform;
  sessionName?: string;
  apply: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function SchedulesField({
  value,
  onChange,
  error,
  disabled,
  id,
  onOpenConnectModal,
  eventId,
  onMeetingChanged,
  onSchedulesCommitted,
  videoJustConnected,
  isRecurring = false,
}: SchedulesFieldProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState<Record<string, boolean>>({});

  const [runningSessionKey, setRunningSessionKey] = useState<string | null>(null);
  const [copiedSessionKey, setCopiedSessionKey] = useState<string | null>(null);

  const [pendingChange, setPendingChange] = useState<PendingPlatformChange | null>(null);

  const video = useVideoConnection();

  const [createEventMeeting] = useCreateEventMeetingMutation();
  const [deleteEventMeeting] = useDeleteEventMeetingMutation();
  const [regenerateEventMeeting] = useRegenerateEventMeetingMutation();
  const [reorderSchedules] = useReorderSchedulesMutation();

  const schedules: ScheduleForm[] = useMemo(
    () => (value.length > 0 ? value : [makeEmptySchedule()]),
    [value],
  );

  // When recurring, only the FIRST schedule is the template.
  const visibleSchedules = isRecurring ? schedules.slice(0, 1) : schedules;

  useEffect(() => {
    if (videoJustConnected && schedules.length > 0) {
      const virtualIndex = schedules.findIndex((s) => s.is_virtual);
      const keyToOpen =
        virtualIndex >= 0 ? schedules[virtualIndex]._key : schedules[0]._key;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenKey(keyToOpen);

      setTimeout(() => {
        const el = document.getElementById(fieldId('schedules', id));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [videoJustConnected, schedules, id]);

  const update = <K extends keyof ScheduleForm>(
    key: string,
    field: K,
    v: ScheduleForm[K],
  ) => {
    onChange(schedules.map((s) => (s._key === key ? { ...s, [field]: v } : s)));
  };

  const updateFields = (key: string, patch: Partial<ScheduleForm>) => {
    onChange(schedules.map((s) => (s._key === key ? { ...s, ...patch } : s)));
  };

  const addSchedule = () => {
    if (schedules.length >= MAX_SCHEDULES) return;
    const next = makeEmptySchedule();
    const lastTz = schedules[schedules.length - 1]?.timezone;
    if (lastTz) next.timezone = lastTz;

    const maxNumber = schedules.reduce(
      (m, s) => Math.max(m, s.session_number ?? 0),
      0,
    );
    next.session_number = maxNumber + 1;

    onChange([...schedules, next]);
    setOpenKey(next._key);
  };

  const confirmRemove = (key: string) => {
    if (schedules.length <= 1) return;
    onChange(schedules.filter((s) => s._key !== key));
    if (openKey === key) setOpenKey(null);
    setPendingRemoveKey(null);
  };

  const toggleOpen = (key: string) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  // ============================================================
  // PLATFORM CHANGE
  // ============================================================

  const applyPlatformChange = (
    key: string,
    nextPlatform: VideoPlatform | undefined,
  ) => {
    const s = schedules.find((x) => x._key === key);
    if (!s) return;
    updateFields(key, buildPlatformChangePatch(s, nextPlatform));
  };

  const requestPlatformChange = (
    key: string,
    nextPlatform: VideoPlatform,
  ) => {
    const s = schedules.find((x) => x._key === key);
    if (!s) return;

    const hasMeeting = !!s.video_meeting_id;
    const fromPlatform = s.platform ?? undefined;
    const changing =
      hasMeeting && fromPlatform !== undefined && fromPlatform !== nextPlatform;

    if (!changing) {
      applyPlatformChange(key, nextPlatform);
      return;
    }

    setPendingChange({
      key,
      kind: 'switch-platform',
      fromPlatform,
      toPlatform: nextPlatform,
      sessionName: s.session_name?.trim() || undefined,
      apply: () => applyPlatformChange(key, nextPlatform),
    });
  };

  const requestToggleVirtual = (key: string, on: boolean) => {
    const s = schedules.find((x) => x._key === key);
    if (!s) return;

    if (on) {
      updateFields(key, { is_virtual: true });
      return;
    }

    const hasMeeting = !!s.video_meeting_id;
    if (!hasMeeting) {
      updateFields(key, buildToggleToInPersonPatch());
      return;
    }

    setPendingChange({
      key,
      kind: 'go-in-person',
      fromPlatform: s.platform ?? undefined,
      sessionName: s.session_name?.trim() || undefined,
      apply: () => updateFields(key, buildToggleToInPersonPatch()),
    });
  };

  // ============================================================
  // DRAG AND DROP
  // ============================================================

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = schedules.findIndex((s) => s._key === active.id);
    const newIndex = schedules.findIndex((s) => s._key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(schedules, oldIndex, newIndex).map((s, i) => ({
      ...s,
      session_number: i + 1,
    }));
    onChange(reordered);
    onSchedulesCommitted?.(reordered);

    if (!eventId) return;

    const orderedIds = reordered
      .map((s) => s.id)
      .filter((sid): sid is string => !!sid);

    if (orderedIds.length !== reordered.length) return;

    reorderSchedules({ eventId, orderedIds })
      .unwrap()
      .catch(() => {
        toast.error('Could not save the new order');
      });
  };

  // ============================================================
  // MEETING ACTIONS
  // ============================================================

  const handleCreateMeetingForSession = async (
    sessionKey: string,
    platform: VideoPlatform,
  ) => {
    if (!eventId) return;
    setRunningSessionKey(sessionKey);
    const label =
      PLATFORMS.find((p) => p.platform === platform)?.label ?? platform;
    const t = toast.loading(`Creating ${label} meeting…`);
    try {
      await createEventMeeting({ eventId, platform }).unwrap();
      toast.dismiss(t);
      toast.success('Meeting created');
      onMeetingChanged?.();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create meeting';
      toast.error(msg);
    } finally {
      setRunningSessionKey(null);
    }
  };

  const handleRegenerateMeetingForSession = async (_sessionKey: string) => {
    if (!eventId) return;
    setRunningSessionKey(_sessionKey);
    const t = toast.loading('Regenerating meeting…');
    try {
      await regenerateEventMeeting(eventId).unwrap();
      toast.dismiss(t);
      toast.success('Meeting regenerated');
      onMeetingChanged?.();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to regenerate meeting';
      toast.error(msg);
    } finally {
      setRunningSessionKey(null);
    }
  };

  const handleDeleteMeetingForSession = async (_sessionKey: string) => {
    if (!eventId) return;
    setRunningSessionKey(_sessionKey);
    const t = toast.loading('Deleting meeting…');
    try {
      await deleteEventMeeting(eventId).unwrap();
      toast.dismiss(t);
      toast.success('Meeting deleted');
      onMeetingChanged?.();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete meeting';
      toast.error(msg);
    } finally {
      setRunningSessionKey(null);
    }
  };

  const handleCopySessionLink = async (sessionKey: string, link: string) => {
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopiedSessionKey(sessionKey);
      toast.success('Join link copied');
      setTimeout(() => setCopiedSessionKey(null), 2000);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const sessionsMissingMeeting = value.filter(
    (s) => s.is_virtual && !s.video_meeting_id,
  ).length;

  return (
    <div id={fieldId('schedules', id)} className={cn("space-y-3", isRecurring && "mt-6")}>
      
      {/* Only show the section header when NOT recurring */}
      {!isRecurring && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Schedule <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {schedules.length}{' '}
            {schedules.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>
      )}

      {/* Rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleSchedules.map((s) => s._key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {visibleSchedules.map((schedule, index) => {
              const isOpen = openKey === schedule._key;
              const isPendingRemove = pendingRemoveKey === schedule._key;
              const isEmpty =
                !schedule.start_date &&
                !schedule.start_time &&
                !schedule.end_time;

              const displayName = schedule.session_name?.trim() || `Session ${index + 1}`;
              const otherSessionsMissing = Math.max(0, sessionsMissingMeeting - 1);

              return (
                <SortableScheduleRow
                  key={schedule._key}
                  id={schedule._key}
                  disabled={disabled || isRecurring}
                >
                  <div
                    className={cn(
                      'transition-all',
                      !isRecurring && [
                        'border rounded-lg bg-card',
                        isOpen && 'border-primary/40 shadow-sm',
                        !isOpen && isEmpty && 'border-primary/30 bg-primary/5 hover:border-primary/40 hover:bg-primary/10',
                        !isOpen && !isEmpty && 'border-border hover:border-border/80',
                      ],
                      isRecurring && 'bg-transparent'
                    )}
                  >
                    {/* Header — ONLY show when NOT recurring */}
                    {!isRecurring && (
                      <div className="flex items-start gap-3 p-4">
                        <button
                          type="button"
                          onClick={() => toggleOpen(schedule._key)}
                          disabled={disabled}
                          className="flex-1 flex items-start gap-3 text-left cursor-pointer min-w-0"
                          aria-expanded={isOpen}
                        >
                          <div
                            className={cn(
                              'pt-0.5 shrink-0',
                              !isOpen && isEmpty ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  'text-sm truncate',
                                  !isOpen && isEmpty ? 'font-semibold text-primary' : 'font-medium text-foreground',
                                )}
                              >
                                {displayName}
                              </span>
                              {index === 0 && (
                                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                  Primary
                                </span>
                              )}
                              {!isOpen && <PlatformBadge schedule={schedule} />}
                            </div>
                            <div className="mt-1">
                              <ScheduleSummary schedule={schedule} />
                            </div>
                          </div>
                        </button>

                        {schedules.length > 1 && !isPendingRemove && (
                          <button
                            type="button"
                            onClick={() => setPendingRemoveKey(schedule._key)}
                            disabled={disabled}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                            aria-label={`Remove ${displayName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {isPendingRemove && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground mr-1">Remove?</span>
                            <button
                              type="button"
                              onClick={() => setPendingRemoveKey(null)}
                              disabled={disabled}
                              className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:bg-accent cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmRemove(schedule._key)}
                              disabled={disabled}
                              className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                            >
                              Yes
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Body — Always show if recurring, otherwise show if open */}
                    {(isOpen || isRecurring) && (
                      <div className={cn(
                        "space-y-4",
                        !isRecurring && "px-4 pb-4 pt-2 border-t border-border"
                      )}>
                        
                        {!isRecurring && (
                          <TextField
                            name={`schedule_${index}_session_name`}
                            label="Session Name"
                            placeholder="e.g., Keynote & Core Tracks"
                            value={schedule.session_name}
                            onChange={(v) => update(schedule._key, 'session_name', v)}
                            optional
                            disabled={disabled}
                          />
                        )}

                        {!isRecurring && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DateField
                              name={`schedule_${index}_start_date`}
                              label={<>Start Date <span className="text-destructive ml-1">*</span></>}
                              value={schedule.start_date}
                              onChange={(v) => update(schedule._key, 'start_date', v)}
                              disabled={disabled}
                            />
                            <DateField
                              name={`schedule_${index}_end_date`}
                              label="End Date"
                              optional
                              helper="Only for multi-day sessions."
                              value={schedule.end_date}
                              min={schedule.start_date || undefined}
                              onChange={(v) => update(schedule._key, 'end_date', v)}
                              disabled={disabled}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TimeField
                            name={`schedule_${index}_start_time`}
                            label={<>Start Time <span className="text-destructive ml-1">*</span></>}
                            value={schedule.start_time}
                            onChange={(v) => update(schedule._key, 'start_time', v)}
                            disabled={disabled}
                          />
                          <TimeField
                            name={`schedule_${index}_end_time`}
                            label={<>End Time <span className="text-destructive ml-1">*</span></>}
                            value={schedule.end_time}
                            onChange={(v) => update(schedule._key, 'end_time', v)}
                            disabled={disabled}
                          />
                        </div>

                        <TimezoneField
                          value={schedule.timezone}
                          onChange={(v) => update(schedule._key, 'timezone', v)}
                          disabled={disabled}
                        />

                        <TextField
                          name={`schedule_${index}_location`}
                          label={schedule.is_virtual ? 'Location' : 'Venue'}
                          placeholder={schedule.is_virtual ? 'e.g., Virtual on Zoom' : 'e.g., Serena Hotel, Nairobi'}
                          value={schedule.location}
                          onChange={(v) => update(schedule._key, 'location', v)}
                          optional
                          disabled={disabled}
                        />

                        <DeliveryModeSection
                          schedule={schedule}
                          index={index}
                          disabled={disabled}
                          video={video}
                          manualMode={manualMode[schedule._key] ?? false}
                          setManualMode={(on) =>
                            setManualMode((prev) => ({ ...prev, [schedule._key]: on }))
                          }
                          onToggleVirtual={(on) => requestToggleVirtual(schedule._key, on)}
                          onSelectPlatform={(platform) => requestPlatformChange(schedule._key, platform)}
                          onUpdateZoomLink={(v) => update(schedule._key, 'zoom_link', v)}
                          onUpdateMeetLink={(v) => update(schedule._key, 'meet_link', v)}
                          onClearMeeting={() =>
                            updateFields(schedule._key, { zoom_link: '', meet_link: '', video_meeting_id: null })
                          }
                          onOpenConnectModal={onOpenConnectModal}
                          isPersisted={!!eventId}
                          isMeetingActionRunning={runningSessionKey === schedule._key}
                          otherSessionsMissingMeeting={otherSessionsMissing}
                          copied={copiedSessionKey === schedule._key}
                          onCreateMeeting={() => {
                            if (schedule.platform) handleCreateMeetingForSession(schedule._key, schedule.platform);
                          }}
                          onRegenerateMeeting={() => handleRegenerateMeetingForSession(schedule._key)}
                          onDeleteMeeting={() => handleDeleteMeetingForSession(schedule._key)}
                          onCopyMeetingLink={() => {
                            const link = scheduleLink(schedule);
                            if (link) handleCopySessionLink(schedule._key, link);
                          }}
                          isRecurring={isRecurring}
                        />

                        <TextField
                          name={`schedule_${index}_max_attendees`}
                          label="Max Attendees"
                          placeholder="Leave blank to use event capacity"
                          value={schedule.max_attendees?.toString() ?? ''}
                          onChange={(v) => {
                            const n = parseInt(v, 10);
                            update(schedule._key, 'max_attendees', isNaN(n) ? null : n);
                          }}
                          optional
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </div>
                </SortableScheduleRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!isRecurring && schedules.length < MAX_SCHEDULES && (
        <Button
          type="button"
          variant="outline"
          onClick={addSchedule}
          disabled={disabled}
          className="w-full cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another session
        </Button>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <PlatformChangeConfirmDialog
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null);
        }}
        kind={pendingChange?.kind ?? 'switch-platform'}
        fromPlatform={pendingChange?.fromPlatform}
        toPlatform={pendingChange?.toPlatform}
        sessionName={pendingChange?.sessionName}
        onConfirm={() => {
          pendingChange?.apply();
          setPendingChange(null);
        }}
        onCancel={() => {
          setPendingChange(null);
        }}
      />
    </div>
  );
}