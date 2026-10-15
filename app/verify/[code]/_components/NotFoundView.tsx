// app/verify/[code]/_components/NotFoundView.tsx

import { SearchX } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export function NotFoundView({ code }: { code: string }) {
  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-full bg-amber-50 p-4 dark:bg-amber-950/40">
          <SearchX className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Certificate not found
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No certificate matches the code{' '}
            <span className="font-mono text-foreground">{code}</span>.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          The certificate may have been revoked, or the code may be incorrect.
        </p>
      </CardContent>
    </Card>
  );
}