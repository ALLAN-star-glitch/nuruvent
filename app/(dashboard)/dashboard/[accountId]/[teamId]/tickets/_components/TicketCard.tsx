'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  Ticket as TicketIcon,
  Video,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { CrossEventRegistration } from '@/lib/types/registration';
import type { SessionLink, SessionLinkGroup } from '@/lib/types/attendance';
import { StatusBadge } from '@/components/registrations/status_badge';
import { CancelRegistrationDialog } from '@/components/registrations/cancel-registration-dialog';
import { SessionLinkRow } from '@/components/registrations/session-link-row';

// ============================================================
// HELPERS
// ============================================================

function formatDateLong(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateParts(iso: string | undefined) {
  if (!iso) return { month: '', day: '', weekday: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { month: '', day: '', weekday: '' };
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  };
}

function EventCoverImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = !!src && !failed;

  if (show) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/8 via-muted to-secondary/8">
      <Calendar className="h-9 w-9 text-muted-foreground/50" />
    </div>
  );
}

// ============================================================
// TYPES
// ============================================================

export interface MergedRegistration {
  registration: CrossEventRegistration;
  group: SessionLinkGroup | null;
  links: SessionLink[];
}

interface Props {
  merged: MergedRegistration;
  expanded: boolean;
  onToggle: () => void;
  onCancelled?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function TicketCard({ merged, expanded, onToggle, onCancelled }: Props) {
  const { registration: r, links } = merged;
  const sessionCount = links.length;

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const joinableCount = links.filter(
    (l) => l.join_url && new Date(l.expires_at).getTime() > now,
  ).length;

  const hasSessions = sessionCount > 0;
  const showToggle = sessionCount > 1;
  const [cancelOpen, setCancelOpen] = useState(false);

  const platforms: string[] = [];
  for (const l of links) {
    if (l.platform && !platforms.includes(l.platform)) platforms.push(l.platform);
  }

  const isPast = r.event_start_date
    ? new Date(r.event_start_date).getTime() <= now
    : false;

  const isPhysical = !r.is_virtual;
  const locationParts = [
    r.venue_name,
    r.venue_address,
    r.venue_city,
    r.venue_country,
  ].filter(Boolean);
  const locationLine =
    locationParts.length > 0 ? locationParts.join(', ') : r.in_person_location || '';

  const mapsUrl = (() => {
    const query = [r.venue_name, r.venue_address, r.venue_city, r.venue_country]
      .filter(Boolean)
      .join(' ');
    return query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : '';
  })();

  const canCancel =
    !isPast && r.status !== 'cancelled' && r.status !== 'canceled';

  const dateParts = formatDateParts(r.event_start_date);
  const regNumber = r.registration_number || r.id.slice(0, 8);
  const startTime = formatTime(r.event_start_date);
  const fullDate = formatDateLong(r.event_start_date);

  return (
    <>
      {/* Wrapper for the breathing glow behind the card */}
      <div className="relative">
        {/* Breathing halo behind the card */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -inset-1 rounded-2xl blur-xl animate-ticket-breathe',
            isPast
              ? 'bg-muted/40'
              : 'bg-gradient-to-br from-primary/15 via-transparent to-secondary/15',
          )}
        />

        <Card
          className={cn(
            'group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200',
            'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'hover:border-border hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)]',
            expanded && 'border-primary/30 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)]',
          )}
        >
          {/* =====================================================
              MAIN BODY
             ===================================================== */}
          <div className="flex flex-col md:flex-row">
            {/* ---- Image column ---- */}
            <div className="relative md:w-56 lg:w-64 shrink-0">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted md:h-full md:aspect-auto md:min-h-[200px]">
                <EventCoverImage
                  src={r.event_image_url}
                  alt={r.event_name || 'Event cover'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* Animated shimmer sweep across the image */}
                {!isPast && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 -left-1/2 w-1/2 animate-ticket-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-12deg]"
                    />
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 to-transparent" />

                {/* Date chip */}
                <div className="absolute bottom-3 left-3 rounded-lg border border-border/50 bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {dateParts.month}
                      </span>
                      <span className="text-xl font-extrabold leading-none text-foreground">
                        {dateParts.day}
                      </span>
                    </div>
                    <div className="h-7 w-px bg-border/80" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {dateParts.weekday}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                        {!isPast && (
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 animate-ticket-dot rounded-full bg-emerald-500 text-emerald-500"
                          />
                        )}
                        {isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                  <StatusBadge
                    status={r.status}
                    label={r.status_label}
                    className="h-5 rounded-full border-border/50 bg-background/95 text-[10px] font-medium backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* ---- Details column ---- */}
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
              {/* Title + toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                    {isPast ? 'Past event' : 'Your ticket'}
                  </p>
                  <h3 className="mt-1.5 break-words text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                    {r.event_name || 'Untitled event'}
                  </h3>
                </div>

                {showToggle && (
                  <button
                    onClick={onToggle}
                    className="shrink-0 cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse sessions' : 'Expand sessions'}
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        expanded && 'rotate-180',
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Details grid */}
              <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                {/* When */}
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      When
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                      {fullDate}
                      {startTime && (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          · {startTime}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Ticket */}
                {r.ticket_name && (
                  <div className="flex items-start gap-2.5">
                    <TicketIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        Ticket
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {r.ticket_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Where */}
                {isPhysical && (locationLine || mapsUrl) && (
                  <div className="col-span-full flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        Where
                      </p>
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link mt-1 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                          <span className="truncate">
                            {locationLine || 'View on map'}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover/link:opacity-80" />
                        </a>
                      ) : (
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {locationLine}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Platform badges */}
              {platforms.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {platforms.map((p) => {
                    const map: Record<string, { label: string; logo?: string }> = {
                      zoom: { label: 'Zoom', logo: '/platforms/zoom.png' },
                      google_meet: {
                        label: 'Google Meet',
                        logo: '/platforms/google-meet.png',
                      },
                    };
                    const meta = map[p];
                    if (!meta) return null;
                    return (
                      <Badge
                        key={p}
                        variant="outline"
                        className="inline-flex h-6 items-center gap-1.5 rounded-md border-border/60 bg-muted/40 px-2 py-0 text-xs font-normal text-muted-foreground"
                      >
                        {meta.logo && (
                          <span className="relative h-3.5 w-3.5 shrink-0">
                            <img
                              src={meta.logo}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </span>
                        )}
                        <span>{meta.label}</span>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* ---- Session actions ---- */}
              {hasSessions && (
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Video className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {joinableCount}
                      </span>
                      <span className="mx-0.5 text-muted-foreground/60">/</span>
                      <span className="tabular-nums">{sessionCount}</span>{' '}
                      {sessionCount === 1 ? 'session' : 'sessions'} joinable
                    </span>
                  </div>

                  {showToggle && (
                    <Button
                      variant={expanded ? 'outline' : 'default'}
                      size="sm"
                      onClick={onToggle}
                      className="ml-auto h-9 cursor-pointer gap-1.5 rounded-lg px-3.5 text-xs font-semibold"
                    >
                      {expanded ? (
                        <>
                          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                          Hide links
                        </>
                      ) : (
                        <>
                          <Video className="h-3.5 w-3.5" />
                          View meeting links
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Single-session join row */}
              {sessionCount === 1 && (
                <div className="mt-4">
                  <SessionLinkRow link={links[0]} />
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              TICKET STUB
             ===================================================== */}
          <div className="relative border-t border-dashed border-border/60">
            <div className="absolute -left-1.5 top-0 h-3 w-3 -translate-y-1/2 rounded-full border border-border/60 bg-background" />
            <div className="absolute -right-1.5 top-0 h-3 w-3 -translate-y-1/2 rounded-full border border-border/60 bg-background" />

            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                  Ref
                </p>
                <p className="truncate font-mono text-sm font-medium tracking-wider text-foreground/80">
                  {regNumber}
                </p>
              </div>

              <div
                aria-hidden
                className="hidden h-5 max-w-[160px] flex-1 items-end gap-[2px] overflow-hidden sm:flex"
              >
                {Array.from({ length: 32 }).map((_, i) => {
                  const widths = [1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 2];
                  const h = widths[i % widths.length];
                  return (
                    <span
                      key={i}
                      className="shrink-0 bg-foreground/50"
                      style={{
                        width: `${h}px`,
                        height: `${50 + (i % 4) * 12}%`,
                      }}
                    />
                  );
                })}
              </div>

              {canCancel && (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* =====================================================
              EXPANDED SESSIONS
             ===================================================== */}
          {showToggle && expanded && (
            <div className="space-y-2.5 border-t border-border/50 bg-muted/20 p-3 sm:p-4">
              {links.map((link) => (
                <SessionLinkRow key={link.session_id} link={link} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <CancelRegistrationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        registrationId={r.id}
        eventName={r.event_name || 'this event'}
        onCancelled={onCancelled}
      />
    </>
  );
}