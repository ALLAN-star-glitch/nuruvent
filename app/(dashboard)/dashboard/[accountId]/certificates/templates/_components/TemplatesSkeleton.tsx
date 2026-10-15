// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatesSkeleton.tsx

import { Card, CardContent } from '@/components/ui/card';

export function TemplatesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-14 w-full animate-pulse rounded bg-muted" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}