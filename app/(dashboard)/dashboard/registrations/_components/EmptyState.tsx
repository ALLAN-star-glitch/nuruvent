'use client';

import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({
  icon, title, sub, action,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 border-dashed">
      <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-3.5 bg-muted rounded-2xl">{icon}</div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground max-w-sm">{sub}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}