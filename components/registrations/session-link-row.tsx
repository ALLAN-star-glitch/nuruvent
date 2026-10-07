'use client';

import Image from 'next/image';
import { Clock, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SessionLink } from '@/lib/types/attendance';

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(s)} – ${fmt(e)}`;
}

const platformLabel: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  in_person: 'In-Person',
};

const platformLogo: Record<string, string> = {
  zoom: '/platforms/zoom.png',
  google_meet: '/platforms/google-meet.png',
};

export function SessionLinkRow({ link }: { link: SessionLink }) {
  const expiresAt = new Date(link.expires_at);
  // eslint-disable-next-line react-hooks/purity
  const isExpired = expiresAt.getTime() < Date.now();
  const isJoinable = !!link.join_url && !isExpired;

  const label = platformLabel[link.platform] ?? link.platform ?? 'Virtual';
  const logoUrl = platformLogo[link.platform];

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors sm:flex-row sm:items-center',
        !isJoinable && 'opacity-80',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background p-1.5">
          {logoUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={logoUrl}
                alt={label}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {link.session_title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {formatTimeRange(link.scheduled_start, link.scheduled_end)}
            </span>
            <span className="text-border">·</span>
            <span>{label}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 sm:ml-auto">
        {isJoinable ? (
          <Button
            size="sm"
            className="h-8 w-full cursor-pointer rounded-lg text-xs sm:w-auto"
            onClick={() =>
              window.open(link.join_url, '_blank', 'noopener,noreferrer')
            }
          >
            <Video className="mr-1.5 h-3.5 w-3.5" />
            Join session
          </Button>
        ) : (
          <span className="px-2 text-xs italic text-muted-foreground">
            {isExpired ? 'Link expired' : 'Not yet available'}
          </span>
        )}
      </div>
    </div>
  );
}