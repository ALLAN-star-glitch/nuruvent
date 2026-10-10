// components/events/attendance/AttendanceCard.tsx

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
  Users,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
  PLATFORMS,
  type PlatformMeta,
} from '@/components/events/video/PlatformPickerModal';
import type {
  EventAttendanceSummary,
  SessionAttendanceSummary,
} from '@/lib/types/attendance';
import { SessionRosterDialog } from './SessionRoasterDialog';

// ============================================================
// HELPERS
// ============================================================

function platformMeta(provider: string): PlatformMeta | undefined {
  return PLATFORMS.find((m) => m.platform === provider);
}

function formatSessionDate(iso: string | undefined): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Google Meet sessions with a linked video meeting can be polled. */
function canFetchAttendance(s: SessionAttendanceSummary): boolean {
  return s.provider === 'google_meet' && !!s.video_meeting_id;
}

// ============================================================
// PROPS
// ============================================================

export interface AttendanceCardProps {
  /** Event this card belongs to. Used to link to the full attendees page. */
  eventId: string;

  /** Current route params — used to build the attendees link. */
  accountId: string;
  teamId: string;

  summary: EventAttendanceSummary | null;
  loading?: boolean;
  error?: string | null;

  /** Session IDs currently being fetched (per-row spinner). */
  fetchingSessionIds?: string[];

  /**
   * Called when "Fetch attendance" is clicked on a Google Meet row.
   * The caller hits POST /video/meetings/:id/fetch-attendance.
   */
  onFetchAttendance?: (videoMeetingId: string, sessionId: string) => void;

  /** Called when "Export all as CSV" is clicked. */
  onExportAll?: () => void;

  /**
   * Whether the card body starts expanded. Defaults to false so the
   * event page isn't dominated by attendance on first load.
   */
  defaultExpanded?: boolean;

  className?: string;
}

// ============================================================
// CARD
// ============================================================

export function AttendanceCard({
  eventId,
  accountId,
  teamId,
  summary,
  loading = false,
  error = null,
  fetchingSessionIds = [],
  onFetchAttendance,
  onExportAll,
  defaultExpanded = false,
  className,
}: AttendanceCardProps) {
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const sessions = summary?.sessions ?? [];
  const totals = summary?.totals;

  const openSession = useMemo(
    () => sessions.find((s) => s.session_id === openSessionId) ?? null,
    [sessions, openSessionId],
  );

  const anyAttendance = sessions.some((s) => s.has_attendance_data);

  const providersUsed = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.provider).filter(Boolean))),
    [sessions],
  );

  const collapsedSummary = (() => {
    if (loading) return 'Loading attendance…';
    if (error) return error;
    if (!totals || totals.sessions_with_attendance === 0) {
      return 'No attendance recorded yet.';
    }
    const sessionsLabel =
      totals.sessions_with_attendance === 1 ? 'session' : 'sessions';
    const attendeesLabel =
      totals.unique_attendees === 1 ? 'attendee' : 'attendees';
    return `${totals.sessions_with_attendance} ${sessionsLabel} with attendance · ${totals.unique_attendees} ${attendeesLabel} overall`;
  })();

  return (
    <>
      <Card className={cn('border-border', className)}>
        <CardContent className="p-4 sm:p-6">
          {/* HEADER — always visible */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 text-left cursor-pointer group"
              aria-expanded={expanded}
              aria-controls="attendance-card-body"
            >
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Attendance
                  </h3>

                  {providersUsed.map((p) => {
                    const meta = platformMeta(p);
                    if (!meta) return null;
                    return (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-xs border-border bg-background gap-1 pl-1 pr-2 py-0.5"
                      >
                        <span className="h-3.5 w-3.5 shrink-0">
                          <Image
                            src={meta.logo}
                            alt={`${meta.label} logo`}
                            width={14}
                            height={14}
                            className="h-full w-full object-contain"
                          />
                        </span>
                        {meta.label}
                      </Badge>
                    );
                  })}
                </div>

                <p
                  className={cn(
                    'text-sm mt-1',
                    error ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {loading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1.5 align-middle" />
                  )}
                  {error && (
                    <AlertCircle className="h-3.5 w-3.5 inline mr-1.5 align-middle" />
                  )}
                  {collapsedSummary}
                </p>
              </div>
            </button>

            {/* Right-hand control — outside the toggle so clicks don't fold the card */}
            <div className="shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="attendance-card-body"
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 mr-1.5 transition-transform',
                    expanded && 'rotate-180',
                  )}
                />
                {expanded ? 'Hide details' : 'Show details'}
              </Button>
            </div>
          </div>

          {/* BODY — collapsible */}
          {expanded && (
            <div id="attendance-card-body">
              {/* EMPTY STATE */}
              {!loading && !error && sessions.length === 0 && (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No sessions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sessions appear here once they&apos;re scheduled.
                  </p>
                </div>
              )}

              {/* SESSION LIST */}
              {!loading && !error && sessions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <SessionAttendanceRow
                        key={s.session_id}
                        session={s}
                        fetching={fetchingSessionIds.includes(s.session_id)}
                        onViewRoster={() => setOpenSessionId(s.session_id)}
                        onFetch={
                          onFetchAttendance && canFetchAttendance(s)
                            ? () =>
                                onFetchAttendance(
                                  s.video_meeting_id as string,
                                  s.session_id,
                                )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </>
              )}

              {/* FOOTER */}
              {!loading && !error && sessions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/dashboard/${accountId}/${teamId}/events/${eventId}/attendees`}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View all attendees
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    {anyAttendance && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={onExportAll}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Export all as CSV
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionRosterDialog
        open={openSessionId !== null}
        onOpenChange={(open) => !open && setOpenSessionId(null)}
        session={openSession}
        videoMeetingId={openSession?.video_meeting_id ?? undefined}
      />
    </>
  );
}

// ============================================================
// SESSION ROW
// ============================================================

function SessionAttendanceRow({
  session,
  fetching,
  onViewRoster,
  onFetch,
}: {
  session: SessionAttendanceSummary;
  fetching: boolean;
  onViewRoster: () => void;
  onFetch?: () => void;
}) {
  const hasData = session.has_attendance_data;
  const meta = platformMeta(session.provider);

  return (
    <div className="rounded-lg border border-border bg-background/70 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {meta && (
              <span
                className="h-5 w-5 shrink-0 rounded border border-border bg-background p-0.5"
                title={meta.label}
              >
                <Image
                  src={meta.logo}
                  alt={`${meta.label} logo`}
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                />
              </span>
            )}
            <p className="text-sm font-semibold text-foreground break-words">
              {session.title || 'Untitled session'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {formatSessionDate(session.scheduled_start)}
          </p>
        </div>

        {!hasData && (
          <Badge
            variant="outline"
            className="text-muted-foreground bg-muted border-border text-[10px] shrink-0"
          >
            No data
          </Badge>
        )}
      </div>

      {hasData ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
          <span>
            <span className="font-medium text-foreground">
              {session.registered_count}
            </span>{' '}
            registered
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-medium text-foreground">
              {session.attended_count}
            </span>{' '}
            attended
          </span>
          <span className="text-border">·</span>
          <span>
            avg{' '}
            <span className="font-medium text-foreground">
              {formatDuration(session.avg_duration_seconds)}
            </span>
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          {session.provider === 'google_meet'
            ? 'No attendance yet — click Fetch attendance to pull records from Google Meet.'
            : 'Attendance hasn’t been recorded for this session yet.'}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer h-8 text-xs px-2 -ml-2 text-primary hover:text-primary hover:bg-primary/5"
          onClick={onViewRoster}
        >
          View roster
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>

        {onFetch && (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs ml-auto"
            onClick={onFetch}
            disabled={fetching}
          >
            {fetching ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Fetch attendance
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}