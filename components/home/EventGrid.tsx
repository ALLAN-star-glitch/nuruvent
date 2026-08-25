// components/home/EventGrid.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { EventCard } from './EventCard';
import { SearchX, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUpcomingEventsQuery, useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import { motion } from 'framer-motion';

interface EventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function EventGrid({ limit, title, subtitle }: EventGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get all filters from URL
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const typeFilter = searchParams.get('type') || '';
  const priceFilter = searchParams.get('price') || 'all';
  const dateFilter = searchParams.get('date') || 'all';
  const sortFilter = searchParams.get('sort') || 'date';

  const { 
    data: eventsData, 
    isLoading, 
    error,
    refetch,
    isFetching,
  } = useGetUpcomingEventsQuery(
    { limit: limit || 12 },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const { data: eventTypes } = useGetEventTypesQuery();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!eventsData) return [];

    let result = [...eventsData];

    // ✅ FIRST: Filter out past events
    const now = new Date();
    result = result.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    });

    // 1. Filter by search query
    if (searchQuery) {
      const searchableFields = [
        'name',
        'display_name',
        'description',
        'location',
        'account_id',
      ];
      
      result = result.filter((event) => {
        // Check if any field matches the search query
        return searchableFields.some((field) => {
          const value = event[field as keyof typeof event];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery);
          }
          return false;
        }) || event.creator?.name?.toLowerCase().includes(searchQuery);
      });
    }

    // 2. Filter by category (type)
    if (typeFilter) {
      result = result.filter((event) => event.event_type_id === typeFilter);
    }

    // 3. Filter by price range
    if (priceFilter !== 'all') {
      result = result.filter((event) => {
        const price = event.price || 0;
        switch (priceFilter) {
          case 'free':
            return price === 0;
          case '1-5k':
            return price >= 1000 && price <= 5000;
          case '5-10k':
            return price > 5000 && price <= 10000;
          case '10-20k':
            return price > 10000 && price <= 20000;
          case '20k+':
            return price > 20000;
          default:
            return true;
        }
      });
    }

    // 4. Filter by date
    if (dateFilter !== 'all') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter((event) => {
        const eventDate = new Date(event.date);
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        
        switch (dateFilter) {
          case 'today':
            return eventDay.getTime() === today.getTime();
          case 'week': {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            return eventDay >= today && eventDay <= weekEnd;
          }
          case 'month': {
            const monthEnd = new Date(today);
            monthEnd.setMonth(today.getMonth() + 1);
            return eventDay >= today && eventDay < monthEnd;
          }
          case 'upcoming':
            return eventDay >= today;
          default:
            return true;
        }
      });
    }

    // 5. Sort events
    switch (sortFilter) {
      case 'date':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.current_attendees || 0) - (a.current_attendees || 0));
        break;
      default:
        break;
    }

    return result;
  }, [eventsData, searchQuery, typeFilter, priceFilter, dateFilter, sortFilter]);

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  // Get active filter count for display
  const getActiveFilterCount = () => {
    let count = 0;
    if (typeFilter) count++;
    if (priceFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (sortFilter !== 'date') count++;
    return count;
  };

  // Get selected category name
  const getCategoryName = () => {
    if (typeFilter && eventTypes) {
      const found = eventTypes.find(c => c.id === typeFilter);
      return found?.display_name || found?.name || '';
    }
    return '';
  };

  const activeFilterCount = getActiveFilterCount();
  const categoryName = getCategoryName();

  // Loading state with 3 columns
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 9)].map((_, i) => (
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
          className="mt-4 border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
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
        <h3 className="text-xl font-semibold text-gray-900">No upcoming events found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any upcoming events matching "${searchQuery}".`
            : activeFilterCount > 0
              ? `No upcoming events match your current filters. Try adjusting your criteria.`
              : 'There are no upcoming events at the moment. Check back soon!'}
        </p>
        {(searchQuery || activeFilterCount > 0) && (
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
            className="mt-4 cursor-pointer"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
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
          
          {/* Filter summary */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {searchQuery && (
              <span className="text-sm text-primary">
                Search: &quot;{searchQuery}&quot;
              </span>
            )}
            {categoryName && (
              <span className="text-sm text-primary">
                {searchQuery && ' • '}Category: {categoryName}
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="text-sm text-primary">
                {(searchQuery || categoryName) && ' • '}
                Price: {priceRanges.find(p => p.id === priceFilter)?.label || priceFilter}
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="text-sm text-primary">
                {(searchQuery || categoryName || priceFilter !== 'all') && ' • '}
                Date: {dateOptions.find(d => d.id === dateFilter)?.label || dateFilter}
              </span>
            )}
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing...
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            Showing {displayedEvents.length} of {filteredEvents.length} upcoming events
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Event Grid - 3 columns */}
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
              eventTypes={eventTypes}
              onClick={() => router.push(`/events/${event.slug}`)}
            />
          </motion.div>
        ))}
      </div>

      {/* View All CTA - Only show if there are more events */}
      {limit && filteredEvents.length > limit && (
        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
            className="rounded-full px-8 cursor-pointer group"
          >
            View All {filteredEvents.length} Upcoming Events
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper data for display (should match CategoryFilter)
const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free' },
  { id: '1-5k', label: 'KES 1,000 - 5,000' },
  { id: '5-10k', label: 'KES 5,000 - 10,000' },
  { id: '10-20k', label: 'KES 10,000 - 20,000' },
  { id: '20k+', label: 'KES 20,000+' },
];

const dateOptions = [
  { id: 'all', label: 'All Dates' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'upcoming', label: 'Upcoming' },
];