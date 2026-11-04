// components/events/video/MeetingCard.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Edit,
  ExternalLink,
  Link2,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Plug,
  RefreshCw,
  Send,
  Trash2,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Event, Schedule } from '@/lib/types/events';
import {
  nuruventMeetingUrl,
  schedulePlatform,
} from '@/lib/utils/meetingUrl';

import { PLATFORMS, type PlatformMeta } from './PlatformPickerModal';

// ============================================================
// TYPES
// ============================================================

export interface MeetingCardProps {
  event: Event;
  isDraft: boolean;

  /** Current viewer's user ID — used to detect whether they're the event host. */
  currentUserId: string | undefined;

  hasZoomConnection: boolean;
  hasMeetConnection: boolean;
  hasAnyConnection: boolean;

  connectedPlatforms: PlatformMeta[];

  /**
   * True while the async worker is actively provisioning meetings
   * (typically right after publish). Drives the "Provisioning meetings…"
   * banner with a spinner.
   */
  provisioningInProgress?: boolean;

  /**
   * True when virtual sessions exist but no meeting link has been
   * created/pasted yet, AND provisioning is not currently running.
   * Drives the persistent "Meeting links not provided yet" banner.
   */
  meetingsMissing?: boolean;

  runningSessionId: string | null;
  runningAction:
    | 'create'
    | 'edit'
    | 'regenerate'
    | 'delete'
    | 'add'
    | null;

  onCreateMeetings: () => void;
  onOpenPlatformPicker: () => void;
  onAddMeeting: () => void;

  onJoinLink: (link: string) => void;
  onEditSession: (sessionId: string) => void;
  onRegenerateSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;

  onStartMeeting?: (session: Schedule) => void;

  onRegenerateAll: () => void;
  onDeleteAll: () => void;

  editEventHref: string;

  /**
   * Whether the card body starts expanded. Defaults to true so sessions
   * are visible immediately on the event page.
   */
  defaultExpanded?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function scheduleMeta(s: Schedule): PlatformMeta | undefined {
  const p = schedulePlatform(s);
  if (!p) return undefined;
  return PLATFORMS.find((m) => m.platform === p);
}

function rawProviderLink(s: Schedule): string | undefined {
  return s.zoom_link || s.meet_link || undefined;
}

/** Virtual schedule that has a meeting attached. */
function hasMeeting(s: Schedule): boolean {
  if (!s.is_virtual) return false;
  // Require an actual meeting ID or link. A platform alone means 
  // it's provisioned but deferred (or failed).
  return !!(s.video_meeting_id || rawProviderLink(s));
}

function resolveJoinLink(s: Schedule, event: Event): string | undefined {
  return nuruventMeetingUrl(s, event) ?? rawProviderLink(s);
}

function sessionLabel(s: Schedule, index: number): string {
  return s.session_name?.trim() || `Session ${index + 1}`;
}

function sessionTimeLabel(s: Schedule): string {
  const parts: string[] = [];
  if (s.start_date) parts.push(s.start_date);
  if (s.start_time && s.end_time) parts.push(`${s.start_time} – ${s.end_time}`);
  else if (s.start_time) parts.push(s.start_time);
  return parts.join(' · ');
}

/**
 * Is the current viewer the host (creator) of the event?
 */
function isEventHost(event: Event, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false;
  return event.creator?.id === currentUserId;
}

/**
 * Is the event more than 30 days away?
 */
function isEventFarOut(event: Event): boolean {
  const firstDate = event.schedules?.[0]?.start_date || event.start_date;
  if (!firstDate) return false;
  const start = new Date(`${firstDate.slice(0, 10)}T00:00:00Z`).getTime();
  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return start > thirtyDaysFromNow;
}

// ============================================================
// MEETING CARD
// ============================================================

export function MeetingCard({
  event,
  isDraft,
  currentUserId,
  hasZoomConnection,
  hasMeetConnection,
  hasAnyConnection,
  connectedPlatforms: _connectedPlatforms,
  provisioningInProgress,
  meetingsMissing,
  runningSessionId,
  runningAction,
  onCreateMeetings,
  onOpenPlatformPicker,
  onAddMeeting,
  onJoinLink,
  onEditSession,
  onRegenerateSession,
  onDeleteSession,
  onStartMeeting,
  onRegenerateAll,
  onDeleteAll,
  editEventHref,
  defaultExpanded = true,
}: MeetingCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isHost = isEventHost(event, currentUserId);

  const allSchedules = event.schedules ?? [];

  const virtualWithMeeting = allSchedules.filter(hasMeeting);
  const virtualMissingMeeting = allSchedules.filter(
    (s) => s.is_virtual && !hasMeeting(s),
  );
  const inPersonSchedules = allSchedules.filter((s) => !s.is_virtual);

  const hasAnyMeeting = virtualWithMeeting.length > 0;
  const hasAnyVirtual = allSchedules.some((s) => s.is_virtual);

  // Is this event far out and missing meetings?
  const isDeferred = isEventFarOut(event) && virtualMissingMeeting.length > 0;

  const platformsUsed = new Set(
    virtualWithMeeting.map((s) => schedulePlatform(s)).filter(Boolean),
  );

  const summary = (() => {
    const virtualCount =
      virtualWithMeeting.length + virtualMissingMeeting.length;

    if (virtualCount === 0 && inPersonSchedules.length === 0) {
      return 'No sessions.';
    }

    if (virtualCount === 0) {
      return `${inPersonSchedules.length} in-person ${
        inPersonSchedules.length === 1 ? 'session' : 'sessions'
      }.`;
    }

    if (!hasAnyMeeting) {
      if (isDeferred) return 'Meetings will be created closer to the date.';
      if (virtualMissingMeeting.some((s) => s.platform)) {
        return 'Meeting links not provided yet.';
      }
      return 'No meetings created yet.';
    }

    let base: string;
    if (platformsUsed.size === 1) {
      const p = Array.from(platformsUsed)[0];
      const label = PLATFORMS.find((m) => m.platform === p)?.label ?? 'video';
      base = `${virtualWithMeeting.length} ${
        virtualWithMeeting.length === 1 ? 'session' : 'sessions'
      } on ${label}`;
    } else if (platformsUsed.size === 0) {
      base = `${virtualWithMeeting.length} ${
        virtualWithMeeting.length === 1 ? 'session' : 'sessions'
      }`;
    } else {
      base = `${virtualWithMeeting.length} sessions on mixed platforms`;
    }

    if (virtualMissingMeeting.length > 0) {
      base += `, ${virtualMissingMeeting.length} missing ${
        virtualMissingMeeting.length === 1 ? 'link' : 'links'
      }`;
    }

    if (inPersonSchedules.length > 0) {
      base += `, ${inPersonSchedules.length} in-person`;
    }
    return `${base}.`;
  })();

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-4 sm:p-6">
        {/* HEADER — always visible */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 text-left cursor-pointer group"
            aria-expanded={expanded}
            aria-controls="meeting-card-body"
          >
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <Video className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Sessions &amp; Meetings
                </h3>

                {hasZoomConnection && (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 bg-primary/10 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Zoom
                  </Badge>
                )}
                {hasMeetConnection && (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 bg-primary/10 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Google Meet
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">{summary}</p>
            </div>
          </button>

          {/* Right-hand controls */}
          <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer w-full sm:w-auto"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="meeting-card-body"
            >
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 mr-1.5 transition-transform',
                  expanded && 'rotate-180',
                )}
              />
              {expanded ? 'Hide details' : 'Show details'}
            </Button>

            {hasAnyConnection ? (
              <Button
                size="sm"
                className="cursor-pointer w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onAddMeeting}
                disabled={runningAction === 'add'}
              >
                {runningAction === 'add' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add meeting
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
                onClick={onOpenPlatformPicker}
              >
                <Plug className="h-3.5 w-3.5 mr-1.5" />
                Connect platform
              </Button>
            )}
          </div>
        </div>

        {/* BODY — collapsible */}
        {expanded && (
          <div id="meeting-card-body">
            {/* Provisioning banner — active worker */}
            {isHost && provisioningInProgress && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-2.5 mt-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">
                    Provisioning meetings…
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This usually takes a few seconds. The page will update
                    automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Missing-links banner — persistent, worker not running */}
            {isHost &&
              !provisioningInProgress &&
              meetingsMissing &&
              !isDeferred && (
                <div className="rounded-lg border border-amber-300/60 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 p-3 flex items-start gap-2.5 mt-4">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Meeting links not provided yet
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      {virtualMissingMeeting.length === 1
                        ? '1 virtual session is missing a meeting link.'
                        : `${virtualMissingMeeting.length} virtual sessions are missing meeting links.`}{' '}
                      Create them automatically or paste links in the editor.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {hasAnyConnection ? (
                        <Button
                          size="sm"
                          className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={onCreateMeetings}
                          disabled={runningAction === 'create'}
                        >
                          {runningAction === 'create' ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Creating…
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              Create meetings
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={onOpenPlatformPicker}
                        >
                          <Plug className="h-3.5 w-3.5 mr-1.5" />
                          Connect a platform
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          window.location.href = editEventHref;
                        }}
                      >
                        <Link2 className="h-3.5 w-3.5 mr-1.5" />
                        Paste links manually
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {(hasAnyMeeting ||
              virtualMissingMeeting.length > 0 ||
              inPersonSchedules.length > 0) && (
              <div className="mt-4 space-y-3">
                {allSchedules.map((s, idx) => {
                  if (!s.is_virtual) {
                    return (
                      <InPersonRow
                        key={s.id}
                        session={s}
                        index={idx}
                        running={
                          runningSessionId === s.id ? runningAction : null
                        }
                        onEdit={onEditSession}
                      />
                    );
                  }

                  const meta = scheduleMeta(s);
                  const joinLink = resolveJoinLink(s, event);

                  return (
                    <SessionRow
                      key={s.id}
                      session={s}
                      index={idx}
                      meta={meta}
                      joinLink={joinLink}
                      isHost={isHost}
                      isDeferred={isDeferred}
                      running={
                        runningSessionId === s.id ? runningAction : null
                      }
                      onJoin={onJoinLink}
                      onEdit={onEditSession}
                      onRegenerate={onRegenerateSession}
                      onDelete={onDeleteSession}
                      onStart={onStartMeeting}
                    />
                  );
                })}
              </div>
            )}

            {!hasAnyMeeting &&
              virtualMissingMeeting.length > 0 &&
              hasAnyVirtual &&
              !provisioningInProgress && (
                <EmptyMeetingState
                  isDraft={isDraft}
                  isDeferred={isDeferred}
                  hasAnyConnection={hasAnyConnection}
                  sessionCount={virtualMissingMeeting.length}
                  runningAction={runningAction}
                  onCreateMeetings={onCreateMeetings}
                  onOpenPlatformPicker={onOpenPlatformPicker}
                  onAddMeeting={onAddMeeting}
                  editEventHref={editEventHref}
                />
              )}

            {hasAnyMeeting && virtualMissingMeeting.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="rounded-lg border border-dashed border-border bg-background/60 p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {virtualMissingMeeting.length}{' '}
                        {virtualMissingMeeting.length === 1
                          ? 'session has no meeting yet'
                          : 'sessions have no meeting yet'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isDeferred
                          ? 'These will be created automatically closer to the date, or you can create them now.'
                          : 'Create them automatically or paste links in the editor.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {hasAnyConnection ? (
                      <Button
                        size="sm"
                        className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={onCreateMeetings}
                        disabled={runningAction === 'create'}
                      >
                        {runningAction === 'create' ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Creating…
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Create meetings
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={onOpenPlatformPicker}
                      >
                        <Plug className="h-3.5 w-3.5 mr-1.5" />
                        Connect a platform
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        window.location.href = editEventHref;
                      }}
                    >
                      <Link2 className="h-3.5 w-3.5 mr-1.5" />
                      Paste links manually
                    </Button>
                  </div>
                </div>
              </>
            )}

            {hasAnyMeeting &&
              virtualMissingMeeting.length === 0 &&
              virtualWithMeeting.length > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={onRegenerateAll}
                      disabled={runningAction === 'regenerate'}
                    >
                      {runningAction === 'regenerate' ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Regenerating all…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          Regenerate all
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={onDeleteAll}
                      disabled={runningAction === 'delete'}
                    >
                      {runningAction === 'delete' ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Deleting all…
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete all
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyMeetingState({
  isDraft,
  isDeferred,
  hasAnyConnection,
  sessionCount,
  runningAction,
  onCreateMeetings,
  onOpenPlatformPicker,
  onAddMeeting,
  editEventHref,
}: {
  isDraft: boolean;
  isDeferred: boolean;
  hasAnyConnection: boolean;
  sessionCount: number;
  runningAction: MeetingCardProps['runningAction'];
  onCreateMeetings: () => void;
  onOpenPlatformPicker: () => void;
  onAddMeeting: () => void;
  editEventHref: string;
}) {
  return (
    <div
      className={cn(
        'mt-4 rounded-lg border p-4',
        isDeferred
          ? 'border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20'
          : 'border-border bg-muted/30',
      )}
    >
      <div className="flex items-start gap-3">
        {isDeferred ? (
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        ) : (
          <Plug className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              isDeferred
                ? 'text-blue-800 dark:text-blue-300'
                : 'text-foreground',
            )}
          >
            {isDeferred
              ? 'Meetings scheduled for later'
              : 'No meetings created yet'}
          </p>
          <p
            className={cn(
              'text-xs mt-1',
              isDeferred
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-muted-foreground',
            )}
          >
            {isDraft
              ? 'A meeting will be created automatically for each virtual session when you publish.'
              : isDeferred
                ? 'Because this event is more than 30 days away, the video meetings will be created automatically as the date approaches. You can paste links manually if you need them now.'
                : hasAnyConnection
                  ? `Create meetings for all ${sessionCount} virtual sessions with one click, add a new session with a meeting, or paste links manually in the editor.`
                  : 'Connect a video platform to create meetings automatically, or paste links manually in the editor.'}
          </p>
        </div>
      </div>

      {!isDraft && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {hasAnyConnection ? (
            <>
              {/* Hide "Create meetings now" for deferred events, as the 
                  backend will skip them until they are within 30 days. */}
              {!isDeferred && (
                <Button
                  size="sm"
                  className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={onCreateMeetings}
                  disabled={runningAction === 'create'}
                >
                  {runningAction === 'create' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Create meetings now
                    </>
                  )}
                </Button>
              )}

              {/* Add meeting is still useful to add a brand new session */}
              {!isDeferred && (
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={onAddMeeting}
                  disabled={runningAction === 'add'}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add meeting
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onOpenPlatformPicker}
            >
              <Plug className="h-3.5 w-3.5 mr-1.5" />
              Connect a platform
            </Button>
          )}
          
          {/* Paste links manually becomes the primary action for deferred events */}
          <Button
            size="sm"
            variant={isDeferred ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              isDeferred && "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            onClick={() => {
              window.location.href = editEventHref;
            }}
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Paste links manually
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// IN-PERSON ROW
// ============================================================

interface InPersonRowProps {
  session: Schedule;
  index: number;
  running: MeetingCardProps['runningAction'];
  onEdit: (sessionId: string) => void;
}

function InPersonRow({ session, index, running, onEdit }: InPersonRowProps) {
  const label = sessionLabel(session, index);
  const time = sessionTimeLabel(session);
  const isRunning = running !== null;

  return (
    <div className="rounded-lg border border-border bg-background/70 overflow-hidden">
      <div className="p-3 sm:p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
                In-person
              </span>
              <p className="text-sm font-semibold text-foreground break-words">
                {label}
              </p>
            </div>

            {time && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span className="break-words">{time}</span>
              </p>
            )}

            {session.location && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="break-words">{session.location}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-3 sm:px-4 py-2 flex items-center gap-1.5 flex-wrap bg-muted/20">
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer h-8 text-xs"
          onClick={() => onEdit(session.id)}
          disabled={isRunning}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Edit session
        </Button>

        {isRunning && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-2" />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SESSION ROW (virtual)
// ============================================================

interface SessionRowProps {
  session: Schedule;
  index: number;
  meta: PlatformMeta | undefined;
  joinLink: string | undefined;
  isHost: boolean;
  isDeferred: boolean;
  running: MeetingCardProps['runningAction'];
  onJoin: (link: string) => void;
  onEdit: (sessionId: string) => void;
  onRegenerate: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onStart?: (session: Schedule) => void;
}

function SessionRow({
  session,
  index,
  meta,
  joinLink,
  isHost,
  isDeferred,
  running,
  onJoin,
  onEdit,
  onRegenerate,
  onDelete,
  onStart,
}: SessionRowProps) {
  const label = sessionLabel(session, index);
  const time = sessionTimeLabel(session);
  const isRunning = running !== null;
  const configured = hasMeeting(session);

  return (
    <div className="rounded-lg border border-border bg-background/70 overflow-hidden">
      <div className="p-3 sm:p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {index === 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  Primary
                </span>
              )}
              <p className="text-sm font-semibold text-foreground break-words">
                {label}
              </p>
            </div>

            {time && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span className="break-words">{time}</span>
              </p>
            )}
          </div>

          {meta && (
            <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background">
              <div className="h-4 w-4">
                <Image
                  src={meta.logo}
                  alt={`${meta.label} logo`}
                  width={16}
                  height={16}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:inline">
                {meta.label}
              </span>
            </div>
          )}
        </div>

        {configured ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
            <Check className="h-3 w-3 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              Meeting configured
              {meta ? ` · ${meta.label}` : ''}
            </p>
          </div>
        ) : session.platform && !isDeferred ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5">
            <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
            <p className="text-xs text-primary">
              Provisioning meeting{meta ? ` on ${meta.label}` : ''}…
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              {isDeferred ? 'Meeting will be created closer to the date' : 'No meeting yet'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border px-3 sm:px-4 py-2 flex items-center gap-1.5 flex-wrap bg-muted/20">
        {configured ? (
          <>
            {isHost && joinLink && (
              <Button
                size="sm"
                className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onJoin(joinLink)}
                disabled={isRunning}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Join
              </Button>
            )}

            {isHost && meta?.platform === 'zoom' && onStart && (
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer h-8 text-xs border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => onStart(session)}
                disabled={isRunning}
              >
                <Video className="h-3.5 w-3.5 mr-1.5" />
                Start in Nuruvent
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer h-8 text-xs"
              onClick={() => onEdit(session.id)}
              disabled={isRunning}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer h-8 w-8 p-0"
                    disabled={isRunning}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onRegenerate(session.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={() => onEdit(session.id)}
            disabled={isRunning}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit session
          </Button>
        )}

        {isRunning && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-2" />
        )}
      </div>
    </div>
  );
}