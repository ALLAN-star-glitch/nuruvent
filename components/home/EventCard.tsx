// components/home/EventCard.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Clock as ClockIcon,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  MapPin,
  Mic2,
  Presentation,
  RefreshCw,
  Share2,
  Sparkles,
  Users2,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';

import type { Event } from '@/lib/types/events';
import {
  formatEventDateBadge,
  formatEventDateSummary,
  formatPrice,
  getEventFillRate,
  getEventHostName,
  getEventLocation,
  getEventMinPrice,
  getEventTypeColor,
  getEventTypeName,
  getSpotsLeft,
  isEventFree,
  isEventFullyBooked,
  isEventPast,
  isHostInstitution,
} from '@/lib/utils/eventDisplay';

// ============================================================
// PROPS
// ============================================================

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  featured?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function getEventTypeIcon(slug: string | undefined) {
  const s = (slug ?? '').toLowerCase();
  if (s.includes('workshop')) return <Briefcase className="h-3.5 w-3.5" />;
  if (s.includes('webinar')) return <Presentation className="h-3.5 w-3.5" />;
  if (s.includes('bootcamp')) return <GraduationCap className="h-3.5 w-3.5" />;
  if (s.includes('meetup')) return <Users2 className="h-3.5 w-3.5" />;
  if (s.includes('conference')) return <Mic2 className="h-3.5 w-3.5" />;
  if (s.includes('seminar')) return <BookOpen className="h-3.5 w-3.5" />;
  if (s.includes('networking')) return <Handshake className="h-3.5 w-3.5" />;
  return <Briefcase className="h-3.5 w-3.5" />;
}

// ============================================================
// BADGE METADATA
// ============================================================
//
// Three modes, each producing an unambiguous pill:
//
//   single    → JAN / 15 / WED / 10:00 AM – 12:00 PM
//   multi-day → JAN 1 → 8 · 2027
//   recurring → ⚡ STARTS / JAN 4, 2027
//
// "STARTS" is loud and unambiguous for recurring events: the viewer
// immediately knows this is a series beginning at that date, not a
// one-off event.

interface DateBadgeMeta {
  mode: 'single' | 'multi-day' | 'recurring';
  lines: string[];
}

function getDateBadgeMeta(event: Event): DateBadgeMeta {
  const badge = formatEventDateBadge(event);
  const first = event.schedules?.[0];
  const sessions = event.schedules?.length ?? 0;

  const startStr = first?.start_date ?? event.start_date?.split('T')[0] ?? '';

  // ---- Recurring ----
  if (event.is_recurring) {
    const startDate = startStr ? new Date(`${startStr}T12:00:00Z`) : null;
    const startLabel = startDate
      ? startDate
          .toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })
          .toUpperCase()
      : badge.month;

    return {
      mode: 'recurring',
      lines: [startLabel],
    };
  }

  // ---- Multi-day ----
  if (event.is_multi_day && sessions > 1) {
    const last = event.schedules?.[sessions - 1]?.start_date;
    if (startStr && last) {
      const startDate = new Date(`${startStr}T12:00:00Z`);
      const endDate = new Date(`${last}T12:00:00Z`);

      const startMonth = startDate
        .toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
        .toUpperCase();
      const endMonth = endDate
        .toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
        .toUpperCase();
      const year = endDate.getUTCFullYear();

      const sameMonth = startMonth === endMonth;
      const rangeLabel = sameMonth
        ? `${startMonth} ${startDate.getUTCDate()} → ${endDate.getUTCDate()} · ${year}`
        : `${startMonth} ${startDate.getUTCDate()} → ${endMonth} ${endDate.getUTCDate()} · ${year}`;

      return { mode: 'multi-day', lines: [rangeLabel] };
    }
  }

  // ---- Single ----
  return {
    mode: 'single',
    lines: [
      `${badge.month} ${badge.day}`,
      badge.weekday.toUpperCase(),
      badge.timeRange,
    ],
  };
}

// ============================================================
// COMPONENT
// ============================================================

export function EventCard({ event, onClick, featured = false }: EventCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: teamsData } = useGetUserTeamsQuery();

  const memberTeamIds = useMemo(
    () => new Set((teamsData?.teams ?? []).map((t) => t.id)),
    [teamsData],
  );

  const isPrivate = event.visibility === 'private' || event.is_private === true;
  const isMemberOfOwningTeam = event.team_id
    ? memberTeamIds.has(event.team_id)
    : false;

  const owningTeam = useMemo(
    () => teamsData?.teams?.find((t) => t.id === event.team_id) ?? null,
    [teamsData, event.team_id],
  );

  const eventAccountId = owningTeam?.account_id ?? null;

  const typeName = getEventTypeName(event);
  const typeColor = getEventTypeColor(event);
  const typeIcon = getEventTypeIcon(event.event_type?.slug);

  const { fullDate } = formatEventDateBadge(event);
  const dateSummary = formatEventDateSummary(event);
  const badgeMeta = getDateBadgeMeta(event);

  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);

  const price = getEventMinPrice(event);
  const isFree = isEventFree(event);

  const hasCertificate = event.certificate_enabled === true;

  const isPast = isEventPast(event);
  const isFullyBooked = isEventFullyBooked(event);
  const spotsLeft = getSpotsLeft(event);
  const isLowAvailability =
    spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;

  const fillRate = getEventFillRate(event);
  const location = getEventLocation(event);

  const isDashboardDestination = isPrivate || isMemberOfOwningTeam;

  const publicDetailHref = `/events/${event.slug}`;
  const dashboardDetailHref =
    isDashboardDestination && eventAccountId && event.team_id
      ? `/dashboard/${eventAccountId}/${event.team_id}/events/${event.id}`
      : null;

  const detailHref = dashboardDetailHref ?? publicDetailHref;
  const registerHref = publicDetailHref;

  const canInteract = !isPast && !isFullyBooked;

  const handleCardClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    router.push(detailHref);
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canInteract) return;
    router.push(registerHref);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: wire up share sheet
  };

  const getGlowColor = () => {
    if (featured || event.is_featured) {
      return {
        from: 'from-secondary-500/20',
        via: 'via-secondary-400/10',
        to: 'to-transparent',
        shadow: 'shadow-secondary-500/20',
      };
    }
    if (isFree) {
      return {
        from: 'from-tertiary-500/20',
        via: 'via-tertiary-400/10',
        to: 'to-transparent',
        shadow: 'shadow-tertiary-500/20',
      };
    }
    return {
      from: 'from-primary-500/20',
      via: 'via-primary-400/10',
      to: 'to-transparent',
      shadow: 'shadow-primary-500/20',
    };
  };

  const glow = getGlowColor();

  const organizerLogoUrl = event.organizer?.avatar_url ?? null;
  const organizerIsPersonal = (event.organizer?.type ?? '').includes(
    'personal',
  );
  const AccountFallbackIcon = organizerIsPersonal ? Home : Building2;

  const accountLogo = organizerLogoUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={organizerLogoUrl}
      alt={event.organizer?.display_name ?? hostName}
      className="h-full w-full object-cover"
    />
  ) : (
    <AccountFallbackIcon className="h-3.5 w-3.5" />
  );

  // ============================================================
  // PILL RENDER
  // ============================================================

  const renderPillLines = () => {
    if (badgeMeta.mode === 'single') {
      return (
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex flex-col items-center leading-none">
            <span className="text-[8px] sm:text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              {badgeMeta.lines[0].split(' ')[0]}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-foreground leading-none">
              {badgeMeta.lines[0].split(' ')[1]}
            </span>
          </div>
          <div className="w-px h-7 sm:h-10 bg-border" />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">
              {badgeMeta.lines[1]}
            </span>
            <span className="text-[11px] sm:text-sm font-semibold text-foreground whitespace-nowrap">
              {badgeMeta.lines[2]}
            </span>
          </div>
        </div>
      );
    }

    if (badgeMeta.mode === 'recurring') {
      // Loud, unmistakable "STARTS" block for recurring series.
      return (
        <div className="flex flex-col leading-none gap-1">
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-extrabold tracking-[0.15em] uppercase text-amber-600 dark:text-amber-400">
            <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Starts
          </span>
          <span className="text-sm sm:text-lg font-extrabold text-foreground whitespace-nowrap">
            {badgeMeta.lines[0]}
          </span>
        </div>
      );
    }

    // multi-day
    return (
      <div className="flex flex-col leading-none">
        <span className="text-[11px] sm:text-sm font-extrabold text-foreground whitespace-nowrap">
          {badgeMeta.lines[0]}
        </span>
      </div>
    );
  };

  return (
    <div
      className="block h-full cursor-pointer"
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      <Card
        className={cn(
          'group relative flex flex-col h-full p-0 border border-border overflow-hidden rounded-2xl bg-card text-card-foreground transition-all duration-500 ease-out',
          'shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
          isHovered && [
            'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] -translate-y-2',
            glow.shadow,
          ],
          featured &&
            'ring-2 ring-secondary-400/40 shadow-lg shadow-secondary-100/50 dark:shadow-secondary-900/20',
        )}
      >
        {/* Glow containers */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none rounded-2xl',
            isHovered && 'opacity-100',
          )}
        >
          <div
            className={cn(
              'absolute -inset-1 bg-gradient-to-r rounded-2xl blur-2xl',
              glow.from,
              glow.via,
              glow.to,
            )}
          />
        </div>

        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none',
            isHovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-r',
              'from-transparent via-white/20 to-transparent dark:via-white/5',
            )}
          />
        </div>

        {/* ---- Image ---- */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.display_name || event.name}
              fill
              unoptimized
              className={cn(
                'object-cover transition-all duration-700 ease-out',
                isHovered ? 'scale-105' : 'scale-100',
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={featured}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted text-muted-foreground">
              <CalendarDays className="h-16 w-16 stroke-1 opacity-50" />
              <span className="text-sm font-medium text-muted-foreground mt-2">
                No Image Available
              </span>
            </div>
          )}

          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 pointer-events-none',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Date pill */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
            <div
              className={cn(
                'flex items-center bg-background/95 backdrop-blur-md rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 border border-border transition-all duration-300',
                isHovered
                  ? 'shadow-2xl shadow-black/20 scale-105'
                  : 'shadow-lg shadow-black/10',
              )}
              title={fullDate}
            >
              {renderPillLines()}
            </div>
          </div>

          {/* Featured */}
          {event.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-600 text-white border-0 shadow-lg shadow-secondary-500/40 px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold rounded-full animate-pulse">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Featured
              </Badge>
            </div>
          )}

          {/* Event type + Recurring */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            <Badge
              className="border-0 shadow-lg shadow-black/20 px-2.5 sm:px-3 py-1 sm:py-1.5 text-white text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md rounded-full"
              style={{ backgroundColor: typeColor }}
            >
              {typeIcon}
              <span className="hidden xs:inline">{typeName}</span>
            </Badge>

            {event.is_recurring && (
              <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-border shadow-lg text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <RefreshCw className="h-3 w-3" />
                <span className="hidden xs:inline">Recurring</span>
              </Badge>
            )}
          </div>

          {/* Virtual */}
          {event.is_virtual && (
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
              <Badge className="bg-primary-500/90 backdrop-blur-md text-white border-0 shadow-lg shadow-primary-500/30 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Virtual</span>
                <span className="xs:hidden">Online</span>
              </Badge>
            </div>
          )}

          {/* Private */}
          {isPrivate && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-foreground/90 text-background backdrop-blur-md border-0 shadow-lg text-[10px] sm:text-[11px] font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                Private
              </Badge>
            </div>
          )}

          {/* Low availability */}
          {isLowAvailability && canInteract && spotsLeft !== null && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-sm text-white border-0 shadow-lg shadow-amber-500/40 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full animate-pulse">
                <ClockIcon className="h-3 w-3" />
                Only {spotsLeft} left!
              </Badge>
            </div>
          )}

          {/* Fully booked */}
          {isFullyBooked && !isPast && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-2xl shadow-red-500/40 text-sm font-bold px-6 py-3 rounded-full">
                Fully Booked
              </Badge>
            </div>
          )}

          {/* Past */}
          {isPast && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Badge className="bg-foreground/90 text-background border-0 shadow-2xl text-sm font-bold px-6 py-3 rounded-full">
                Event Ended
              </Badge>
            </div>
          )}
        </div>

        {/* ---- Content ---- */}
        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col gap-2.5 sm:gap-3 relative z-10">
          {/* Host */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
              <span className="truncate flex items-center gap-1.5">
                <span className="text-muted-foreground hidden xs:inline">
                  Hosted by
                </span>
                <span className="font-semibold text-foreground hover:text-primary-500 transition-colors flex items-center gap-1.5 min-w-0">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md',
                      organizerIsPersonal
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
                    )}
                  >
                    {accountLogo}
                  </span>
                  <span className="truncate">{hostName}</span>
                </span>
                {hostIsInstitution && (
                  <span className="hidden xs:inline-flex items-center gap-1 flex-shrink-0">
                    <Award className="h-3.5 w-3.5 text-primary-500" />
                    <span className="text-[8px] sm:text-[9px] font-medium text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/50">
                      Verified
                    </span>
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleLike}
                className={cn(
                  'p-1.5 rounded-full transition-all duration-300',
                  isLiked
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                aria-label={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-all duration-300',
                    isLiked && 'fill-red-500 scale-110',
                  )}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
                aria-label="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-primary-500 transition-colors">
            {event.display_name || event.name}
          </h3>

          {/* Date summary */}
          <div
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/80"
            title={fullDate}
          >
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500 flex-shrink-0" />
            <span className="truncate">{dateSummary}</span>
          </div>

          {/* Location */}
          {location && location !== 'TBD' && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <div className="h-px bg-border my-1" />

          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Registration Fee
            </span>
            <span
              className={cn(
                'text-2xl sm:text-3xl font-bold',
                isFree
                  ? 'text-tertiary-600 dark:text-tertiary-400'
                  : 'text-primary-600 dark:text-primary-400',
              )}
            >
              {formatPrice(price)}
            </span>
          </div>

          {/* Certificate */}
          {hasCertificate && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/60 px-3 py-1.5 sm:py-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Certificate of completion included
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-2 flex flex-col gap-2 sm:flex-row sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                router.push(detailHref);
              }}
              className="cursor-pointer gap-1.5 font-semibold h-11 w-full rounded-xl text-sm sm:h-10 sm:flex-1 sm:rounded-full sm:text-xs border-border hover:bg-accent"
            >
              <span>View details</span>
              <ArrowUpRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>

            {canInteract && (
              <Button
                type="button"
                onClick={handleRegisterClick}
                className={cn(
                  'cursor-pointer gap-1.5 font-semibold shadow-md hover:shadow-lg transition-all duration-300',
                  'h-11 w-full rounded-xl text-sm',
                  'sm:h-10 sm:flex-1 sm:rounded-full sm:text-xs',
                  isFree
                    ? 'bg-gradient-to-r from-tertiary-500 to-tertiary-600 hover:from-tertiary-600 hover:to-tertiary-700 text-white'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white',
                  'hover:scale-[1.02]',
                )}
              >
                <span>{isFree ? 'Register' : 'Get Ticket'}</span>
                <ArrowUpRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </Button>
            )}
          </div>

          {/* Spots */}
          {canInteract && spotsLeft !== null && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    spotsLeft <= 5
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-tertiary-400 to-tertiary-500',
                  )}
                  style={{ width: `${fillRate}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm font-semibold whitespace-nowrap',
                  spotsLeft <= 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-tertiary-600 dark:text-tertiary-400',
                )}
              >
                {spotsLeft} left
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}