/* eslint-disable react-hooks/set-state-in-effect */
// components/events/video/AddMeetingDialog.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, Clock, Loader2, Plus, Video } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';

import type { PlatformMeta } from './PlatformPickerModal';

export interface AddMeetingFormValues {
  session_name: string;
  start_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  platform: VideoPlatform;
}

interface AddMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: PlatformMeta[];
  saving: boolean;
  onSave: (values: AddMeetingFormValues) => void;
  defaultTimezone?: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddMeetingDialog({
  open,
  onOpenChange,
  platforms,
  saving,
  onSave,
  defaultTimezone = 'Africa/Nairobi',
}: AddMeetingDialogProps) {
  const [sessionName, setSessionName] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  // No default. The host must explicitly pick a platform.
  const [platform, setPlatform] = useState<VideoPlatform | ''>('');
  // Track whether the host has touched the platform field. Used to
  // show a validation hint only after they have attempted to submit.
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Reset when the dialog opens.
  useEffect(() => {
    if (!open) return;
    setSessionName('');
    setStartDate(todayISO());
    setStartTime('09:00');
    setEndTime('10:00');
    setPlatform('');
    setAttemptedSubmit(false);
  }, [open]);

  const sessionNameOk = sessionName.trim().length > 0;
  const startDateOk = startDate.length > 0;
  const startTimeOk = startTime.length > 0;
  const endTimeOk = endTime.length > 0;
  const platformOk = platform !== '';

  const canSave =
    sessionNameOk && startDateOk && startTimeOk && endTimeOk && platformOk;

  const handleSave = () => {
    setAttemptedSubmit(true);
    if (!canSave || !platform) return;
    onSave({
      session_name: sessionName.trim(),
      start_date: startDate,
      start_time: startTime,
      end_time: endTime,
      timezone: defaultTimezone,
      platform,
    });
  };

  const onlyOnePlatform = platforms.length === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
            <Video className="h-5 w-5 text-primary shrink-0" />
            Add meeting
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Choose a platform, then describe the session. We&apos;ll create
            the meeting for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ============================================================
              PLATFORM — first decision, at the top
              ============================================================ */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">
                Platform
              </Label>
              <span className="text-destructive text-xs">*</span>
            </div>

            {onlyOnePlatform ? (
              <button
                type="button"
                onClick={() => setPlatform(platforms[0].platform)}
                disabled={saving}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer',
                  platform === platforms[0].platform
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
                    platform === platforms[0].platform
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background',
                  )}
                >
                  {platform === platforms[0].platform && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {platforms.map((p) => {
                  const isActive = platform === p.platform;
                  return (
                    <button
                      key={p.platform}
                      type="button"
                      onClick={() => setPlatform(p.platform)}
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

            {attemptedSubmit && !platformOk && (
              <p className="text-xs text-destructive">
                Choose a platform to continue.
              </p>
            )}
          </div>

          {/* ============================================================
              SESSION DETAILS — after the platform is chosen
              ============================================================ */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-meeting-name" className="text-sm">
                Session name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-meeting-name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Advanced Chess Rules"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="add-meeting-date" className="text-sm">
                  <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-meeting-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-meeting-start" className="text-sm">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-meeting-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-meeting-end" className="text-sm">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  End <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-meeting-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
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
            disabled={saving}
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
                Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {platformOk
                  ? `Create on ${platforms.find((p) => p.platform === platform)?.label ?? ''}`
                  : 'Create meeting'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}