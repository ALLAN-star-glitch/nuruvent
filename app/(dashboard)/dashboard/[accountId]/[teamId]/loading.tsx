// app/(dashboard)/dashboard/[accountId]/[teamId]/loading.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton height={32} width={160} />
          <Skeleton height={16} width={288} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton height={44} width={160} />
          <Skeleton height={32} width={96} />
          <Skeleton height={32} width={96} />
        </div>
      </div>

      <Skeleton height={128} className="w-full rounded-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <Skeleton height={24} width={24} className="rounded-lg" />
                  <Skeleton height={24} width={64} />
                  <Skeleton height={12} width={96} />
                  <Skeleton height={10} width={80} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border shadow-sm">
              <CardHeader className="pb-1 px-5 pt-3">
                <Skeleton height={16} width={128} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton height={140} className="w-full" />
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-1 px-5 pt-3">
                <Skeleton height={16} width={112} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton height={140} className="w-full" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 px-6 pt-4">
              <Skeleton height={16} width={128} />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                  <Skeleton
                    height={28}
                    width={28}
                    className="rounded-lg shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton height={14} width="66%" />
                    <Skeleton height={12} width="33%" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <Skeleton height={16} width={112} />
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={32} className="w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <Skeleton height={16} width={96} />
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={16} className="w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <Skeleton height={16} width={64} />
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={40} className="w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}