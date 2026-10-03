// components/events/attendance/SessionRosterDialog.tsx

'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Link2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { useGetSessionRosterQuery } from '@/lib/store/api/attendanceApi';
import {
  useGetUnmatchedParticipantsQuery,
  useLinkParticipantMutation,
  type UnmatchedParticipant,
} from '@/lib/store/api/videoApi';
import type {
  AttendanceStatus,
  SessionAttendanceSummary,
} from '@/lib/types/attendance';

// ============================================================
// HELPERS
// ============================================================

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function statusBadge(status: AttendanceStatus) {
  switch (status) {
    case 'full':
      return {
        label: 'Full',
        tone: 'text-primary bg-primary/10 border-primary/30',
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        tone: 'text-primary bg-primary/10 border-primary/30',
      };
    case 'partial':
      return {
        label: 'Partial',
        tone: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50',
      };
    case 'joined':
      return {
        label: 'Joined',
        tone: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/50',
      };
    case 'no-show':
      return {
        label: 'No show',
        tone: 'text-destructive bg-destructive/10 border-destructive/30',
      };
    case 'registered':
    default:
      return {
        label: 'Registered',
        tone: 'text-muted-foreground bg-muted border-border',
      };
  }
}

/**
 * Score how well a Meet display name matches an attendee's Nuruvent
 * display name. Higher is better; 0 means no signal.
 */
function matchScore(meetName: string, attendeeName: string, email: string): number {
  const a = meetName.toLowerCase().trim();
  const b = attendeeName.toLowerCase().trim();
  if (!a) return 0;
  if (a === b) return 100;

  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  const shared = aParts.filter((p) => bParts.includes(p) && p.length > 1);
  if (shared.length >= 2) return 80;
  if (shared.length === 1) return 50;

  const localPart = email.split('@')[0]?.toLowerCase() ?? '';
  if (localPart && (localPart.includes(a) || a.includes(localPart))) return 30;

  return 0;
}

// ============================================================
// PROPS
// ============================================================

export interface SessionRosterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionAttendanceSummary | null;
  videoMeetingId?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function SessionRosterDialog({
  open,
  onOpenChange,
  session,
  videoMeetingId,
}: SessionRosterDialogProps) {
  const sessionId = session?.session_id ?? '';
  const [runningLink, setRunningLink] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);

  const { data, isLoading, error } = useGetSessionRosterQuery(sessionId, {
    skip: !open || !sessionId,
  });

  const isMeetSession = session?.provider === 'google_meet';
  const canPoll = !!videoMeetingId && isMeetSession;

  const {
    data: unmatchedData,
    isLoading: unmatchedLoading,
    isFetching: unmatchedFetching,
    refetch: refetchUnmatched,
  } = useGetUnmatchedParticipantsQuery(videoMeetingId ?? '', {
    skip: !open || !canPoll,
    refetchOnMountOrArgChange: 15,
  });

  const [linkParticipant] = useLinkParticipantMutation();

  if (!session) return null;

  const rows = data?.data?.attendees ?? [];
  const unmatched: UnmatchedParticipant[] = unmatchedData?.data ?? [];

  const errorMessage = error
    ? (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load roster'
    : null;

  const handleLink = async (
    participant: UnmatchedParticipant,
    attendeeId: string,
  ) => {
    if (!videoMeetingId) return;
    setRunningLink({
      userId: participant.google_meet_user_id,
      displayName: participant.display_name || 'participant',
    });
    const t = toast.loading(
      `Linking ${participant.display_name || 'participant'}…`,
    );
    try {
      await linkParticipant({
        meetingId: videoMeetingId,
        attendeeId,
        googleMeetUserId: participant.google_meet_user_id,
      }).unwrap();
      toast.dismiss(t);
      toast.success('Participant linked');
      refetchUnmatched();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to link participant';
      toast.error(msg);
    } finally {
      setRunningLink(null);
    }
  };

  const handleCheck = () => {
    refetchUnmatched();
  };

  const isCheckingUnmatched = unmatchedLoading || unmatchedFetching;
  const isLinking = runningLink !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="break-words">
            {session.title || 'Session roster'}
          </DialogTitle>
          <DialogDescription>
            {session.registered_count} registered · {session.attended_count}{' '}
            attended
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
          {canPoll && (
            <div
              className={cn(
                'relative rounded-lg border p-3 space-y-2',
                unmatched.length > 0
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-border bg-muted/30',
              )}
            >
              {/* Blocking overlay while a link is in flight */}
              {isLinking && (
                <div className="absolute inset-0 z-10 rounded-lg bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2 shadow-md border border-border">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Linking {runningLink.displayName}…
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {unmatched.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}

                <p className="text-sm font-medium text-foreground flex-1 min-w-0">
                  {isCheckingUnmatched && unmatched.length === 0
                    ? 'Checking for unmatched participants…'
                    : unmatched.length > 0
                      ? `${unmatched.length} participant${unmatched.length !== 1 ? 's' : ''} joined but aren't linked`
                      : 'All participants are linked'}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs cursor-pointer shrink-0"
                  onClick={handleCheck}
                  disabled={isCheckingUnmatched || isLinking}
                >
                  {isCheckingUnmatched ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Check
                    </>
                  )}
                </Button>
              </div>

              {unmatched.length > 0 && (
                <div className="space-y-2">
                  {unmatched.map((u) => {
                    const ranked = [...rows]
                      .map((r) => ({
                        row: r,
                        score: matchScore(
                          u.display_name || '',
                          r.display_name || '',
                          r.email || '',
                        ),
                      }))
                      .sort((a, b) => b.score - a.score);

                    const best = ranked[0];
                    const hasStrongSuggestion = !!best && best.score >= 50;

                    const isThisRowLinking =
                      runningLink?.userId === u.google_meet_user_id;

                    return (
                      <div
                        key={u.google_meet_user_id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md bg-background/70 px-2.5 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {u.display_name || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {u.google_meet_user_id}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasStrongSuggestion ? (
                            <>
                              <Button
                                size="sm"
                                className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() =>
                                  handleLink(u, best.row.attendee_id)
                                }
                                disabled={isLinking}
                              >
                                {isThisRowLinking ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Linking…
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                                    Link to{' '}
                                    {best.row.display_name || best.row.email}
                                  </>
                                )}
                              </Button>
                              <Select
                                value=""
                                onValueChange={(attendeeId) =>
                                  handleLink(u, attendeeId)
                                }
                                disabled={isLinking}
                              >
                                <SelectTrigger className="h-8 text-xs w-[110px] cursor-pointer">
                                  <SelectValue placeholder="Different…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rows.map((r) => (
                                    <SelectItem
                                      key={r.attendee_id}
                                      value={r.attendee_id}
                                      className="cursor-pointer"
                                    >
                                      {r.display_name ||
                                        r.email ||
                                        r.attendee_id.slice(0, 8)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          ) : (
                            <Select
                              value=""
                              onValueChange={(attendeeId) =>
                                handleLink(u, attendeeId)
                              }
                              disabled={isLinking}
                            >
                              <SelectTrigger className="h-8 text-xs w-full sm:w-[190px] cursor-pointer">
                                <SelectValue
                                  placeholder={
                                    isThisRowLinking
                                      ? 'Linking…'
                                      : 'Link to attendee…'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {rows.map((r) => (
                                  <SelectItem
                                    key={r.attendee_id}
                                    value={r.attendee_id}
                                    className="cursor-pointer"
                                  >
                                    {r.display_name ||
                                      r.email ||
                                      r.attendee_id.slice(0, 8)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isCheckingUnmatched &&
                !isLinking &&
                unmatched.length === 0 &&
                rows.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Every participant in the Google Meet meeting has been
                    matched to a registered attendee. If someone is missing,
                    click{' '}
                    <span className="font-medium text-foreground">Check</span>{' '}
                    to re-poll.
                  </p>
                )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="text-center py-8 text-sm text-destructive flex flex-col items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && rows.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No attendees to show.
            </div>
          )}

          {!isLoading && !errorMessage && rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((r) => {
                const badge = statusBadge(r.effective_status);
                return (
                  <div
                    key={r.attendee_id}
                    className="rounded-lg border border-border bg-background/70 p-3 flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {r.display_name || 'Unknown attendee'}
                      </p>

                      {r.email ? (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          {r.email}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic truncate">
                          No email on file
                        </p>
                      )}

                      {r.phone && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {r.phone}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                        {formatDuration(r.total_duration_seconds)}
                      </span>
                      {r.is_host && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30"
                        >
                          Host
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={cn('text-xs', badge.tone)}
                      >
                        {badge.label}
                      </Badge>
                      {r.host_confirmed && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-primary border-primary/30 bg-primary/10"
                        >
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}