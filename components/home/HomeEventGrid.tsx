/* eslint-disable react-hooks/set-state-in-effect */
// components/home/HomeEventGrid.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Loader2,
  RefreshCw,
  SearchX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

import { useGetUpcomingEventsQuery } from '@/lib/store/api/eventsApi';
import type { Event } from '@/lib/types/events';
import { isEventUpcoming } from '@/lib/utils/eventDisplay';

// ============================================================
// PROPS
// ============================================================

interface HomeEventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function HomeEventGrid({
  limit = 8,
  title = 'Featured Training Events',
  subtitle = 'Discover professional workshops and certified courses from top trainers',
}: HomeEventGridProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  // The endpoint returns the upcoming feed directly — no need to
  // fetch the whole catalogue and filter client-side.
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUpcomingEventsQuery({ limit: 20 });

  const events: Event[] = response?.data ?? [];

  // Belt-and-suspenders: the backend already filters to upcoming, but
  // a stale cached response could include an event that just started.
  const upcomingEvents = useMemo(
    () => events.filter((event) => isEventUpcoming(event)),
    [events],
  );

  // ---- Responsive display limit ----
  // Recomputed on window resize so the "Show more" behaviour matches
  // the visible grid at any breakpoint.
  const [displayLimit, setDisplayLimit] = useState(limit);

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return limit;
      if (window.innerWidth < 640) return 4; // mobile
      if (window.innerWidth < 1024) return 6; // tablet
      return limit; // desktop
    };

    const handleResize = () => setDisplayLimit(compute());

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [limit]);

  // ---- Reset "show all" whenever the underlying list changes ----
  useEffect(() => {
    setShowAll(false);
  }, [response]);

  const totalUpcoming = upcomingEvents.length;
  const displayEvents = showAll
    ? upcomingEvents
    : upcomingEvents.slice(0, displayLimit);

  // ----------------------------------------------------------
  // Loading skeleton
  // ----------------------------------------------------------
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
          >
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

  // ----------------------------------------------------------
  // Error state
  // ----------------------------------------------------------
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-100 text-red-500 mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-red-800">
          Unable to load events
        </h3>
        <p className="text-sm text-red-600 mt-1">
          We&apos;re having trouble fetching events. Please try refreshing the
          page.
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

  // ----------------------------------------------------------
  // Empty state
  // ----------------------------------------------------------
  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          No upcoming events
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          There are no upcoming events at the moment. Check back soon!
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Grid
  // ----------------------------------------------------------
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
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Cards */}
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
              onClick={() => router.push(`/events/${event.slug}`)}
            />
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
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

        <Button
          onClick={() => router.push('/events')}
          className="rounded-full px-6 cursor-pointer group bg-primary-500 hover:bg-primary-600 text-white"
        >
          Find More Events
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}