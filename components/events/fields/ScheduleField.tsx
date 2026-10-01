// components/events/fields/ScheduleField.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Link2,
  Loader2,
  Pencil,
  Plug,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Video,
  X,
} from 'lucide-react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

import { ScheduleSummary } from './ScheduleSummary';
import { makeEmptySchedule, type ScheduleForm } from '../types';
import { useVideoConnection } from '../video/useVideoConnection';
import { PLATFORMS, type PlatformMeta } from '../video/PlatformPickerModal';
import {
  PlatformChangeConfirmDialog,
  type PlatformChangeKind,
} from '../video/PlatformChangeConfirmDialog';

// ============================================================
// HELPERS
// ============================================================

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function scheduleLink(s: ScheduleForm): string | undefined {
  return s.zoom_link || s.meet_link || undefined;
}

function resolvePlatformMeta(schedule: ScheduleForm): PlatformMeta | undefined {
  if (schedule.platform) {
    return PLATFORMS.find((p) => p.platform === schedule.platform);
  }
  if (schedule.zoom_link) {
    return PLATFORMS.find((p) => p.platform === 'zoom');
  }
  if (schedule.meet_link) {
    return PLATFORMS.find((p) => p.platform === 'google_meet');
  }
  return undefined;
}

function PlatformBadge({ schedule }: { schedule: ScheduleForm }) {
  if (!schedule.is_virtual) return null;

  const meta = resolvePlatformMeta(schedule);
  if (!meta) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 shrink-0',
        'rounded-md border border-border bg-background',
        'px-1.5 py-0.5',
      )}
      title={meta.label}
      aria-label={`Video platform: ${meta.label}`}
    >
      <span className="relative h-3.5 w-3.5 shrink-0">
        <Image
          src={meta.logo}
          alt=""
          fill
          sizes="14px"
          className="object-contain"
        />
      </span>
      <span className="text-[10px] font-medium text-muted-foreground leading-none">
        {meta.label}
      </span>
    </span>
  );
}

// ============================================================
// SORTABLE ROW WRAPPER
// ============================================================

function SortableScheduleRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          className={cn(
            'shrink-0 w-6 flex items-center justify-center',
            'text-muted-foreground hover:text-foreground',
            'cursor-grab active:cursor-grabbing',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// SCHEDULE FIELD
// ============================================================

interface SchedulesFieldProps extends FieldBaseProps {
  value: ScheduleForm[];
  onChange: (value: ScheduleForm[]) => void;
  onOpenConnectModal?: () => void;
  eventId?: string;
  onMeetingChanged?: () => void;
  onSchedulesCommitted?: (next: ScheduleForm[]) => void;
}

const MAX_SCHEDULES = 20;

/** Payload for a pending platform-change confirmation. */
interface PendingPlatformChange {
  key: string;
  kind: PlatformChangeKind;
  fromPlatform?: VideoPlatform;
  toPlatform?: VideoPlatform;
  sessionName?: string;
  /** Applied on confirm. Cancel is a no-op. */
  apply: () => void;
}

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
}: SchedulesFieldProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState<Record<string, boolean>>({});

  const [runningSessionKey, setRunningSessionKey] = useState<string | null>(
    null,
  );
  const [copiedSessionKey, setCopiedSessionKey] = useState<string | null>(null);

  const [pendingChange, setPendingChange] =
    useState<PendingPlatformChange | null>(null);

  const video = useVideoConnection();

  const [createEventMeeting] = useCreateEventMeetingMutation();
  const [deleteEventMeeting] = useDeleteEventMeetingMutation();
  const [regenerateEventMeeting] = useRegenerateEventMeetingMutation();
  const [reorderSchedules] = useReorderSchedulesMutation();

  const schedules: ScheduleForm[] = useMemo(
    () => (value.length > 0 ? value : [makeEmptySchedule()]),
    [value],
  );

  const update = <K extends keyof ScheduleForm>(
    key: string,
    field: K,
    v: ScheduleForm[K],
  ) => {
    onChange(
      schedules.map((s) => (s._key === key ? { ...s, [field]: v } : s)),
    );
  };

  const updateFields = (key: string, patch: Partial<ScheduleForm>) => {
    onChange(
      schedules.map((s) => (s._key === key ? { ...s, ...patch } : s)),
    );
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
  // PLATFORM CHANGE HANDLING (with confirmation)
  // ============================================================

  /**
   * Apply a platform change to a schedule. Clears the other platform's
   * link and drops the stale meeting id (Fix from earlier).
   */
  const applyPlatformChange = (
    key: string,
    nextPlatform: VideoPlatform | undefined,
  ) => {
    const s = schedules.find((x) => x._key === key);
    if (!s) return;

    const patch: Partial<ScheduleForm> = {
      platform: nextPlatform ?? undefined,
      zoom_link: nextPlatform === 'zoom' ? s.zoom_link : '',
      meet_link: nextPlatform === 'google_meet' ? s.meet_link : '',
      video_meeting_id: null,
    };
    updateFields(key, patch);
  };

  /**
   * Called when a platform tile is clicked. Decides whether to show a
   * confirmation dialog or apply the change directly.
   *
   * Confirmation is only shown when the session ALREADY has a meeting
   * AND the platform is genuinely changing. Everything else is a
   * straightforward state update.
   */
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

  /**
   * Called when the user toggles a session from virtual to in-person.
   * Confirms when there's a meeting to lose.
   */
  const requestToggleVirtual = (key: string, on: boolean) => {
    const s = schedules.find((x) => x._key === key);
    if (!s) return;

    if (on) {
      // Going virtual — no meeting exists yet (or it was already
      // present). Nothing destructive; apply directly.
      updateFields(key, { is_virtual: true });
      return;
    }

    // Going in-person.
    const hasMeeting = !!s.video_meeting_id;
    if (!hasMeeting) {
      applyToggleToInPerson(key);
      return;
    }

    setPendingChange({
      key,
      kind: 'go-in-person',
      fromPlatform: s.platform ?? undefined,
      sessionName: s.session_name?.trim() || undefined,
      apply: () => applyToggleToInPerson(key),
    });
  };

  const applyToggleToInPerson = (key: string) => {
    updateFields(key, {
      is_virtual: false,
      platform: undefined,
      zoom_link: '',
      meet_link: '',
      video_meeting_id: null,
    });
  };

  // ============================================================
  // DRAG-AND-DROP
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
  // MEETING ACTION HANDLERS
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

  const handleRegenerateMeetingForSession = async (sessionKey: string) => {
    if (!eventId) return;
    setRunningSessionKey(sessionKey);
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

  const handleDeleteMeetingForSession = async (sessionKey: string) => {
    if (!eventId) return;
    setRunningSessionKey(sessionKey);
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
    <div id={fieldId('schedules', id)} className="space-y-3">
      {/* Section header */}
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

      {/* Rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={schedules.map((s) => s._key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {schedules.map((schedule, index) => {
              const isOpen = openKey === schedule._key;
              const isPendingRemove = pendingRemoveKey === schedule._key;
              const isEmpty =
                !schedule.start_date &&
                !schedule.start_time &&
                !schedule.end_time;

              const displayName =
                schedule.session_name?.trim() || `Session ${index + 1}`;

              const otherSessionsMissing = Math.max(
                0,
                sessionsMissingMeeting - 1,
              );

              return (
                <SortableScheduleRow
                  key={schedule._key}
                  id={schedule._key}
                  disabled={disabled}
                >
                  <div
                    className={cn(
                      'border rounded-lg bg-card transition-all',
                      isOpen && 'border-primary/40 shadow-sm',
                      !isOpen &&
                        isEmpty &&
                        'border-primary/30 bg-primary/5 hover:border-primary/40 hover:bg-primary/10',
                      !isOpen &&
                        !isEmpty &&
                        'border-border hover:border-border/80',
                    )}
                  >
                    {/* Header */}
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
                            !isOpen && isEmpty
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        >
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                'text-sm truncate',
                                !isOpen && isEmpty
                                  ? 'font-semibold text-primary'
                                  : 'font-medium text-foreground',
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
                          <span className="text-xs text-muted-foreground mr-1">
                            Remove?
                          </span>
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

                    {/* Body */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <TextField
                              name={`schedule_${index}_session_name`}
                              label="Session Name"
                              placeholder="e.g., Keynote & Core Tracks"
                              value={schedule.session_name}
                              onChange={(v) =>
                                update(schedule._key, 'session_name', v)
                              }
                              optional
                              disabled={disabled}
                            />
                          </div>
                          <TextField
                            name={`schedule_${index}_session_number`}
                            label="Session #"
                            placeholder={String(index + 1)}
                            value={schedule.session_number?.toString() ?? ''}
                            onChange={(v) => {
                              const n = parseInt(v, 10);
                              update(
                                schedule._key,
                                'session_number',
                                isNaN(n) ? null : n,
                              );
                            }}
                            optional
                            disabled={disabled}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DateField
                            name={`schedule_${index}_start_date`}
                            label={
                              <>
                                Start Date{' '}
                                <span className="text-destructive ml-1">
                                  *
                                </span>
                              </>
                            }
                            value={schedule.start_date}
                            onChange={(v) =>
                              update(schedule._key, 'start_date', v)
                            }
                            disabled={disabled}
                          />
                          <DateField
                            name={`schedule_${index}_end_date`}
                            label="End Date"
                            optional
                            helper="Only for multi-day sessions."
                            value={schedule.end_date}
                            min={schedule.start_date || undefined}
                            onChange={(v) =>
                              update(schedule._key, 'end_date', v)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TimeField
                            name={`schedule_${index}_start_time`}
                            label={
                              <>
                                Start Time{' '}
                                <span className="text-destructive ml-1">
                                  *
                                </span>
                              </>
                            }
                            value={schedule.start_time}
                            onChange={(v) =>
                              update(schedule._key, 'start_time', v)
                            }
                            disabled={disabled}
                          />
                          <TimeField
                            name={`schedule_${index}_end_time`}
                            label={
                              <>
                                End Time{' '}
                                <span className="text-destructive ml-1">
                                  *
                                </span>
                              </>
                            }
                            value={schedule.end_time}
                            onChange={(v) =>
                              update(schedule._key, 'end_time', v)
                            }
                            disabled={disabled}
                          />
                        </div>

                        <TimezoneField
                          value={schedule.timezone}
                          onChange={(v) =>
                            update(schedule._key, 'timezone', v)
                          }
                          disabled={disabled}
                        />

                        <TextField
                          name={`schedule_${index}_location`}
                          label={schedule.is_virtual ? 'Location' : 'Venue'}
                          placeholder={
                            schedule.is_virtual
                              ? 'e.g., Virtual on Zoom'
                              : 'e.g., Serena Hotel, Nairobi'
                          }
                          value={schedule.location}
                          onChange={(v) =>
                            update(schedule._key, 'location', v)
                          }
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
                            setManualMode((prev) => ({
                              ...prev,
                              [schedule._key]: on,
                            }))
                          }
                          onToggleVirtual={(on) =>
                            requestToggleVirtual(schedule._key, on)
                          }
                          onSelectPlatform={(platform) =>
                            requestPlatformChange(schedule._key, platform)
                          }
                          onUpdateZoomLink={(v) =>
                            update(schedule._key, 'zoom_link', v)
                          }
                          onUpdateMeetLink={(v) =>
                            update(schedule._key, 'meet_link', v)
                          }
                          onClearMeeting={() =>
                            updateFields(schedule._key, {
                              zoom_link: '',
                              meet_link: '',
                              video_meeting_id: null,
                            })
                          }
                          onOpenConnectModal={onOpenConnectModal}
                          isPersisted={!!eventId}
                          isMeetingActionRunning={
                            runningSessionKey === schedule._key
                          }
                          otherSessionsMissingMeeting={otherSessionsMissing}
                          copied={copiedSessionKey === schedule._key}
                          onCreateMeeting={() => {
                            if (schedule.platform) {
                              handleCreateMeetingForSession(
                                schedule._key,
                                schedule.platform,
                              );
                            }
                          }}
                          onRegenerateMeeting={() =>
                            handleRegenerateMeetingForSession(schedule._key)
                          }
                          onDeleteMeeting={() =>
                            handleDeleteMeetingForSession(schedule._key)
                          }
                          onCopyMeetingLink={() => {
                            const link = scheduleLink(schedule);
                            if (link)
                              handleCopySessionLink(schedule._key, link);
                          }}
                        />

                        <TextField
                          name={`schedule_${index}_max_attendees`}
                          label="Max Attendees"
                          placeholder="Leave blank to use event capacity"
                          value={schedule.max_attendees?.toString() ?? ''}
                          onChange={(v) => {
                            const n = parseInt(v, 10);
                            update(
                              schedule._key,
                              'max_attendees',
                              isNaN(n) ? null : n,
                            );
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

      {schedules.length < MAX_SCHEDULES && (
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

      {/* Platform change confirmation */}
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

// ============================================================
// DELIVERY MODE SECTION
// ============================================================

interface DeliveryModeSectionProps {
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
}

function DeliveryModeSection({
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
}: DeliveryModeSectionProps) {
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
        />
      )}
    </div>
  );
}

interface DeliveryModeContentProps {
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
}

function DeliveryModeContent({
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
}: DeliveryModeContentProps) {
  const hasLink = !!(schedule.zoom_link?.trim() || schedule.meet_link?.trim());
  const hasMeeting = !!schedule.video_meeting_id;
  const showManual = manualMode || (hasLink && !hasMeeting);

  const connectedPlatforms: PlatformMeta[] = PLATFORMS.filter(
    (p) => p.available && !!video.getConnection(p.platform),
  );
  const anyConnected = connectedPlatforms.length > 0;

  const selectedPlatform: PlatformMeta | undefined = schedule.platform
    ? connectedPlatforms.find((p) => p.platform === schedule.platform)
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

// ============================================================
// STATE 1 — Manual link
// ============================================================

function ManualLinkState({
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

// ============================================================
// STATE 2 — Connected
// ============================================================

function ConnectedState({
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

// ============================================================
// MEETING ACTIONS INLINE
// ============================================================

function MeetingActionsInline({
  meetingLink,
  platform,
  isPersisted,
  hasMeeting,
  canCreateMeeting,
  isRunning,
  otherSessionsMissingMeeting,
  onCreate,
  onRegenerate,
  onDelete,
  onCopy,
  copied,
  disabled,
}: {
  meetingLink?: string;
  platform?: PlatformMeta;
  isPersisted: boolean;
  hasMeeting: boolean;
  canCreateMeeting: boolean;
  isRunning: boolean;
  otherSessionsMissingMeeting: number;
  onCreate: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
  disabled?: boolean;
}) {
  if (!isPersisted) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          Save the event first, then you can create and manage meetings
          for each session.
        </p>
      </div>
    );
  }

  if (hasMeeting && meetingLink) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">
            Meeting link
            {platform && (
              <span className="text-muted-foreground font-normal ml-1">
                · {platform.label}
              </span>
            )}
          </p>
          <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs font-mono text-foreground/80 truncate flex-1 min-w-0">
              {meetingLink}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() =>
              window.open(meetingLink, '_blank', 'noopener,noreferrer')
            }
            disabled={disabled || isRunning}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Join
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={onCopy}
            disabled={disabled || isRunning}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={onRegenerate}
            disabled={disabled || isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Working…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Regenerate
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onDelete}
            disabled={disabled || isRunning}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  if (otherSessionsMissingMeeting > 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          This session and {otherSessionsMissingMeeting} other
          {otherSessionsMissingMeeting === 1 ? '' : 's'} have no meeting
          yet. Create them all from the event page after saving, or open
          the detail view.
        </p>
      </div>
    );
  }

  if (!canCreateMeeting) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          Pick a video platform above to create a meeting for this
          session.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        No meeting yet. It will be created automatically when you publish,
        or you can create it now.
      </p>
      <Button
        size="sm"
        className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={onCreate}
        disabled={disabled || isRunning}
      >
        {isRunning ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Creating…
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Create meeting now
          </>
        )}
      </Button>
    </div>
  );
}

function SinglePlatformHeader({
  platform,
  connection,
  hasMeeting,
  isSelected,
}: {
  platform: PlatformMeta;
  connection: { external_email?: string } | undefined | null;
  hasMeeting: boolean;
  isSelected: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center p-1.5 shrink-0">
        <Image
          src={platform.logo}
          alt={`${platform.label} logo`}
          width={32}
          height={32}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-foreground">
          {hasMeeting
            ? 'Meeting is linked'
            : isSelected
              ? 'Meeting will be created automatically'
              : `Use ${platform.label} for this session`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Using your {platform.label} account
          {connection?.external_email && (
            <>
              {' '}
              <span className="font-medium text-foreground">
                {connection.external_email}
              </span>
            </>
          )}
          .{' '}
          {hasMeeting
            ? 'Changes to this session update the meeting — the join link stays the same.'
            : isSelected
              ? 'The join link appears here when you publish.'
              : 'Select it above to enable meeting creation.'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STATE 3 — Not connected
// ============================================================

function NotConnectedState({
  disabled,
  onConnect,
  onUseManual,
}: {
  disabled?: boolean;
  onConnect: () => void;
  onUseManual: () => void;
}) {
  return (
    <div className="p-4 border-t border-border bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm">
          <Plug className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">
            Connect a video platform to create this meeting automatically
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll create a meeting on your connected account and track
            attendance for you. Takes 30 seconds.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
        <Button
          type="button"
          size="lg"
          onClick={onConnect}
          disabled={disabled}
          className={cn(
            'cursor-pointer w-full sm:w-auto',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'font-semibold shadow-sm',
          )}
        >
          <Plug className="h-4 w-4 mr-2" />
          Connect platform
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onUseManual}
          disabled={disabled}
          className={cn(
            'cursor-pointer w-full sm:w-auto',
            'border-border bg-background/80 backdrop-blur',
            'text-foreground hover:bg-background',
            'font-semibold',
          )}
        >
          <Link2 className="h-4 w-4 mr-2" />
          Paste a link manually
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}