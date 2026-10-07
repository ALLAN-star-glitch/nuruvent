'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================
// SHIMMER PRIMITIVE
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
// STATS SKELETON
// ============================================================

function StatCardSkeleton() {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <Shimmer className="h-2.5 w-24" />
            <Shimmer className="h-7 w-20" />
            <Shimmer className="h-2.5 w-20" />
          </div>
          <Shimmer className="h-9 w-9 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// TABLE ROW SKELETON
// ============================================================

function PaymentTableRowSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-b-0">
      {/* Attendee */}
      <div className="flex min-w-[220px] flex-1 items-center gap-3">
        <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="h-3 w-44" />
        </div>
      </div>

      {/* Event (hidden on compact) */}
      {!compact && (
        <div className="hidden min-w-0 flex-1 space-y-2 lg:block">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
      )}

      {/* Amount */}
      <div className="min-w-[100px] space-y-2">
        <Shimmer className="h-3.5 w-20" />
        <Shimmer className="h-3 w-16" />
      </div>

      {/* Net */}
      <div className="hidden min-w-[80px] sm:block">
        <Shimmer className="h-3.5 w-16" />
      </div>

      {/* Status */}
      <div className="hidden md:block">
        <Shimmer className="h-6 w-24 rounded-full" />
      </div>

      {/* Method */}
      <div className="hidden lg:block">
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>

      {/* Actions */}
      <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
    </div>
  );
}

// ============================================================
// CARD SKELETON (grid view)
// ============================================================

function PaymentCardSkeleton() {
  return (
    <Card className="border-border/70">
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex justify-end">
          <Shimmer className="h-6 w-24 rounded-full" />
        </div>

        <div className="flex items-start gap-3">
          <Shimmer className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-40" />
          </div>
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3.5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-5 w-14 rounded-full" />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// EXPORTED: FULL PAYMENTS SKELETON
// ============================================================

interface PaymentsListSkeletonProps {
  /** Hides the event column in table rows when scoped to a single event */
  compact?: boolean;
  /** Grid view vs table view — mirrors the ledger */
  view?: 'table' | 'grid';
  /** Number of skeleton rows/cards */
  rows?: number;
}

export function PaymentsListSkeleton({
  compact = false,
  view = 'table',
  rows = 6,
}: PaymentsListSkeletonProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table view (desktop) */}
      {view === 'table' && (
        <Card className="hidden border-border/60 shadow-none md:block">
          <CardContent className="p-0">
            {/* Header row */}
            <div className="flex items-center gap-4 border-b border-border/60 bg-muted/40 px-4 py-3">
              <Shimmer className="h-3 w-20 min-w-[220px]" />
              {!compact && (
                <Shimmer className="hidden h-3 w-16 flex-1 lg:block" />
              )}
              <Shimmer className="h-3 w-16 min-w-[100px]" />
              <Shimmer className="hidden h-3 w-12 sm:block" />
              <Shimmer className="hidden h-3 w-16 md:block" />
              <Shimmer className="hidden h-3 w-14 lg:block" />
              <Shimmer className="ml-auto h-3 w-12" />
            </div>

            {Array.from({ length: rows }).map((_, i) => (
              <PaymentTableRowSkeleton key={i} compact={compact} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grid view (mobile or explicit grid) */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
          view === 'table' && 'md:hidden',
        )}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <PaymentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}