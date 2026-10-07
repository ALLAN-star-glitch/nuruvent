'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================
// PRIMITIVE
// ============================================================

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

// ============================================================
// STATS CARD SKELETON
// ============================================================

function StatCardSkeleton() {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="h-7 w-16" />
            <Shimmer className="h-2.5 w-24" />
          </div>
          <Shimmer className="h-9 w-9 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================
// TICKET CARD SKELETON
// ============================================================

function TicketCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/70">
      {/* Hero image */}
      <Shimmer className="aspect-[16/9] w-full rounded-none" />

      <div className="space-y-4 p-4 sm:p-5">
        {/* Title + meta */}
        <div className="space-y-2">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-40" />
          <Shimmer className="h-3 w-32" />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <Shimmer className="h-6 w-20 rounded-full" />
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="ml-auto h-5 w-28" />
        </div>

        {/* Session row */}
        <div className="border-t border-border/60 pt-4">
          <Shimmer className="h-14 w-full rounded-xl" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-28" />
        </div>
      </div>
    </Card>
  );
}

export function TicketsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Desktop filter card skeleton */}
      <Card className="hidden border-border/60 shadow-none md:block">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <Shimmer className="h-10 flex-1 rounded-xl sm:h-11" />
            <Shimmer className="h-10 w-full rounded-xl md:w-[190px] sm:h-11" />
            <Shimmer className="h-10 w-28 rounded-xl sm:h-11" />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-32" />
              <Shimmer className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-8 w-14" />
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsCardsSkeleton />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// REGISTRATION ROW SKELETON
// ============================================================

function RegistrationTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-b-0">
      <Shimmer className="h-4 w-4 shrink-0 rounded" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="h-3 w-48" />
        </div>
      </div>
      <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
        <Shimmer className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
      <Shimmer className="hidden h-6 w-24 shrink-0 rounded-full sm:block" />
      <Shimmer className="hidden h-3 w-20 shrink-0 md:block" />
      <Shimmer className="hidden h-3 w-20 shrink-0 md:block" />
      <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
    </div>
  );
}

function RegistrationCardSkeleton() {
  return (
    <Card className="border-border/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-end gap-1.5">
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>

        <div className="flex items-start gap-3">
          <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-48" />
          </div>
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-3 w-28" />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-3 w-20" />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <Shimmer className="h-7 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RegistrationsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Desktop filter card skeleton */}
      <Card className="hidden border-border/60 shadow-none md:block">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <Shimmer className="h-10 flex-1 rounded-xl sm:h-11" />
            <Shimmer className="h-10 w-full rounded-xl md:w-[190px] sm:h-11" />
            <Shimmer className="h-10 w-28 rounded-xl sm:h-11" />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-20 rounded-lg" />
              <Shimmer className="h-8 w-32" />
              <Shimmer className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-8 w-14" />
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsCardsSkeleton />

      {/* Table skeleton (desktop) */}
      <Card className="hidden border-border/60 shadow-none lg:block">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 border-b border-border/60 bg-muted/40 px-4 py-3">
            <Shimmer className="h-4 w-4 shrink-0 rounded" />
            <Shimmer className="h-3 w-20" />
            <Shimmer className="hidden h-3 w-16 lg:block" />
            <Shimmer className="hidden h-3 w-14 sm:block" />
            <Shimmer className="hidden h-3 w-16 md:block" />
            <Shimmer className="hidden h-3 w-20 md:block" />
            <Shimmer className="ml-auto h-3 w-12" />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <RegistrationTableRowSkeleton key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Grid skeleton (mobile + grid view) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden lg:grid-cols-3">
        {[0, 1, 2, 3].map((i) => (
          <RegistrationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}