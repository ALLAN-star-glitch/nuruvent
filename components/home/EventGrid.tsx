// components/home/EventGrid.tsx

'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Loader2, RefreshCw, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EventCard } from './EventCard';

import { useListEventsQuery } from '@/lib/store/api/eventsApi';
import type {
  Event,
  EventSortBy,
  ListEventsParams,
  SortOrder,
} from '@/lib/types/events';

// ============================================================
// PROPS
// ============================================================

interface EventGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

// ============================================================
// URL → ListEventsParams
// ============================================================

function sortFromUrl(sortParam: string): {
  sort_by: EventSortBy;
  sort_order: SortOrder;
} {
  switch (sortParam) {
    case 'date-asc':
      return { sort_by: 'start_date', sort_order: 'asc' };
    case 'name':
      return { sort_by: 'name', sort_order: 'asc' };
    case 'date':
    default:
      return { sort_by: 'created_at', sort_order: 'desc' };
  }
}

function buildQueryParams(
  searchParams: URLSearchParams,
  limit: number,
): ListEventsParams {
  const typeFilter = searchParams.get('type') ?? '';
  const sortParam = searchParams.get('sort') ?? 'date';
  const { sort_by, sort_order } = sortFromUrl(sortParam);

  const params: ListEventsParams = {
    limit,
    offset: 0,
    sort_by,
    sort_order,
    include_creator: true,
  };

  if (typeFilter) params.event_type_id = typeFilter;

  return params;
}

// ============================================================
// COMPONENT
// ============================================================

export function EventGrid({ limit = 12, title, subtitle }: EventGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => buildQueryParams(searchParams, limit),
    [searchParams, limit],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useListEventsQuery(params);

  const events: Event[] = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;

  const typeFilter = searchParams.get('type') ?? '';
  const hasActiveFilter = Boolean(typeFilter);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse"
          >
            <div className="aspect-[16/9] bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-8 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
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
  if (events.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          No events found
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          {hasActiveFilter
            ? 'No events match your current filters. Try adjusting your criteria.'
            : 'There are no events at the moment. Check back soon!'}
        </p>
        {hasActiveFilter && (
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

  // Grid
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {title && (
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}

          {isFetching && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Refreshing...
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1">
            Showing {events.length} of {total} events
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
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Event cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
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

      {/* Pagination hint */}
      {total > events.length && (
        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
            className="rounded-full px-8 cursor-pointer group"
          >
            View All {total} Events
          </Button>
        </div>
      )}
    </div>
  );
}