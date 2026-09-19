// components/events/fields/ScheduleField.tsx

'use client';

import { useMemo, useState } from 'react';
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
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

// ============================================================
// SCHEDULE FIELD (events)
// ============================================================

interface SchedulesFieldProps extends FieldBaseProps {
  value: ScheduleForm[];
  onChange: (value: ScheduleForm[]) => void;
}

const MAX_SCHEDULES = 20;

export function SchedulesField({
  value,
  onChange,
  error,
  disabled,
  id,
}: SchedulesFieldProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);

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

                {/* Remove button */}
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

                {/* Inline remove confirmation */}
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
                  {/* Session identity */}
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

                  {/* Dates */}
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

                  {/* Times */}
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

                  {/* Timezone */}
                  <TimezoneField
                    value={schedule.timezone}
                    onChange={(v) => update(schedule._key, 'timezone', v)}
                    disabled={disabled}
                  />

                  {/* Location */}
                  <TextField
                    name={`schedule_${index}_location`}
                    label="Location"
                    placeholder="e.g., Main Auditorium, Nairobi"
                    value={schedule.location}
                    onChange={(v) => update(schedule._key, 'location', v)}
                    optional
                    disabled={disabled}
                  />

                  {/* Virtual subsection */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted">
                      <div>
                        <Label className="text-sm font-medium text-foreground">
                          Virtual session
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Overrides the event-level setting for this session.
                        </p>
                      </div>
                      <Switch
                        checked={schedule.is_virtual}
                        onCheckedChange={(c) =>
                          update(schedule._key, 'is_virtual', c)
                        }
                        disabled={disabled}
                        className="cursor-pointer"
                      />
                    </div>

                    {schedule.is_virtual && (
                      <div className="p-3 space-y-3 bg-background border-t border-border">
                        <TextField
                          name={`schedule_${index}_zoom_link`}
                          label="Zoom Link"
                          placeholder="https://zoom.us/..."
                          value={schedule.zoom_link}
                          onChange={(v) =>
                            update(schedule._key, 'zoom_link', v)
                          }
                          optional
                          disabled={disabled}
                          type="url"
                        />
                        <TextField
                          name={`schedule_${index}_meet_link`}
                          label="Google Meet Link"
                          placeholder="https://meet.google.com/..."
                          value={schedule.meet_link}
                          onChange={(v) =>
                            update(schedule._key, 'meet_link', v)
                          }
                          optional
                          disabled={disabled}
                          type="url"
                        />
                      </div>
                    )}
                  </div>

                  {/* Max attendees */}
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

      {/* Add button */}
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

      {/* Top-level error */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}