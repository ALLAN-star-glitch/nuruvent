// components/events/fields/ScheduleField.tsx

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Link2,
  Pencil,
  Plug,
  Plus,
  Sparkles,
  Trash2,
  Video,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

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

// ============================================================
// SCHEDULE FIELD (events)
// ============================================================

interface SchedulesFieldProps extends FieldBaseProps {
  value: ScheduleForm[];
  onChange: (value: ScheduleForm[]) => void;
  /** Called when the host wants to open the platform picker. */
  onOpenConnectModal?: () => void;
}

const MAX_SCHEDULES = 20;

export function SchedulesField({
  value,
  onChange,
  error,
  disabled,
  id,
  onOpenConnectModal,
}: SchedulesFieldProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState<Record<string, boolean>>({});

  const video = useVideoConnection();

  const schedules = useMemo(
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
    next.session_number = schedules.length + 1;

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

          return (
            <div
              key={schedule._key}
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
                    <div className="flex items-center gap-2">
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
                          <span className="text-destructive ml-1">*</span>
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
                          <span className="text-destructive ml-1">*</span>
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
                          <span className="text-destructive ml-1">*</span>
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
                    onChange={(v) => update(schedule._key, 'timezone', v)}
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
                      setManualMode((prev) => ({
                        ...prev,
                        [schedule._key]: on,
                      }))
                    }
                    onToggleVirtual={(on) =>
                      updateFields(schedule._key, {
                        is_virtual: on,
                        ...(on ? {} : { zoom_link: '', meet_link: '' }),
                      })
                    }
                    onUpdateZoomLink={(v) =>
                      update(schedule._key, 'zoom_link', v)
                    }
                    onUpdateMeetLink={(v) =>
                      update(schedule._key, 'meet_link', v)
                    }
                    onOpenConnectModal={onOpenConnectModal}
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
          );
        })}
      </div>

      {schedules.length < MAX_SCHEDULES && (
        <Button
          type="button"
          variant="outline"
          onClick={addSchedule}
          disabled={disabled}
          className="w-full cursor-pointer bg-primary-50"
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
  onUpdateZoomLink: (v: string) => void;
  onUpdateMeetLink: (v: string) => void;
  onOpenConnectModal?: () => void;
}

function DeliveryModeSection({
  schedule,
  index,
  disabled,
  video,
  manualMode,
  setManualMode,
  onToggleVirtual,
  onUpdateZoomLink,
  onUpdateMeetLink,
  onOpenConnectModal,
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
          onUpdateZoomLink={onUpdateZoomLink}
          onUpdateMeetLink={onUpdateMeetLink}
          onOpenConnectModal={onOpenConnectModal}
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
  onUpdateZoomLink: (v: string) => void;
  onUpdateMeetLink: (v: string) => void;
  onOpenConnectModal?: () => void;
}

function DeliveryModeContent({
  schedule,
  index,
  disabled,
  video,
  manualMode,
  setManualMode,
  onUpdateZoomLink,
  onUpdateMeetLink,
  onOpenConnectModal,
}: DeliveryModeContentProps) {
  const hasLink = !!(schedule.zoom_link?.trim() || schedule.meet_link?.trim());
  const showManual = manualMode || hasLink;

  const connectedPlatform: PlatformMeta | undefined = PLATFORMS.find(
    (p) => p.available && !!video.getConnection(p.platform),
  );
  const anyConnected = !!connectedPlatform;

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
        }}
      />
    );
  }

  if (anyConnected && connectedPlatform) {
    const connection = video.getConnection(connectedPlatform.platform);
    return (
      <ConnectedState
        platform={connectedPlatform}
        email={connection?.external_email ?? ''}
        disabled={disabled}
        onUseManual={() => setManualMode(true)}
        onOpenConnectModal={onOpenConnectModal}
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
//
// Two rows — Zoom and Google Meet — each with the platform logo next
// to its input. Only these two are persisted by the backend
// (`ScheduleInput.zoom_link` / `.meet_link`).

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
          <p className="text-sm font-semibold text-foreground">
            Manual link
          </p>
          <p className="text-xs text-muted-foreground">
            Attendance won&apos;t be tracked automatically for this session.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Zoom */}
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

        {/* Google Meet */}
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
  platform,
  email,
  disabled,
  onUseManual,
  onOpenConnectModal,
}: {
  platform: PlatformMeta;
  email: string;
  disabled?: boolean;
  onUseManual: () => void;
  onOpenConnectModal?: () => void;
}) {
  return (
    <div className="p-4 border-t border-border bg-primary/5">
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
            Meeting will be created automatically
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Using your {platform.label} account{' '}
            {email && (
              <span className="font-medium text-foreground">{email}</span>
            )}
            . The join link appears here when you publish.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUseManual}
          disabled={disabled}
          className={cn(
            'cursor-pointer font-semibold h-9',
            'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
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
            className={cn(
              'cursor-pointer font-semibold h-9',
              'border-primary/40 text-primary hover:bg-primary/5 hover:border-primary',
            )}
          >
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            Manage connection
          </Button>
        )}
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
            'text-primary-500 hover:bg-primary-500 hover:text-primary-50',
            'font-semibold',
          )}
        >
          <Link2 className=" h-4 w-4 mr-2" />
          Paste a link manually
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}