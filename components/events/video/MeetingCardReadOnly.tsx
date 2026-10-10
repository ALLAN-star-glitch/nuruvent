// components/events/video/MeetingCardReadOnly.tsx

'use client';

import Link from 'next/link';
import { CalendarDays, Ticket } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Event, Schedule } from '@/lib/types/events';
import { schedulePlatform } from '@/lib/utils/meetingUrl';

import { PLATFORMS } from './PlatformPickerModal';

// ============================================================
// PROPS
// ============================================================

export interface MeetingCardReadOnlyProps {
  event: Event;
  /** Where "View my tickets" navigates. Built by the caller. */
  ticketsHref: string;
}

// ============================================================
// HELPERS
// ============================================================

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

function platformLabel(s: Schedule): string | undefined {
  const p = schedulePlatform(s);
  if (!p) return undefined;
  return PLATFORMS.find((m) => m.platform === p)?.label;
}

// ============================================================
// COMPONENT
// ============================================================

/**
 * Read-only sessions view for viewers who are not the event host.
 *
 * No meeting controls, no join links, no edit actions. The viewer
 * registers for the event the normal way and receives join links via
 * email and the tickets page — this card just points them there.
 */
export function MeetingCardReadOnly({
  event,
  ticketsHref,
}: MeetingCardReadOnlyProps) {
  const schedules = event.schedules ?? [];

  if (schedules.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-muted/20">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-muted text-muted-foreground shrink-0">
            <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Sessions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {schedules.length === 1
                ? '1 session scheduled.'
                : `${schedules.length} sessions scheduled.`}
            </p>
          </div>
        </div>

        {/* Session list — read-only */}
        <div className="mt-4 space-y-2">
          {schedules.map((s, idx) => {
            const label = sessionLabel(s, idx);
            const time = sessionTimeLabel(s);
            const platform = s.is_virtual ? platformLabel(s) : undefined;

            return (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-background/60 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground break-words">
                      {label}
                    </p>
                    {time && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span className="break-words">{time}</span>
                      </p>
                    )}
                  </div>

                  {platform && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] uppercase tracking-wider"
                    >
                      {platform}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Single action */}
        <Link href={ticketsHref} className="block">
          <Button
            className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Ticket className="h-4 w-4 mr-2" />
            View my tickets
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Join links are sent to your email and shown on your tickets page.
        </p>
      </CardContent>
    </Card>
  );
}