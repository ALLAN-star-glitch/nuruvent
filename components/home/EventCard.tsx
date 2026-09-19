// components/home/EventCard.tsx

'use client';

import { useState } from 'react';
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
  FileText,
  GraduationCap,
  Handshake,
  Heart,
  MapPin,
  Mic2,
  Presentation,
  Share2,
  Sparkles,
  User,
  Users2,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { Event } from '@/lib/types/events';
import {
  formatEventDateBadge,
  formatPrice,
  getCertificatePrice,
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
// COMPONENT
// ============================================================

export function EventCard({ event, onClick, featured = false }: EventCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const typeName = getEventTypeName(event);
  const typeColor = getEventTypeColor(event);
  const typeIcon = getEventTypeIcon(event.event_type?.slug);

  const { month, day, weekday, time } = formatEventDateBadge(event);

  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);

  const price = getEventMinPrice(event);
  const isFree = isEventFree(event);
  const certificatePrice = getCertificatePrice(event);

  const isPast = isEventPast(event);
  const isFullyBooked = isEventFullyBooked(event);
  const spotsLeft = getSpotsLeft(event);
  const isLowAvailability =
    spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;

  const hasCertificate = certificatePrice > 0;
  const fillRate = getEventFillRate(event);
  const location = getEventLocation(event);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      router.push(`/events/${event.slug}`);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isPast && !isFullyBooked) {
      router.push(`/events/${event.slug}`);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
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

  return (
    <div
      className="block h-full cursor-pointer"
      onClick={handleNavigate}
      role="link"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate(e as unknown as React.MouseEvent);
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
          featured && 'ring-2 ring-secondary-400/40 shadow-lg shadow-secondary-100/50 dark:shadow-secondary-900/20',
        )}
      >
        {/* Glow effect container */}
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

        {/* Inner glow border */}
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

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 pointer-events-none',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 z-10">
            <div
              className={cn(
                'flex items-center gap-3 bg-background/95 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-border transition-all duration-300',
                isHovered
                  ? 'shadow-2xl shadow-black/20 scale-105'
                  : 'shadow-lg shadow-black/10',
              )}
            >
              <div className="flex flex-col items-center leading-none">
                <span className="text-[8px] sm:text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                  {month}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground leading-none">
                  {day}
                </span>
              </div>
              <div className="w-px h-8 sm:h-10 bg-border" />
              <div className="flex flex-col leading-none">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {weekday}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {time}
                </span>
              </div>
            </div>
          </div>

          {/* Featured badge */}
          {event.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-600 text-white border-0 shadow-lg shadow-secondary-500/40 px-3 py-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold rounded-full animate-pulse">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Featured
              </Badge>
            </div>
          )}

          {/* Event type badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              className="border-0 shadow-lg shadow-black/20 px-3 py-1.5 text-white text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md rounded-full"
              style={{ backgroundColor: typeColor }}
            >
              {typeIcon}
              {typeName}
            </Badge>
          </div>

          {/* Virtual badge */}
          {event.is_virtual && (
            <div className="absolute bottom-4 right-4 z-10">
              <Badge className="bg-primary-500/90 backdrop-blur-md text-white border-0 shadow-lg shadow-primary-500/30 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full">
                <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Virtual</span>
                <span className="xs:hidden">Online</span>
              </Badge>
            </div>
          )}

          {/* Low availability */}
          {isLowAvailability && !isPast && !isFullyBooked && spotsLeft !== null && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-sm text-white border-0 shadow-lg shadow-amber-500/40 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse">
                <ClockIcon className="h-3 w-3" />
                Only {spotsLeft} spots left!
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

          {/* Past event */}
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
          {/* Host + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
              <span className="truncate flex items-center gap-1.5">
                <span className="text-muted-foreground hidden xs:inline">Hosted by</span>
                <span className="font-semibold text-foreground hover:text-primary-500 transition-colors flex items-center gap-1.5">
                  {hostIsInstitution ? (
                    <Building2 className="h-3.5 w-3.5 text-primary-500" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="truncate">{hostName}</span>
                </span>
                {hostIsInstitution && (
                  <span className="inline-flex items-center gap-1 flex-shrink-0">
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
                onClick={(e) => e.stopPropagation()}
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

          {/* Location */}
          {location && location !== 'TBD' && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border my-1" />

          {/* Pricing */}
          <div className="flex flex-col gap-2 pt-0.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Registration Fee
                </span>
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-bold',
                    isFree ? 'text-tertiary-600 dark:text-tertiary-400' : 'text-primary-600 dark:text-primary-400',
                  )}
                >
                  {formatPrice(price)}
                </span>
              </div>

              <Button
                size="default"
                className={cn(
                  'rounded-full font-semibold text-xs sm:text-sm px-5 sm:px-7 h-9 sm:h-11 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer',
                  isFree
                    ? 'bg-gradient-to-r from-tertiary-500 to-tertiary-600 hover:from-tertiary-600 hover:to-tertiary-700 text-white'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white',
                  (isPast || isFullyBooked) &&
                    'opacity-50 cursor-not-allowed hover:shadow-md',
                  !isPast && !isFullyBooked && 'hover:scale-105',
                )}
                onClick={handleButtonClick}
                disabled={isPast || isFullyBooked}
                type="button"
              >
                <span>
                  {isPast
                    ? 'Ended'
                    : isFullyBooked
                      ? 'Full'
                      : isFree
                        ? 'Register'
                        : 'Get Ticket'}
                </span>
                {!isPast && !isFullyBooked && (
                  <ArrowUpRight
                    className={cn(
                      'h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 transition-all duration-300',
                      isHovered ? 'translate-x-0.5 -translate-y-0.5' : '',
                    )}
                  />
                )}
              </Button>
            </div>

            {/* Certificate fee */}
            {hasCertificate && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50/80 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-950/10 rounded-lg px-3 py-1.5 sm:py-2 border border-amber-200/60 dark:border-amber-900/40 mt-0.5">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">
                  Certificate Fee:
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-200">
                  {formatPrice(certificatePrice)}
                </span>
              </div>
            )}
          </div>

          {/* Spots left bar */}
          {!isPast && !isFullyBooked && spotsLeft !== null && (
            <div className="flex items-center gap-3 mt-0.5">
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
                  'text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300',
                  spotsLeft <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-tertiary-600 dark:text-tertiary-400',
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