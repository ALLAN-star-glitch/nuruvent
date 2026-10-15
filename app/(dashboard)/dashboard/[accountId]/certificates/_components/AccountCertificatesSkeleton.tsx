// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificatesSkeleton.tsx

import { Card, CardContent } from '@/components/ui/card';

export function AccountCertificatesSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
              <div className="hidden h-4 w-32 animate-pulse rounded bg-muted sm:block" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}