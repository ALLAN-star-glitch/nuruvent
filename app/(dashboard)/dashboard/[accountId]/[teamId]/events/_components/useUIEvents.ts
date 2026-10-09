'use client';

import { useMemo } from 'react';
import type { Event } from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventLocation,
  getEventMinPrice,
  getEventStartTime,
  getEventStatusName,
} from '@/lib/utils/eventDisplay';
import type { UIEvent } from './types';

function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDurationMinutes(duration: string): number {
  if (!duration) return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
}

function toUIEvent(event: Event): UIEvent {
  const startDate = event.start_date ?? event.schedules?.[0]?.start_date ?? '';
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const minPrice = getEventMinPrice(event);
  const location = getEventLocation(event);
  const statusName = getEventStatusName(event);
  const typeName =
    event.event_type?.display_name || event.event_type?.name || 'Event';
  const isDeleted = Boolean(event.deleted_at);

  const cpdHours = event.event_type?.supports_certificate
    ? Math.round(parseDurationMinutes(duration) / 60)
    : 0;

  const platform = event.is_virtual
    ? event.zoom_link
      ? 'Zoom'
      : event.meet_link
        ? 'Google Meet'
        : 'Virtual'
    : 'In-Person';

  return {
    id: event.id,
    title: event.display_name || event.name || 'Untitled Event',
    eventTypeId: event.event_type?.id ?? '',
    eventStatusId: event.event_status?.id ?? '',
    typeDisplayName: typeName,
    statusDisplayName: statusName,
    type: typeName,
    status: statusName,
    date: startDate ? formatDateShort(startDate) : 'TBD',
    time: startTime,
    registered: event.current_attendees ?? 0,
    capacity: event.capacity ?? 0,
    priceDisplay: formatPrice(minPrice),
    priceValue: minPrice,
    platform,
    cpdHours,
    description: event.description || '',
    host: event.organizer?.id ?? '',
    location,
    image: event.image_url,
    slug: event.slug,
    rawDate: startDate,
    duration,
    certificatePrice: event.certificate_enabled
      ? event.certificate_price ?? 0
      : 0,
    isVirtual: event.is_virtual,
    isFeatured: event.is_featured,
    isPrivate: event.visibility === 'private',
    zoomLink: event.zoom_link,
    meetLink: event.meet_link,
    createdAt: event.created_at,
    publishedAt: event.published_at,
    deletedAt: event.deleted_at,
    isDeleted,
  };
}

interface UseUIEventsProps {
  rawEvents: Event[];
  activeTab: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

import type { SortField, SortDirection } from './types';

export function useUIEvents({
  rawEvents,
  activeTab,
  sortField,
  sortDirection,
}: UseUIEventsProps): UIEvent[] {
  return useMemo(() => {
    const ui = rawEvents.map(toUIEvent);

    let filtered = [...ui];

    if (activeTab === 'trash') {
      filtered = filtered.filter((e) => e.isDeleted);
    } else if (activeTab !== 'all') {
      const statusMap: Record<string, string> = {
        live: 'Published',
        upcoming: 'Published',
        draft: 'Draft',
        ended: 'Completed',
      };
      const target = statusMap[activeTab];
      if (target) {
        filtered = filtered.filter(
          (e) => !e.isDeleted && e.status === target,
        );
      }
    } else {
      filtered = filtered.filter((e) => !e.isDeleted);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'eventDate':
          cmp = new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
          break;
        case 'addedDate': {
          const da = a.publishedAt || a.createdAt;
          const db = b.publishedAt || b.createdAt;
          cmp = new Date(da).getTime() - new Date(db).getTime();
          break;
        }
        case 'current_attendees':
          cmp = a.registered - b.registered;
          break;
        case 'price':
          cmp = a.priceValue - b.priceValue;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [rawEvents, activeTab, sortField, sortDirection]);
}