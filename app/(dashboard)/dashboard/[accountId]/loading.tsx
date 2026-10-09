// app/(dashboard)/dashboard/[accountId]/loading.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountOverviewLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton height={36} width={36} className="rounded-lg shrink-0" />
        <div className="flex items-start gap-4 flex-1">
          <Skeleton height={56} width={56} className="rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton height={28} width={224} />
            <Skeleton height={16} width={128} />
            <Skeleton height={16} width={288} />
          </div>
        </div>
      </div>

      {/* Teams card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-2">
            <Skeleton height={16} width={80} />
            <Skeleton height={14} width={192} />
          </div>
          <Skeleton height={36} width={128} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <Skeleton height={40} width={40} className="rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} width="75%" />
                  <Skeleton height={12} width="50%" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}