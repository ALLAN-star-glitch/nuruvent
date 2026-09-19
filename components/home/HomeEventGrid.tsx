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

  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUpcomingEventsQuery({ limit: 20 });

  const events: Event[] = response?.data ?? [];

  const upcomingEvents = useMemo(
    () => events.filter((event) => isEventUpcoming(event)),
    [events],
  );

  const [displayLimit, setDisplayLimit] = useState(limit);

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return limit;
      if (window.innerWidth < 640) return 4;
      if (window.innerWidth < 1024) return 6;
      return limit;
    };

    const handleResize = () => setDisplayLimit(compute());

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [limit]);

  useEffect(() => {
    setShowAll(false);
  }, [response]);

  const totalUpcoming = upcomingEvents.length;
  const displayEvents = showAll
    ? upcomingEvents
    : upcomingEvents.slice(0, displayLimit);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse"
          >
            <div className="aspect-[16/9] bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
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
      <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-destructive/20 text-destructive mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Unable to load events
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          We&apos;re having trouble fetching events. Please try refreshing the
          page.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
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
      <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          No upcoming events
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          There are no upcoming events at the moment. Check back soon!
        </p>
      </div>
    );
  }

  // Grid
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {title}
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Showing {displayEvents.length} of {totalUpcoming} upcoming events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
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
          className="rounded-full px-6 cursor-pointer group bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Find More Events
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}