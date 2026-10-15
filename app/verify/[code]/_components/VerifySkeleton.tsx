// app/verify/[code]/_components/VerifySkeleton.tsx

import { Card, CardContent } from '@/components/ui/card';

export function VerifySkeleton() {
  return (
    <Card className="w-full max-w-2xl border-border shadow-sm">
      <CardContent className="space-y-6 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}