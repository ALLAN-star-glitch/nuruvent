// components/events/new/EventPreviewCard.tsx

'use client';

import {
  Calendar,
  Clock,
  DollarSign,
  Lock,
  MapPin,
  Star,
  Users,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { EventType as EventTypeModel } from '@/lib/types/events';

import type { EventFormData } from '../types';

// ============================================================
// EVENT PREVIEW CARD
// ============================================================

interface EventPreviewCardProps {
  data: EventFormData;
  eventType?: EventTypeModel;
}

function formatDate(date: string): string {
  if (!date) return 'TBD';
  const d = new Date(date);
  return isNaN(d.getTime())
    ? 'TBD'
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

function durationMinutes(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => isNaN(n))) return null;
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : null;
}

export function EventPreviewCard({ data, eventType }: EventPreviewCardProps) {
  const primarySchedule = data.schedules?.[0];
  const startDate = primarySchedule?.start_date ?? '';
  const startTime = primarySchedule?.start_time ?? '';
  const endTime = primarySchedule?.end_time ?? '';
  const duration =
    startTime && endTime ? durationMinutes(startTime, endTime) : null;

  const firstTicket = data.tickets?.find(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  );
  const ticketPrice = firstTicket?.price ?? null;
  const ticketCount = data.tickets?.filter(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  ).length ?? 0;

  let priceLabel: string;
  if (!firstTicket) {
    priceLabel = 'Free';
  } else if (ticketPrice === 0 || ticketPrice === null) {
    priceLabel = ticketCount > 1 ? 'Free–Paid' : 'Free';
  } else {
    priceLabel = `${ticketPrice} KES${ticketCount > 1 ? '+' : ''}`;
  }

  const locationText =
    primarySchedule?.location ||
    data.venue_name ||
    data.location ||
    'Location TBD';

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      {data.imagePreview ? (
        <div className="w-full h-48 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imagePreview}
            alt={data.name || 'Event preview'}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-10 w-10 text-primary/60 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Event Image</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title + badges */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-2 flex-1">
              {data.name || 'Untitled Event'}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {data.is_featured && (
                <Badge className="bg-secondary-500 text-white text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {data.is_private && (
                <Badge
                  variant="outline"
                  className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>

          {data.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {data.short_description}
            </p>
          )}
        </div>

        {/* Event type */}
        {eventType && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">
              {eventType.display_name || eventType.name}
            </span>
          </div>
        )}

        {/* Date + time */}
        {(startDate || startTime) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {formatDate(startDate)}
              {startTime && ` at ${startTime}`}
            </div>
          </div>
        )}

        {/* Location / virtual */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {data.is_virtual ? (
            <Video className="h-4 w-4 flex-shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{data.is_virtual ? 'Virtual Event' : locationText}</span>
        </div>

        {/* Price + capacity */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {priceLabel}
          </div>
          {data.capacity && data.capacity > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{data.capacity} spots</span>
            </div>
          )}
        </div>

        {/* Duration */}
        {duration && duration > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration} minutes</span>
          </div>
        )}
      </div>
    </div>
  );
}