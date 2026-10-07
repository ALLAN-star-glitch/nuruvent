'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TYPE_CLASSES: Record<string, string> = {
  Workshop:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
  Webinar:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
  Meetup:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  Bootcamp:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
  Uncategorized: 'bg-muted text-muted-foreground border-border',
};

export function EventTypeBadge({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const color = TYPE_CLASSES[type] ?? TYPE_CLASSES.Uncategorized;
  return (
    <Badge variant="outline" className={cn(color, className)}>
      {type}
    </Badge>
  );
}