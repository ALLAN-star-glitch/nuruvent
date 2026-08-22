// components/home/EventGrid.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { EventCard } from './EventCard';
import { SearchX, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUpcomingEventsQuery, useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import { motion } from 'framer-motion';

interface EventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export function EventGrid({ limit, title, subtitle, showFilters = false }: EventGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const typeFilter = searchParams.get('type') || '';

  // ✅ Fetch real events from API
  const { 
    data: eventsData, 
    isLoading, 
    error 
  } = useGetUpcomingEventsQuery({ limit: limit || 10 });

  // ✅ Fetch event types for filtering and mapping
  const { data: eventTypes } = useGetEventTypesQuery();

  // Filter events based on search and type
  const filteredEvents = eventsData?.filter((event) => {
    let matches = true;
    if (searchQuery) {
      matches = matches && (
        event.name.toLowerCase().includes(searchQuery) ||
        event.description?.toLowerCase().includes(searchQuery) ||
        event.location?.toLowerCase().includes(searchQuery) ||
        event.account_id?.toLowerCase().includes(searchQuery) ||
        event.creator?.name?.toLowerCase().includes(searchQuery)
      );
    }
    if (typeFilter) {
      matches = matches && event.event_type_id === typeFilter;
    }
    return matches;
  }) || [];

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-100" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-100 text-red-500 mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-red-800">Unable to load events</h3>
        <p className="text-sm text-red-600 mt-1">
          We&apos;re having trouble fetching events. Please try refreshing the page.
        </p>
        <Button 
          variant="outline" 
          className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Empty state
  if (displayedEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No upcoming events</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any events matching "${searchQuery}". Try adjusting your search.`
            : 'There are no upcoming events at the moment. Check back soon!'}
        </p>
        {searchQuery && (
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
            className="mt-4"
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header with filters */}
      {(title || subtitle || searchQuery || showFilters) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
            )}
            {searchQuery && (
              <p className="text-sm text-primary mt-1">
                {displayedEvents.length} results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {/* Type Filter Dropdown */}
          {showFilters && eventTypes && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!typeFilter ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push('/events')}
                className="rounded-full"
              >
                All
              </Button>
              {eventTypes.slice(0, 6).map((type) => (
                <Button
                  key={type.id}
                  variant={typeFilter === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => router.push(`/events?type=${type.id}`)}
                  className="rounded-full"
                  style={typeFilter === type.id ? {} : { borderColor: type.color || '#e2e8f0' }}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Grid - Pass eventTypes to each card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <EventCard 
              event={event}
              eventTypes={eventTypes}  // ✅ Pass event types to card
              onClick={() => router.push(`/events/${event.slug}`)}
            />
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {!limit && displayedEvents.length >= 6 && (
        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="px-8 py-6 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Load More Events
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}