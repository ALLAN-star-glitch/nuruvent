// components/home/EventCard.tsx

'use client';

import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  User, 
  Building2, 
  Video, 
  CheckCircle2,
  Briefcase,
  Presentation,
  GraduationCap,
  Users2,
  Mic2,
  BookOpen,
  Handshake,
  CalendarDays,
  Ticket,
  Eye,
  Tag,
  DollarSign,
  Award
} from 'lucide-react';
import { EventResponse, EventTypeResponse } from '@/lib/store/api/eventsApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { JSX } from 'react/jsx-runtime';

interface EventCardProps {
  event: EventResponse;
  onClick?: () => void;
  featured?: boolean;
  eventTypes?: EventTypeResponse[];
}

// ✅ Map event type ID to icon component
const getEventTypeIcon = (typeId: string, eventTypes?: EventTypeResponse[]) => {
  if (!eventTypes || !typeId) {
    return <Briefcase className="h-3.5 w-3.5" />;
  }
  
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
    
    return <Briefcase className="h-3.5 w-3.5" />;
  }
  
  return <Briefcase className="h-3.5 w-3.5" />;
};

// ✅ Get event type label and color
const getEventTypeInfo = (typeId: string, eventTypes?: EventTypeResponse[]) => {
  if (!eventTypes || !typeId) {
    return { label: 'Event', color: 'var(--color-neutral-gray)' };
  }
  
  const found = eventTypes.find((t) => t.id === typeId);
  if (found) {
    return { 
      label: found.name || 'Event', 
      color: found.color || 'var(--color-neutral-gray)' 
    };
  }
  
  return { label: 'Event', color: 'var(--color-neutral-gray)' };
};

const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

const getCreatorDisplay = (event: EventResponse): { name: string; icon: JSX.Element; type: string } => {
  const creator = event.creator;
  if (!creator) {
    return { name: 'Host', icon: <User className="h-3.5 w-3.5 text-neutral-400" />, type: 'host' };
  }
  
  if (creator.account_type === 'institution' && creator.institution_name) {
    return { 
      name: creator.institution_name, 
      icon: <Building2 className="h-3.5 w-3.5 text-neutral-400" />, 
      type: 'institution' 
    };
  }
  
  return { 
    name: creator.name || 'Host', 
    icon: <User className="h-3.5 w-3.5 text-neutral-400" />, 
    type: 'individual' 
  };
};

export function EventCard({ event, onClick, featured = false, eventTypes }: EventCardProps) {
  const eventTypeInfo = getEventTypeInfo(event.event_type_id, eventTypes);
  const eventTypeIcon = getEventTypeIcon(event.event_type_id, eventTypes);
  const { month, day, time, fullDate, weekday } = formatEventDateDetails(event.date, event.time);
  const creator = getCreatorDisplay(event);
  const isFree = event.price === 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <Card 
      className={cn(
        "group relative flex flex-col h-full p-0 border border-neutral-100/80 overflow-hidden rounded-2xl bg-white transition-all duration-300",
        "shadow-sm hover:shadow-xl hover:-translate-y-1.5 cursor-pointer",
        featured && "ring-2 ring-secondary-400/40 shadow-md shadow-secondary-100/50"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-50 flex-shrink-0">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.display_name || event.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={featured}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-300">
            <CalendarDays className="h-12 w-12 stroke-1" />
            <span className="text-sm font-medium text-neutral-400 mt-2">No Image Available</span>
          </div>
        )}
        
        {/* Date Badge - Enhanced with better visibility */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 shadow-lg shadow-black/10">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-bold tracking-wider text-secondary-500 uppercase">
                {month}
              </span>
              <span className="text-2xl font-extrabold text-neutral-900 leading-none">
                {day}
              </span>
            </div>
            <div className="w-px h-10 bg-neutral-200" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                {weekday}
              </span>
              <span className="text-sm font-semibold text-neutral-900">{time}</span>
            </div>
          </div>
        </div>

        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white border-0 shadow-lg shadow-secondary-500/30 px-3 py-1 flex items-center gap-1.5 text-[11px] font-semibold rounded-full">
              <Award className="h-3.5 w-3.5" />
              Featured
            </Badge>
          </div>
        )}

        {/* Event Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge 
            className="border-0 shadow-lg shadow-black/10 px-3 py-1 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm rounded-full"
            style={{ backgroundColor: eventTypeInfo.color }}
          >
            {eventTypeIcon}
            {eventTypeInfo.label}
          </Badge>
        </div>

        {/* Virtual Badge */}
        {event.is_virtual && (
          <div className="absolute bottom-4 right-4 z-10">
            <Badge className="bg-primary-500/90 backdrop-blur-md text-white border-0 shadow-lg shadow-primary-500/30 text-[11px] font-medium flex items-center gap-1.5 px-3 py-1 rounded-full">
              <Video className="h-3.5 w-3.5" />
              Virtual Event
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-5 flex-1 flex flex-col gap-2">
        {/* Host */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="truncate flex items-center gap-1.5">
            <span className="text-neutral-400">Hosted by</span>
            <span className="font-semibold text-neutral-700 hover:text-primary-500 transition-colors">
              {creator.name}
            </span>
          </span>
          {creator.type === 'institution' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-tertiary-500 flex-shrink-0" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-neutral-900 text-lg leading-snug line-clamp-2 group-hover:text-primary-500 transition-colors">
          {event.display_name || event.name}
        </h3>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1 text-sm text-neutral-600">
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-1.5">
            <Users className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <span className="font-medium">
              {event.current_attendees || 0} / {event.max_attendees || '∞'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-1.5">
            <Ticket className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <span className={cn(
              "font-semibold",
              isFree ? "text-tertiary-600" : "text-primary-500"
            )}>
              {formatPrice(event.price)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-100 my-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              {isFree ? 'Complimentary' : 'Registration Fee'}
            </span>
            <div className="flex items-center gap-1.5">
              {!isFree && <DollarSign className="h-4 w-4 text-primary-500" />}
              <span className={cn(
                "text-lg font-bold",
                isFree ? "text-tertiary-600" : "text-primary-500"
              )}>
                {formatPrice(event.price)}
              </span>
              {!isFree && (
                <span className="text-[10px] text-neutral-400 font-medium">
                  per person
                </span>
              )}
            </div>
          </div>

          <Button 
            size="default"
            className={cn(
              "rounded-full font-semibold text-sm px-6 h-10 shadow-md hover:shadow-lg transition-all duration-200",
              isFree 
                ? "bg-tertiary-500 hover:bg-tertiary-600 text-white" 
                : "bg-primary-500 hover:bg-primary-600 text-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <span>{isFree ? 'Register Now' : 'Get Ticket'}</span>
            <ArrowUpRight className="h-4 w-4 ml-1.5 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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