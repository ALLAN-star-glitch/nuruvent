// components/home/HomeEventGrid.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EventCard } from './EventCard';
import { 
  SearchX, 
  Calendar, 
  Loader2, 
  RefreshCw, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUpcomingEventsQuery, useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HomeEventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function HomeEventGrid({ 
  limit = 8, 
  title = "Featured Training Events", 
  subtitle = "Discover professional workshops and certified courses from top trainers"
}: HomeEventGridProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const { 
    data: eventsData, 
    isLoading, 
    error,
    refetch,
    isFetching,
  } = useGetUpcomingEventsQuery(
    { limit: 20 },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const { data: eventTypes } = useGetEventTypesQuery();

  // ✅ Filter out past events
  const upcomingEvents = useMemo(() => {
    if (!eventsData) return [];
    
    const now = new Date();
    return eventsData.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    });
  }, [eventsData]);

  // ✅ Responsive display limit
  const displayLimit = useMemo(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 4; // Mobile: 4 events
    if (window.innerWidth < 1024) return 6; // Tablet: 6 events
    return limit; // Desktop: 8 events
  }, [limit]);

  // ✅ Determine which events to show
  const displayEvents = useMemo(() => {
    const events = showAll ? upcomingEvents : upcomingEvents.slice(0, displayLimit);
    return events;
  }, [upcomingEvents, showAll, displayLimit]);

  // ✅ Get total upcoming events count
  const totalUpcoming = upcomingEvents.length;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Reset showAll when events change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAll(false);
  }, [eventsData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
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
  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No upcoming events</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          There are no upcoming events at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            {title}
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Showing {displayEvents.length} of {totalUpcoming} upcoming events
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Events Grid - Responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayEvents.map((event, index) => (
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {/* Show More / Show Less Button */}
        {totalUpcoming > displayLimit && (
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="rounded-full px-6 cursor-pointer group"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronDown className="h-4 w-4 ml-2 rotate-180 transition-transform" />
              </>
            ) : (
              <>
                Show More Events
                <ChevronDown className="h-4 w-4 ml-2 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </Button>
        )}

        {/* Find More Events Button - Always visible */}
        <Button
          onClick={() => router.push('/events')}
          className={cn(
            "rounded-full px-6 cursor-pointer group",
            totalUpcoming > displayLimit ? "bg-primary-500 hover:bg-primary-600 text-white" : "bg-primary-500 hover:bg-primary-600 text-white"
          )}
        >
          Find More Events
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}