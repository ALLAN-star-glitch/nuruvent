// app/(public)/events/[slug]/_components/DetailBanner.tsx

'use client';

import Image from 'next/image';
import { Award, CalendarDays, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface DetailBannerProps {
  imageUrl?: string;
  title: string;
  isFeatured: boolean;
  isRecurring: boolean;
  isVirtual: boolean;
  isPast: boolean;
  isFullyBooked: boolean;
}

/**
 * Event banner image with a status badge overlay.
 *
 * Badges stack bottom-left: Featured / Recurring / Virtual / Ended / Sold Out.
 * Falls back to a muted gradient placeholder when no image is present.
 */
export function DetailBanner({
  imageUrl,
  title,
  isFeatured,
  isRecurring,
  isVirtual,
  isPast,
  isFullyBooked,
}: DetailBannerProps) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-md sm:aspect-[21/9]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          unoptimized
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted/80">
          <CalendarDays className="h-20 w-20 text-muted-foreground/40" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        {isFeatured && (
          <Badge className="rounded-full border-0 bg-amber-500 px-3 py-1 font-semibold text-white shadow-sm">
            <Award className="mr-1 h-3.5 w-3.5" />
            Featured
          </Badge>
        )}
        {isRecurring && (
          <Badge className="rounded-full border-0 bg-primary/90 px-3 py-1 font-semibold text-primary-foreground shadow-sm backdrop-blur-sm">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            Recurring
          </Badge>
        )}
        {isVirtual && (
          <Badge className="rounded-full border-0 bg-primary/90 px-3 py-1 font-semibold text-primary-foreground shadow-sm backdrop-blur-sm">
            <Video className="mr-1 h-3.5 w-3.5" />
            Virtual
          </Badge>
        )}
        {isPast && (
          <Badge className="rounded-full border-0 bg-black/70 px-3 py-1 font-semibold text-white backdrop-blur-sm">
            Ended
          </Badge>
        )}
        {isFullyBooked && !isPast && (
          <Badge className="rounded-full border-0 bg-destructive/90 px-3 py-1 font-semibold text-white backdrop-blur-sm">
            Sold Out
          </Badge>
        )}
      </div>
    </div>
  );
}