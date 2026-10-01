/* eslint-disable react-hooks/set-state-in-effect */
// components/meeting/EditMeetingDialog.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, Edit, Loader2, MapPin, Video } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Schedule, VideoPlatform } from '@/lib/types/events';

import {
  PLATFORMS,
  type PlatformMeta,
} from '@/components/events/video/PlatformPickerModal';
import {
  PlatformChangeConfirmDialog,
  type PlatformChangeKind,
} from '@/components/events/video/PlatformChangeConfirmDialog';

// ============================================================
// TYPES
// ============================================================

export interface EditMeetingFormValues {
  session_name: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_virtual: boolean;
  platform?: VideoPlatform;
  location: string;
}

interface EditMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | undefined;
  saving: boolean;
  platforms: PlatformMeta[];
  onSave: (values: EditMeetingFormValues) => void;
}

// ============================================================
// DIALOG
// ============================================================

export function EditMeetingDialog({
  open,
  onOpenChange,
  schedule,
  saving,
  platforms,
  onSave,
}: EditMeetingDialogProps) {
  const [form, setForm] = useState<EditMeetingFormValues>({
    session_name: '',
    start_date: '',
    end_date: undefined,
    start_time: '',
    end_time: '',
    timezone: 'Africa/Nairobi',
    is_virtual: true,
    platform: undefined,
    location: '',
  });

  const [pendingConfirm, setPendingConfirm] = useState<{
    kind: PlatformChangeKind;
    fromPlatform?: VideoPlatform;
    toPlatform?: VideoPlatform;
    values: EditMeetingFormValues;
  } | null>(null);

  useEffect(() => {
    if (!open || !schedule) return;

    const scheduledPlatform = schedule.platform as VideoPlatform | undefined;

    setForm({
      session_name: schedule.session_name ?? '',
      start_date: schedule.start_date ?? '',
      end_date: schedule.end_date,
      start_time: schedule.start_time?.slice(0, 5) ?? '',
      end_time: schedule.end_time?.slice(0, 5) ?? '',
      timezone: schedule.timezone ?? 'Africa/Nairobi',
      is_virtual: schedule.is_virtual,
      platform:
        scheduledPlatform &&
        platforms.some((p) => p.platform === scheduledPlatform)
          ? scheduledPlatform
          : undefined,
      location: schedule.location ?? '',
    });
    setPendingConfirm(null);
  }, [open, schedule, platforms]);

  const isVirtual = form.is_virtual;
  const platformRequired = isVirtual && platforms.length > 0;
  const platformOk = !platformRequired || !!form.platform;

  const sessionNameOk = form.session_name.trim().length > 0;
  const startDateOk = form.start_date.length > 0;
  const startTimeOk = form.start_time.length > 0;
  const endTimeOk = form.end_time.length > 0;

  const canSave =
    sessionNameOk &&
    startDateOk &&
    startTimeOk &&
    endTimeOk &&
    platformOk &&
    !saving;

  const handleSave = () => {
    if (!canSave) return;

    // Determine whether this save would destroy an existing meeting.
    const normalized: EditMeetingFormValues = {
      ...form,
      session_name: form.session_name.trim(),
      location: form.location.trim(),
    };

    const hasMeeting = !!schedule?.video_meeting_id;
    const wasVirtual = !!schedule?.is_virtual;
    const wasPlatform = schedule?.platform as VideoPlatform | undefined;
    const willBeVirtual = normalized.is_virtual;
    const willPlatform = normalized.platform;

    const switchingPlatform =
      hasMeeting &&
      wasVirtual &&
      willBeVirtual &&
      wasPlatform !== undefined &&
      willPlatform !== undefined &&
      wasPlatform !== willPlatform;

    const goingInPerson = hasMeeting && wasVirtual && !willBeVirtual;

    if (switchingPlatform || goingInPerson) {
      setPendingConfirm({
        kind: switchingPlatform ? 'switch-platform' : 'go-in-person',
        fromPlatform: wasPlatform,
        toPlatform: willPlatform,
        values: normalized,
      });
      return;
    }

    onSave(normalized);
  };

  const handleToggleVirtual = (on: boolean) => {
    setForm((f) => ({
      ...f,
      is_virtual: on,
      platform: on ? f.platform : undefined,
    }));
  };

  const onlyOnePlatform = platforms.length === 1;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
              <Edit className="h-5 w-5 text-primary shrink-0" />
              Update session
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Change the session&apos;s delivery mode, time, and meeting
              platform. Existing attendees keep the same Nuruvent link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {/* SESSION NAME */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-session-name" className="text-sm">
                Session name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-session-name"
                value={form.session_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, session_name: e.target.value }))
                }
                placeholder="e.g., Advanced Chess Rules"
                disabled={saving}
              />
            </div>

            {/* DATE + TIME */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-start-date" className="text-sm">
                  Start date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_date: e.target.value }))
                  }
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-start-time" className="text-sm">
                    Start time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_time: e.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-end-time" className="text-sm">
                    End time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_time: e.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* TIMEZONE */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-timezone" className="text-sm">
                Timezone
              </Label>
              <Select
                value={form.timezone}
                onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
                disabled={saving}
              >
                <SelectTrigger id="edit-timezone">
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

            {/* DELIVERY MODE */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isVirtual
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isVirtual ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground">
                      {isVirtual ? 'Virtual session' : 'In-person session'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isVirtual
                        ? 'Hosted on a video platform.'
                        : 'Takes place at a physical location.'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isVirtual}
                  onCheckedChange={handleToggleVirtual}
                  disabled={saving}
                  className="cursor-pointer"
                  aria-label="Toggle virtual session"
                />
              </div>

              {isVirtual && (
                <div className="p-4 border-t border-border space-y-3 bg-background">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Video platform
                    </Label>
                    {platformRequired && (
                      <span className="text-destructive text-xs">*</span>
                    )}
                  </div>

                  {platforms.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Connect a Zoom or Google Meet account first, then come
                      back to pick a platform.
                    </p>
                  ) : onlyOnePlatform ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          platform: platforms[0].platform,
                        }))
                      }
                      disabled={saving}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer',
                        form.platform === platforms[0].platform
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5',
                      )}
                    >
                      <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center p-1 shrink-0">
                        <Image
                          src={platforms[0].logo}
                          alt={`${platforms[0].label} logo`}
                          width={28}
                          height={28}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {platforms[0].label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your only connected platform.
                        </p>
                      </div>
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                          form.platform === platforms[0].platform
                            ? 'border-primary bg-primary'
                            : 'border-border bg-background',
                        )}
                      >
                        {form.platform === platforms[0].platform && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {platforms.map((p) => {
                        const isActive = form.platform === p.platform;
                        return (
                          <button
                            key={p.platform}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({ ...f, platform: p.platform }))
                            }
                            disabled={saving}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer',
                              isActive
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                                : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5',
                            )}
                          >
                            <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center p-1 shrink-0">
                              <Image
                                src={p.logo}
                                alt={`${p.label} logo`}
                                width={28}
                                height={28}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                              {p.label}
                            </p>
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
                  )}

                  {platformRequired && !platformOk && (
                    <p className="text-xs text-destructive">
                      Choose a platform to continue.
                    </p>
                  )}
                </div>
              )}

              {!isVirtual && (
                <div className="p-4 border-t border-border space-y-1.5 bg-background">
                  <Label htmlFor="edit-location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="e.g., Serena Hotel, Nairobi"
                    disabled={saving}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'w-full sm:w-auto cursor-pointer',
                canSave
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation fires before onSave when the save is destructive */}
      <PlatformChangeConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={(o) => {
          if (!o) setPendingConfirm(null);
        }}
        kind={pendingConfirm?.kind ?? 'switch-platform'}
        fromPlatform={pendingConfirm?.fromPlatform}
        toPlatform={pendingConfirm?.toPlatform}
        sessionName={pendingConfirm?.values.session_name}
        onConfirm={() => {
          if (pendingConfirm) onSave(pendingConfirm.values);
          setPendingConfirm(null);
        }}
        onCancel={() => setPendingConfirm(null)}
      />
    </>
  );
}