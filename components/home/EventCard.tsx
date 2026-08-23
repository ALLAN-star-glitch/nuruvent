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
    return <Briefcase className="h-3 w-3" />;
  }
  
  const found = eventTypes.find((t) => t.id === typeId);
  if (found) {
    const slug = found.slug?.toLowerCase() || found.name?.toLowerCase() || '';
    
    if (slug.includes('workshop')) return <Briefcase className="h-3 w-3" />;
    if (slug.includes('webinar')) return <Presentation className="h-3 w-3" />;
    if (slug.includes('bootcamp')) return <GraduationCap className="h-3 w-3" />;
    if (slug.includes('meetup')) return <Users2 className="h-3 w-3" />;
    if (slug.includes('conference')) return <Mic2 className="h-3 w-3" />;
    if (slug.includes('seminar')) return <BookOpen className="h-3 w-3" />;
    if (slug.includes('networking')) return <Handshake className="h-3 w-3" />;
    
    return <Briefcase className="h-3 w-3" />;
  }
  
  return <Briefcase className="h-3 w-3" />;
};

// ✅ Get event type label and color
const getEventTypeInfo = (typeId: string, eventTypes?: EventTypeResponse[]) => {
  if (!eventTypes || !typeId) {
    return { label: 'Event', color: '#64748b' };
  }
  
  const found = eventTypes.find((t) => t.id === typeId);
  if (found) {
    return { 
      label: found.name || 'Event', 
      color: found.color || '#64748b' 
    };
  }
  
  return { label: 'Event', color: '#64748b' };
};

const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  if (price >= 1000) return `KSh ${(price / 1000).toFixed(1)}K`;
  return `KSh ${price}`;
};

const getCreatorDisplay = (event: EventResponse): { name: string; icon: JSX.Element; type: string } => {
  const creator = event.creator;
  if (!creator) {
    return { name: 'Host', icon: <User className="h-3.5 w-3.5 text-slate-400" />, type: 'host' };
  }
  
  if (creator.account_type === 'institution' && creator.institution_name) {
    return { 
      name: creator.institution_name, 
      icon: <Building2 className="h-3.5 w-3.5 text-slate-400" />, 
      type: 'institution' 
    };
  }
  
  return { 
    name: creator.name || 'Host', 
    icon: <User className="h-3.5 w-3.5 text-slate-400" />, 
    type: 'individual' 
  };
};

export function EventCard({ event, onClick, featured = false, eventTypes }: EventCardProps) {
  const eventTypeInfo = getEventTypeInfo(event.event_type_id, eventTypes);
  const eventTypeIcon = getEventTypeIcon(event.event_type_id, eventTypes);
  const { month, day, time } = formatEventDateDetails(event.date, event.time);
  const creator = getCreatorDisplay(event);

  return (
    <Card 
      className={cn(
        "group relative flex flex-col h-full p-0 pt-0 border-0 overflow-hidden rounded-2xl bg-white transition-all duration-300",
        "shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer ring-1 ring-slate-200/80",
        featured && "ring-amber-400/50 shadow-md"
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
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 flex-shrink-0 rounded-t-2xl">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.name} // ✅ Changed to event.name
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={featured}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900/5 text-slate-300">
            <Calendar className="h-10 w-10 stroke-1 mb-1" />
          </div>
        )}
        
        {/* Subtle Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Floating Date Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center min-w-[3.25rem] px-2 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20">
          <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase leading-none">
            {month}
          </span>
          <span className="text-base font-extrabold text-slate-900 leading-none mt-1">
            {day}
          </span>
        </div>

        {/* Top Right Badges */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {event.is_featured && (
            <Badge className="bg-amber-500/90 hover:bg-amber-500 backdrop-blur-md text-white border-0 shadow-sm text-xs px-2.5 py-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 fill-current" />
              <span>Featured</span>
            </Badge>
          )}

          {/* Event Type Badge with icon and color */}
          <Badge 
            className="backdrop-blur-md text-white border-0 text-xs px-2.5 py-1 font-medium flex items-center gap-1"
            style={{ backgroundColor: eventTypeInfo.color }}
          >
            {eventTypeIcon}
            {eventTypeInfo.label}
          </Badge>
        </div>

        {/* Bottom Virtual Badge */}
        {event.is_virtual && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-xs font-medium shadow-sm flex items-center gap-1 px-2.5 py-0.5">
              <Video className="h-3 w-3 text-indigo-600" />
              <span>Virtual Event</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Host / Institution Header */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
          {creator.icon}
          <span className="truncate">
            <span className="text-slate-400">By</span>{' '}
            <span className="text-slate-700 font-semibold">{creator.name}</span>
          </span>
          {creator.type === 'institution' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          )}
        </div>

        {/* Title - ✅ Now using event.name only */}
        <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 tracking-tight group-hover:text-primary transition-colors">
          {event.name}
        </h3>

        {/* Details List */}
        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{time}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {event.current_attendees || 0} / {event.max_attendees || '∞'} attending
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-[1rem]" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Price
            </span>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              {formatPrice(event.price)}
            </span>
          </div>

          <Button 
            size="sm" 
            className="rounded-xl font-medium transition-all group-hover:shadow-md text-xs px-4 h-9 cursor-pointer flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <span>Register</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
    time: timeStr || 'Time TBD'
  };
}