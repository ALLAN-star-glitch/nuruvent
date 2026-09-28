// components/events/video/MeetingCard.tsx

'use client';

import Image from 'next/image';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Copy,
  Edit,
  ExternalLink,
  Link2,
  Loader2,
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
import type { Event, Schedule, VideoPlatform } from '@/lib/types/events';

import { PLATFORMS, type PlatformMeta } from './PlatformPickerModal';

// ============================================================
// TYPES
// ============================================================

export interface MeetingCardProps {
  event: Event;
  isDraft: boolean;

  /** Per-platform connection flags. */
  hasZoomConnection: boolean;
  hasMeetConnection: boolean;
  hasAnyConnection: boolean;

  /** Which platforms the user has connected, in display order. */
  connectedPlatforms: PlatformMeta[];

  /** Currently running action, if any. Used to disable buttons. */
  runningSessionId: string | null;
  runningAction:
    | 'create'
    | 'edit'
    | 'share'
    | 'regenerate'
    | 'delete'
    | 'add'
    | null;

  /** Which session the user just copied a link for. */
  copiedSessionId: string | null;

  /** Called when the user wants to create meetings for sessions without one. */
  onCreateMeetings: () => void;

  /** Opens the platform picker for connection management. */
  onOpenPlatformPicker: () => void;

  /** Opens the "Add meeting" dialog to create a new schedule + meeting. */
  onAddMeeting: () => void;

  /** Per-session actions. */
  onCopyLink: (sessionId: string, link: string) => void;
  onJoinLink: (link: string) => void;
  onEditSession: (sessionId: string) => void;
  onShareSession: (sessionId: string) => void;
  onRegenerateSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;

  /** Bulk actions. */
  onRegenerateAll: () => void;
  onDeleteAll: () => void;

  /** Navigate to the editor for manual link entry. */
  editEventHref: string;
}

// ============================================================
// HELPERS
// ============================================================

function schedulePlatform(s: Schedule): VideoPlatform | undefined {
  if (s.platform) return s.platform;
  if (s.zoom_link) return 'zoom';
  if (s.meet_link) return 'google_meet';
  return undefined;
}

function scheduleMeta(s: Schedule): PlatformMeta | undefined {
  const p = schedulePlatform(s);
  if (!p) return undefined;
  return PLATFORMS.find((m) => m.platform === p);
}

function scheduleLink(s: Schedule): string | undefined {
  return s.zoom_link || s.meet_link || undefined;
}

function isSessionWithMeeting(s: Schedule): boolean {
  return !!(s.is_virtual && (s.platform || scheduleLink(s)));
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

// ============================================================
// MEETING CARD
// ============================================================

export function MeetingCard({
  event,
  isDraft,
  hasZoomConnection,
  hasMeetConnection,
  hasAnyConnection,
  connectedPlatforms,
  runningSessionId,
  runningAction,
  copiedSessionId,
  onCreateMeetings,
  onOpenPlatformPicker,
  onAddMeeting,
  onCopyLink,
  onJoinLink,
  onEditSession,
  onShareSession,
  onRegenerateSession,
  onDeleteSession,
  onRegenerateAll,
  onDeleteAll,
  editEventHref,
}: MeetingCardProps) {
  const sessions = (event.schedules ?? []).filter(isSessionWithMeeting);
  const scheduledVirtual = (event.schedules ?? []).filter((s) => s.is_virtual);
  const missingMeeting = scheduledVirtual.filter((s) => !isSessionWithMeeting(s));

  const hasAnyMeeting = sessions.length > 0;
  const allScheduledHaveMeetings =
    scheduledVirtual.length > 0 && missingMeeting.length === 0;

  const platformsUsed = new Set(
    sessions.map((s) => schedulePlatform(s)).filter(Boolean),
  );

  const summary = (() => {
    if (scheduledVirtual.length === 0) return 'No virtual sessions.';
    if (!hasAnyMeeting) return 'No meetings created yet.';
    if (platformsUsed.size === 1) {
      const p = Array.from(platformsUsed)[0];
      const label = PLATFORMS.find((m) => m.platform === p)?.label ?? 'video';
      return `${sessions.length} ${
        sessions.length === 1 ? 'session' : 'sessions'
      } on ${label}.`;
    }
    return `${sessions.length} sessions on mixed platforms.`;
  })();

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-4 sm:p-6">
        {/* ============================================================
            HEADER
            ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <Video className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Meeting
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
          </div>

          {/* Add meeting button — top-right on desktop, full width on mobile */}
          <div className="shrink-0 w-full sm:w-auto">
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

        {/* ============================================================
            EMPTY STATE
            ============================================================ */}
        {!hasAnyMeeting && scheduledVirtual.length > 0 && (
          <EmptyMeetingState
            isDraft={isDraft}
            hasAnyConnection={hasAnyConnection}
            sessionCount={scheduledVirtual.length}
            runningAction={runningAction}
            onCreateMeetings={onCreateMeetings}
            onOpenPlatformPicker={onOpenPlatformPicker}
            onAddMeeting={onAddMeeting}
            editEventHref={editEventHref}
          />
        )}

        {/* ============================================================
            SESSION LIST
            ============================================================ */}
        {hasAnyMeeting && (
          <div className="mt-4 space-y-3">
            {sessions.map((s, i) => (
              <SessionRow
                key={s.id}
                session={s}
                index={i}
                meta={scheduleMeta(s)}
                link={scheduleLink(s)}
                running={runningSessionId === s.id ? runningAction : null}
                copied={copiedSessionId === s.id}
                onCopy={onCopyLink}
                onJoin={onJoinLink}
                onEdit={onEditSession}
                onShare={onShareSession}
                onRegenerate={onRegenerateSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}

        {/* ============================================================
            PARTIAL STATE
            ============================================================ */}
        {hasAnyMeeting && missingMeeting.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="rounded-lg border border-dashed border-border bg-background/60 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {missingMeeting.length}{' '}
                    {missingMeeting.length === 1
                      ? 'session has no meeting yet'
                      : 'sessions have no meeting yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create them automatically or paste links in the editor.
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

        {/* ============================================================
            BULK ACTIONS
            ============================================================ */}
        {allScheduledHaveMeetings && sessions.length > 1 && (
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
      </CardContent>
    </Card>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyMeetingState({
  isDraft,
  hasAnyConnection,
  sessionCount,
  runningAction,
  onCreateMeetings,
  onOpenPlatformPicker,
  onAddMeeting,
  editEventHref,
}: {
  isDraft: boolean;
  hasAnyConnection: boolean;
  sessionCount: number;
  runningAction: MeetingCardProps['runningAction'];
  onCreateMeetings: () => void;
  onOpenPlatformPicker: () => void;
  onAddMeeting: () => void;
  editEventHref: string;
}) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <Plug className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            No meetings created yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isDraft
              ? 'A meeting will be created automatically for each virtual session when you publish.'
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
      )}
    </div>
  );
}

// ============================================================
// SESSION ROW
// ============================================================

interface SessionRowProps {
  session: Schedule;
  index: number;
  meta: PlatformMeta | undefined;
  link: string | undefined;
  running: MeetingCardProps['runningAction'];
  copied: boolean;
  onCopy: (sessionId: string, link: string) => void;
  onJoin: (link: string) => void;
  onEdit: (sessionId: string) => void;
  onShare: (sessionId: string) => void;
  onRegenerate: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

function SessionRow({
  session,
  index,
  meta,
  link,
  running,
  copied,
  onCopy,
  onJoin,
  onEdit,
  onShare,
  onRegenerate,
  onDelete,
}: SessionRowProps) {
  const label = sessionLabel(session, index);
  const time = sessionTimeLabel(session);
  const isRunning = running !== null;

  return (
    <div className="rounded-lg border border-border bg-background/70 overflow-hidden">
      {/* Top: name, time, platform */}
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

        {link ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs font-mono text-foreground/80 truncate flex-1 min-w-0">
              {link}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5">
            <AlertCircle className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">No meeting yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border px-3 sm:px-4 py-2 flex items-center gap-1.5 flex-wrap bg-muted/20">
        {link ? (
          <>
            <Button
              size="sm"
              className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => onJoin(link)}
              disabled={isRunning}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Join
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer h-8 text-xs"
              onClick={() => onCopy(session.id, link)}
              disabled={isRunning}
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

            <div className="hidden sm:flex items-center gap-1.5">
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

              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer h-8 text-xs"
                onClick={() => onShare(session.id)}
                disabled={isRunning}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
            </div>

            <div className="sm:hidden ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer h-8 w-8 p-0"
                    disabled={isRunning}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEdit(session.id)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onShare(session.id)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onRegenerate(session.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
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

            <div className="hidden sm:block ml-auto">
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