'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { EventCard } from './EventCard';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EventItem {
  id: string;
  title: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  date: string;
  time: string;
  price: number;
  host: string;
  location: string;
}

interface EventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

const dummyEvents: EventItem[] = [
  {
    id: '1',
    title: 'Data Science with Python Workshop',
    type: 'workshop',
    date: 'Tomorrow, 20 July 2026',
    time: '10:00 AM - 1:00 PM',
    price: 2000,
    host: 'eMobilis Training Institute',
    location: 'Virtual (Zoom)',
  },
  {
    id: '2',
    title: 'Financial Literacy for Professionals',
    type: 'webinar',
    date: 'Thursday, 23 July 2026',
    time: '2:00 PM - 4:00 PM',
    price: 1000,
    host: 'ICPAK',
    location: 'Virtual (Google Meet)',
  },
  {
    id: '3',
    title: 'UI/UX Design Bootcamp',
    type: 'bootcamp',
    date: 'Monday, 27 July 2026',
    time: '9:00 AM - 5:00 PM',
    price: 8000,
    host: 'DevSchool',
    location: 'Virtual (Zoom)',
  },
  {
    id: '4',
    title: 'Nairobi Tech Community Meetup',
    type: 'meetup',
    date: 'Saturday, 25 July 2026',
    time: '3:00 PM - 6:00 PM',
    price: 500,
    host: 'Tech Community Nairobi',
    location: 'Virtual (Google Meet)',
  },
  {
    id: '5',
    title: 'Digital Marketing Masterclass',
    type: 'workshop',
    date: 'Wednesday, 29 July 2026',
    time: '6:00 PM - 8:00 PM',
    price: 3000,
    host: 'eMobilis Training Institute',
    location: 'Virtual (Zoom)',
  },
  {
    id: '6',
    title: 'Leadership & Management Webinar',
    type: 'webinar',
    date: 'Friday, 31 July 2026',
    time: '11:00 AM - 1:00 PM',
    price: 0,
    host: 'IHRM',
    location: 'Virtual (Google Meet)',
  },
];

export function EventGrid({ limit, title, subtitle }: EventGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  // Filter events by search parameter if present
  const filteredEvents = dummyEvents.filter((event) => {
    if (!searchQuery) return true;
    return (
      event.title.toLowerCase().includes(searchQuery) ||
      event.host.toLowerCase().includes(searchQuery) ||
      event.type.toLowerCase().includes(searchQuery)
    );
  });

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  return (
    <div>
      {/* Header section (render if custom title/subtitle provided or when active search is running) */}
      {(title || subtitle || searchQuery) && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {title || (searchQuery ? `Results for "${searchQuery}"` : 'Upcoming Events')}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {subtitle || (searchQuery ? `Showing ${filteredEvents.length} events` : 'Discover and register for professional training events in Kenya')}
          </p>
        </div>
      )}

      {/* Grid or Empty State */}
      {displayedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>

          {!limit && displayedEvents.length >= 6 && (
            <div className="text-center mt-10">
              <button
                type="button"
                className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
              >
                Load More Events
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-gray-400 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            We couldn&apos;t find any events matching &quot;{searchQuery}&quot;. Try checking for spelling errors or searching another topic.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/events')}
              className="cursor-pointer"
            >
              Clear Search Filter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}