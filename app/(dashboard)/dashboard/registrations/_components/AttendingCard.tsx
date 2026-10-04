/* eslint-disable react-hooks/purity */
'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  MapPin,
  Ticket,
  Video,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { CrossEventRegistration } from '@/lib/types/registration';
import type { SessionLink, SessionLinkGroup } from '@/lib/types/attendance';
import { SessionLinkRow } from './SessionLinkRow';
import { CancelRegistrationDialog } from './CancelRegistrationDialog';

// ============================================================
// HELPERS
// ============================================================

function statusVisual(slug: string, label: string) {
  const s = (slug ?? '').toLowerCase();
  switch (s) {
    case 'confirmed':
      return { label, dot: 'bg-emerald-500', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' };
    case 'pending':
      return { label, dot: 'bg-amber-500', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50' };
    case 'cancelled':
    case 'canceled':
      return { label, dot: 'bg-red-500', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50' };
    case 'attended':
      return { label, dot: 'bg-primary', color: 'bg-primary/10 text-primary border-primary/30' };
    default:
      return { label, dot: 'bg-muted-foreground', color: 'bg-muted text-muted-foreground border-border' };
  }
}

function formatDateLong(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ============================================================
// EVENT COVER IMAGE
// ============================================================

/**
 * Graceful event cover image. Falls back to a branded gradient
 * panel if the URL is empty or fails to load.
 */
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

export function AttendingCard({ merged, expanded, onToggle, onCancelled }: Props) {
  const { registration: r, links } = merged;
  const v = statusVisual(r.status, r.status_label);
  const sessionCount = links.length;
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

  // ---- Physical location ----
  const isPhysical = !r.is_virtual;
  const locationParts = [r.venue_name, r.venue_address, r.venue_city, r.venue_country].filter(Boolean);
  const locationLine = locationParts.length > 0 ? locationParts.join(', ') : r.in_person_location || '';

  const mapsUrl = (() => {
    const query = [r.venue_name, r.venue_address, r.venue_city, r.venue_country].filter(Boolean).join(' ');
    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
  })();

  const canCancel = !isPast && r.status !== 'cancelled' && r.status !== 'canceled';

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border-border/70 transition-all duration-200',
          'hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]',
          expanded && 'ring-1 ring-primary/30 border-primary/40',
        )}
      >
        {/* ── Event cover banner ─────────────────────────── */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <EventCoverImage
            src={r.event_image_url}
            alt={r.event_name || 'Event cover'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Status badges float over the image */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100%-1rem)]">
            {isPast ? (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground bg-background/90 border-border rounded-full h-5 backdrop-blur-sm shrink-0"
              >
                Past
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/95 dark:bg-emerald-950/70 rounded-full h-5 backdrop-blur-sm shrink-0"
              >
                Upcoming
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                'inline-flex items-center gap-1.5 text-[10px] rounded-full pl-2 pr-2.5 py-0.5 h-5 font-medium backdrop-blur-sm shrink-0',
                v.color,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', v.dot)} />
              {v.label}
            </Badge>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-[15px] sm:text-base break-words">
                  {r.event_name || 'Untitled event'}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDateLong(r.event_start_date)}</span>
              </div>

              {r.ticket_name && (
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5 shrink-0" />
                  <span>{r.ticket_name}</span>
                </div>
              )}

              {/* Physical location for in-person events */}
              {isPhysical && (locationLine || mapsUrl) && (
                <div className="flex items-start gap-2 mt-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      <span className="break-words">{locationLine || 'View on map'}</span>
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
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
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
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-4 pt-4 border-t border-border/60">
            {isPhysical && (
              <Badge variant="outline" className="text-xs font-normal inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 h-6 rounded-full">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                In-Person
              </Badge>
            )}

            {platforms.length > 0 &&
              platforms.map((p) => {
                const map: Record<string, { label: string; logo?: string }> = {
                  zoom: { label: 'Zoom', logo: '/platforms/zoom.png' },
                  google_meet: { label: 'Google Meet', logo: '/platforms/google-meet.png' },
                };
                const meta = map[p];
                if (!meta) return null;
                return (
                  <Badge
                    key={p}
                    variant="outline"
                    className="text-xs font-normal inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 h-6 rounded-full"
                  >
                    {meta.logo && (
                      <span className="relative h-3.5 w-3.5 shrink-0">
                        <img src={meta.logo} alt="" className="object-contain h-full w-full" />
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
                  <span className="font-semibold text-foreground tabular-nums">{joinableCount}</span>
                  <span className="mx-0.5">/</span>
                  <span className="tabular-nums">{sessionCount}</span>{' '}joinable
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
              <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded">
                {r.registration_number || r.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Single session inline */}
          {sessionCount === 1 && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <SessionLinkRow link={links[0]} />
            </div>
          )}

          {/* Multi session toggle + cancel */}
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border/60">
            {showToggle && (
              <button
                onClick={onToggle}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {expanded ? 'Hide sessions' : `View ${sessionCount} sessions`}
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors cursor-pointer inline-flex items-center gap-1 ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                Cancel registration
              </button>
            )}
          </div>
        </div>

        {showToggle && expanded && (
          <div className="border-t border-border/60 bg-muted/20 p-3 sm:p-4 space-y-2.5">
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