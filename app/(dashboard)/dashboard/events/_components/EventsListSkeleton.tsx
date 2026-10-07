'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-background/40 before:to-transparent',
        'before:animate-[shimmer_1.6s_infinite]',
        className,
      )}
    />
  );
}

function StatCardSkeleton() {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="h-6 w-12" />
            <Shimmer className="h-2.5 w-24" />
          </div>
          <Shimmer className="h-11 w-11 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function EventRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-b-0">
      <Shimmer className="h-4 w-4 shrink-0 rounded" />
      <div className="min-w-[220px] flex-1 space-y-2">
        <Shimmer className="h-4 w-56" />
        <Shimmer className="h-3 w-40" />
      </div>
      <Shimmer className="hidden h-6 w-20 rounded-full sm:block" />
      <div className="hidden flex-col gap-1.5 md:flex">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-3 w-16" />
      </div>
      <div className="hidden flex-col gap-1.5 lg:flex">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-3 w-16" />
      </div>
      <div className="hidden w-36 space-y-1.5 lg:block">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-1.5 w-full" />
      </div>
      <Shimmer className="hidden h-6 w-20 rounded-full md:block" />
      <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Shimmer className="h-6 w-20 rounded-full" />
          <Shimmer className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-3 w-32" />
        </div>
        <div className="flex gap-3">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-3 w-40" />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-6 w-6 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  view?: 'table' | 'grid';
  rows?: number;
  showStats?: boolean;
}

export function EventsListSkeleton({
  view = 'table',
  rows = 5,
  showStats = true,
}: Props) {
  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {view === 'table' ? (
        <Card className="hidden border-border/60 shadow-none lg:block">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 border-b border-border/60 bg-muted/40 px-4 py-3">
              <Shimmer className="h-4 w-4 shrink-0 rounded" />
              <Shimmer className="h-3 w-20 min-w-[220px]" />
              <Shimmer className="hidden h-3 w-16 sm:block" />
              <Shimmer className="hidden h-3 w-20 md:block" />
              <Shimmer className="hidden h-3 w-16 lg:block" />
              <Shimmer className="hidden h-3 w-24 lg:block" />
              <Shimmer className="hidden h-3 w-16 md:block" />
              <Shimmer className="ml-auto h-3 w-12" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
              <EventRowSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Card grid — used for grid view and mobile */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
          view === 'table' && 'lg:hidden',
        )}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}