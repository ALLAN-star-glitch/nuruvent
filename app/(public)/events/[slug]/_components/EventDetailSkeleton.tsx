// app/(public)/events/[slug]/_components/EventDetailSkeleton.tsx

import { Skeleton } from '@/components/ui/skeleton';

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4 rounded" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[420px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}