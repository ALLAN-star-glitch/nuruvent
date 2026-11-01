// app/(public)/events/[slug]/_components/DetailDescription.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DetailDescriptionProps {
  /** Free-text event description. Renders nothing if falsy. */
  description?: string | null;
}

/**
 * "About This Event" card. Hidden entirely when the description is
 * empty so the layout stays tight for events without one.
 */
export function DetailDescription({ description }: DetailDescriptionProps) {
  if (!description) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="h-5 w-1 rounded-full bg-primary" />
          About This Event
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}