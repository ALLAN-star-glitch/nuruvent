'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  MapPin,
  Ticket as TicketIcon,
  Video,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


import type { CrossEventRegistration } from '@/lib/types/registration';
import type { SessionLink, SessionLinkGroup } from '@/lib/types/attendance';
import { StatusBadge } from '@/components/registrations/status_badge';
import { CancelRegistrationDialog } from '@/components/registrations/cancel-registration-dialog';
import { SessionLinkRow } from '@/components/registrations/session-link-row';

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
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
      <Calendar className="h-10 w-10 text-muted-foreground/60" />
    </div>
  );
}

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
    const query = [
      r.venue_name,
      r.venue_address,
      r.venue_city,
      r.venue_country,
    ]
      .filter(Boolean)
      .join(' ');
    return query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : '';
  })();

  const canCancel =
    !isPast && r.status !== 'cancelled' && r.status !== 'canceled';

  return (
    <>
      <Card
        className={cn(
          'group overflow-hidden border-border/70 transition-all duration-200',
          'hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]',
          expanded && 'border-primary/40 ring-1 ring-primary/30',
        )}
      >
        {/* Hero image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <EventCoverImage
            src={r.event_image_url}
            alt={r.event_name || 'Event cover'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute right-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'h-5 shrink-0 rounded-full border bg-background/90 text-[10px] backdrop-blur-sm',
                isPast
                  ? 'text-muted-foreground border-border'
                  : 'border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/70 dark:text-emerald-400',
              )}
            >
              {isPast ? 'Past' : 'Upcoming'}
            </Badge>
            <StatusBadge
              status={r.status}
              label={r.status_label}
              className="h-5 shrink-0 rounded-full bg-background/95 text-[10px] backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-[15px] font-semibold text-foreground sm:text-base">
                {r.event_name || 'Untitled event'}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDateLong(r.event_start_date)}</span>
              </div>

              {r.ticket_name && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <TicketIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{r.ticket_name}</span>
                </div>
              )}

              {isPhysical && (locationLine || mapsUrl) && (
                <div className="mt-1.5 flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 transition-colors hover:text-primary"
                    >
                      <span className="break-words">
                        {locationLine || 'View on map'}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <span className="break-words">{locationLine}</span>
                  )}
                </div>
              )}
            </div>

            {showToggle && (
              <button
                onClick={onToggle}
                className="shrink-0 cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
                aria-expanded={expanded}
              >
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform duration-200',
                    expanded && 'rotate-180',
                  )}
                />
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-4">
            {isPhysical && (
              <Badge
                variant="outline"
                className="inline-flex h-6 items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-xs font-normal"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                In-Person
              </Badge>
            )}

            {platforms.length > 0 &&
              platforms.map((p) => {
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
                    className="inline-flex h-6 items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-xs font-normal"
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

            {hasSessions && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5" />
                <span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {joinableCount}
                  </span>
                  <span className="mx-0.5">/</span>
                  <span className="tabular-nums">{sessionCount}</span> joinable
                </span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">
                {r.registration_number || r.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {sessionCount === 1 && (
            <div className="mt-4 border-t border-border/60 pt-4">
              <SessionLinkRow link={links[0]} />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
            {showToggle && (
              <button
                onClick={onToggle}
                className="cursor-pointer text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {expanded ? 'Hide sessions' : `View ${sessionCount} sessions`}
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
              >
                <X className="h-3.5 w-3.5" />
                Cancel registration
              </button>
            )}
          </div>
        </div>

        {showToggle && expanded && (
          <div className="space-y-2.5 border-t border-border/60 bg-muted/20 p-3 sm:p-4">
            {links.map((link) => (
              <SessionLinkRow key={link.session_id} link={link} />
            ))}
          </div>
        )}
      </Card>

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