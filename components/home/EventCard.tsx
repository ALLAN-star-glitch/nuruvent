// components/home/EventCard.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowUpRight, 
  User, 
  Building2, 
  Video, 
  Briefcase,
  Presentation,
  GraduationCap,
  Users2,
  Mic2,
  BookOpen,
  Handshake,
  CalendarDays,
  Award,
  Clock as ClockIcon,
  BadgeCheck,
  FileText,
  Sparkles,
  Heart,
  Share2,
  Eye,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { JSX } from 'react/jsx-runtime';
import { useState } from 'react';
import { EventResponse, EventTypeResponse } from '@/lib/store/api/eventsApi';

interface EventCardProps {
  event: EventResponse;
  onClick?: () => void;
  featured?: boolean;
  eventTypes?: EventTypeResponse[];
}

const isInstitutionAccount = (accountType: string): boolean => {
  if (!accountType) return false;
  const normalized = accountType.toLowerCase().trim();
  return normalized === 'institution' || 
         normalized === 'account-type-institution' ||
         normalized === 'account_type_institution' ||
         normalized.includes('institution');
};

const getEventTypeIcon = (typeId: string, eventTypes?: EventTypeResponse[]) => {
  if (!eventTypes || !typeId) return <Briefcase className="h-3.5 w-3.5" />;
  
  const found = eventTypes.find((t) => t.id === typeId);
  if (found) {
    const slug = found.slug?.toLowerCase() || found.name?.toLowerCase() || '';
    if (slug.includes('workshop')) return <Briefcase className="h-3.5 w-3.5" />;
    if (slug.includes('webinar')) return <Presentation className="h-3.5 w-3.5" />;
    if (slug.includes('bootcamp')) return <GraduationCap className="h-3.5 w-3.5" />;
    if (slug.includes('meetup')) return <Users2 className="h-3.5 w-3.5" />;
    if (slug.includes('conference')) return <Mic2 className="h-3.5 w-3.5" />;
    if (slug.includes('seminar')) return <BookOpen className="h-3.5 w-3.5" />;
    if (slug.includes('networking')) return <Handshake className="h-3.5 w-3.5" />;
  }
  return <Briefcase className="h-3.5 w-3.5" />;
};

const getEventTypeInfo = (typeId: string, eventTypes?: EventTypeResponse[]) => {
  if (!eventTypes || !typeId) {
    return { label: 'Event', color: 'var(--color-neutral-gray)' };
  }
  const found = eventTypes.find((t) => t.id === typeId);
  if (found) {
    return { 
      label: found.display_name || found.name || 'Event', 
      color: found.color || 'var(--color-neutral-gray)' 
    };
  }
  return { label: 'Event', color: 'var(--color-neutral-gray)' };
};

const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

const getCreatorDisplay = (event: EventResponse): { 
  name: string; 
  icon: JSX.Element; 
  type: string;
  isVerified?: boolean;
} => {
  const creator = event.creator;
  if (!creator) {
    return { 
      name: 'Host', 
      icon: <User className="h-3.5 w-3.5 text-neutral-400" />, 
      type: 'host',
      isVerified: false,
    };
  }
  
  if (isInstitutionAccount(creator.account_type) && creator.institution_name) {
    return { 
      name: creator.institution_name, 
      icon: <Building2 className="h-3.5 w-3.5 text-primary-500" />, 
      type: 'institution',
      isVerified: true,
    };
  }
  
  return { 
    name: creator.display_name || creator.name || 'Host', 
    icon: <User className="h-3.5 w-3.5 text-neutral-400" />, 
    type: 'individual',
    isVerified: false,
  };
};

function formatEventDateDetails(dateStr: string, timeStr: string) {
  const date = new Date(dateStr);
  const isValidDate = !isNaN(date.getTime());
  return {
    month: isValidDate ? date.toLocaleDateString('en-US', { month: 'short' }) : 'DEC',
    day: isValidDate ? date.getDate() : '--',
    weekday: isValidDate ? date.toLocaleDateString('en-US', { weekday: 'short' }) : '---',
    time: timeStr || 'TBD',
    fullDate: isValidDate ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'
  };
}

export function EventCard({ event, onClick, featured = false, eventTypes }: EventCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const eventTypeInfo = getEventTypeInfo(event.event_type_id, eventTypes);
  const eventTypeIcon = getEventTypeIcon(event.event_type_id, eventTypes);
  const { month, day, time, weekday } = formatEventDateDetails(event.date, event.time);
  const creator = getCreatorDisplay(event);
  const isFree = event.price === 0;
  const isPast = new Date(event.date) < new Date();
  const isFullyBooked = event.current_attendees >= event.max_attendees && event.max_attendees > 0;
  const spotsLeft = event.max_attendees > 0 ? event.max_attendees - event.current_attendees : 0;
  const isLowAvailability = spotsLeft > 0 && spotsLeft <= 5;
  const hasCertificate = event.certificate_price > 0;
  const attendanceRate = event.max_attendees > 0 ? (event.current_attendees / event.max_attendees) * 100 : 0;

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

  // Generate random glow color based on event type or featured status
  const getGlowColor = () => {
    if (featured || event.is_featured) {
      return {
        from: 'from-secondary-500/20',
        via: 'via-secondary-400/10',
        to: 'to-transparent',
        shadow: 'shadow-secondary-500/20'
      };
    }
    if (isFree) {
      return {
        from: 'from-tertiary-500/20',
        via: 'via-tertiary-400/10',
        to: 'to-transparent',
        shadow: 'shadow-tertiary-500/20'
      };
    }
    if (eventTypeInfo.color) {
      const color = eventTypeInfo.color.replace('var(--color-', '').replace(')', '');
      return {
        from: `from-${color}-500/20`,
        via: `via-${color}-400/10`,
        to: 'to-transparent',
        shadow: `shadow-${color}-500/20`
      };
    }
    return {
      from: 'from-primary-500/20',
      via: 'via-primary-400/10',
      to: 'to-transparent',
      shadow: 'shadow-primary-500/20'
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handleNavigate(e as any);
        }
      }}
    >
      <Card 
        className={cn(
          "group relative flex flex-col h-full p-0 border border-neutral-100/80 overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-out",
          "shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
          isHovered && [
            "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] -translate-y-2",
            glow.shadow
          ],
          featured && "ring-2 ring-secondary-400/40 shadow-lg shadow-secondary-100/50"
        )}
      >
        {/* Glow Effect Container */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none rounded-2xl",
          isHovered && "opacity-100"
        )}>
          <div className={cn(
            "absolute -inset-1 bg-gradient-to-r rounded-2xl blur-2xl",
            glow.from,
            glow.via,
            glow.to
          )} />
        </div>

        {/* Inner Glow Border */}
        <div className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <div className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-r",
            "from-transparent via-white/20 to-transparent"
          )} />
        </div>

        {/* Image Container */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 flex-shrink-0">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.display_name || event.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                isHovered ? "scale-105" : "scale-100"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={featured}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-300">
              <CalendarDays className="h-16 w-16 stroke-1 opacity-50" />
              <span className="text-sm font-medium text-neutral-400 mt-2">No Image Available</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )} />
          
          {/* Shimmer Effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transition-opacity duration-700 pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Date Badge - Enhanced with glass morphism and glow */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className={cn(
              "flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-white/20 transition-all duration-300",
              isHovered ? "shadow-2xl shadow-black/20 scale-105" : "shadow-lg shadow-black/10"
            )}>
              <div className="flex flex-col items-center leading-none">
                <span className="text-[8px] sm:text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                  {month}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-none">
                  {day}
                </span>
              </div>
              <div className="w-px h-8 sm:h-10 bg-neutral-200" />
              <div className="flex flex-col leading-none">
                <span className="text-[8px] sm:text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                  {weekday}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900">{time}</span>
              </div>
            </div>
          </div>

          {/* Featured Badge - Glowing with gradient */}
          {event.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-600 text-white border-0 shadow-lg shadow-secondary-500/40 px-3 py-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold rounded-full animate-pulse">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Featured
              </Badge>
            </div>
          )}

          {/* Event Type Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              className="border-0 shadow-lg shadow-black/20 px-3 py-1.5 text-white text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md rounded-full"
              style={{ backgroundColor: eventTypeInfo.color }}
            >
              {eventTypeIcon}
              {eventTypeInfo.label}
            </Badge>
          </div>

          {/* Virtual Badge */}
          {event.is_virtual && (
            <div className="absolute bottom-4 right-4 z-10">
              <Badge className="bg-primary-500/90 backdrop-blur-md text-white border-0 shadow-lg shadow-primary-500/30 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full">
                <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Virtual</span>
                <span className="xs:hidden">Online</span>
              </Badge>
            </div>
          )}

          {/* Availability Badge */}
          {isLowAvailability && !isPast && !isFullyBooked && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-sm text-white border-0 shadow-lg shadow-amber-500/40 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse">
                <ClockIcon className="h-3 w-3" />
                Only {spotsLeft} spots left!
              </Badge>
            </div>
          )}

          {/* Fully Booked Badge */}
          {isFullyBooked && !isPast && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-2xl shadow-red-500/40 text-sm font-bold px-6 py-3 rounded-full">
                Fully Booked
              </Badge>
            </div>
          )}

          {/* Past Event Overlay */}
          {isPast && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Badge className="bg-neutral-800/90 text-white border-0 shadow-2xl text-sm font-bold px-6 py-3 rounded-full">
                Event Ended
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col gap-2.5 sm:gap-3 relative z-10">
          {/* Host & Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 min-w-0">
              <span className="truncate flex items-center gap-1.5">
                <span className="text-neutral-400 hidden xs:inline">Hosted by</span>
                <span className="font-semibold text-neutral-700 hover:text-primary-500 transition-colors flex items-center gap-1.5">
                  {creator.icon}
                  <span className="truncate">{creator.name}</span>
                </span>
                {creator.type === 'institution' && creator.isVerified && (
                  <span className="inline-flex items-center gap-1 flex-shrink-0">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary-500" />
                    <span className="text-[8px] sm:text-[9px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full border border-primary-100">
                      Verified
                    </span>
                  </span>
                )}
              </span>
            </div>
            
            {/* Like & Share Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleLike}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isLiked 
                    ? "bg-red-50 text-red-500 hover:bg-red-100" 
                    : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                )}
              >
                <Heart className={cn(
                  "h-3.5 w-3.5 transition-all duration-300",
                  isLiked && "fill-red-500 scale-110"
                )} />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-full bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-300"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-primary-500 transition-colors">
            {event.display_name || event.name}
          </h3>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 my-1" />

          {/* Pricing Section */}
          <div className="flex flex-col gap-2 pt-0.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Registration Fee
                </span>
                <span className={cn(
                  "text-2xl sm:text-3xl font-bold",
                  isFree ? "text-tertiary-600" : "text-primary-600"
                )}>
                  {formatPrice(event.price)}
                </span>
              </div>
              
              <Button 
                size="default"
                className={cn(
                  "rounded-full font-semibold text-xs sm:text-sm px-5 sm:px-7 h-9 sm:h-11 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer",
                  isFree 
                    ? "bg-gradient-to-r from-tertiary-500 to-tertiary-600 hover:from-tertiary-600 hover:to-tertiary-700 text-white" 
                    : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white",
                  (isPast || isFullyBooked) && "opacity-50 cursor-not-allowed hover:shadow-md",
                  !isPast && !isFullyBooked && "hover:scale-105"
                )}
                onClick={handleButtonClick}
                disabled={isPast || isFullyBooked}
                type="button"
              >
                <span>
                  {isPast ? 'Ended' : isFullyBooked ? 'Full' : isFree ? 'Register' : 'Get Ticket'}
                </span>
                {!isPast && !isFullyBooked && (
                  <ArrowUpRight className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 transition-all duration-300",
                    isHovered ? "translate-x-0.5 -translate-y-0.5" : ""
                  )} />
                )}
              </Button>
            </div>

            {/* Certificate Fee */}
            {hasCertificate && event.certificate_price > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50/80 to-amber-100/40 rounded-lg px-3 py-1.5 sm:py-2 border border-amber-200/60 mt-0.5">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-amber-700">
                  Certificate Fee:
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-800">
                  {formatPrice(event.certificate_price)}
                </span>
              </div>
            )}
          </div>

          {/* Spots Left Indicator */}
          {!isPast && !isFullyBooked && event.max_attendees > 0 && (
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    spotsLeft <= 5 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-tertiary-400 to-tertiary-500"
                  )}
                  style={{ 
                    width: `${Math.min(attendanceRate, 100)}%` 
                  }}
                />
              </div>
              <span className={cn(
                "text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300",
                spotsLeft <= 5 ? "text-amber-600" : "text-tertiary-600"
              )}>
                {spotsLeft} left
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}