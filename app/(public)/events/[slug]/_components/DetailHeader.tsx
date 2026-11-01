// app/(public)/events/[slug]/_components/DetailHeader.tsx

'use client';

import {
  BadgeCheck,
  Building2,
  Clock as ClockIcon,
  Globe,
  User,
} from 'lucide-react';

interface DetailHeaderProps {
  title: string;
  hostName: string;
  hostIsInstitution: boolean;
  isVirtual: boolean;
  isHybrid: boolean;
  isPast: boolean;
  isFullyBooked: boolean;
  /** e.g. "3d 4h remaining" — empty string when not applicable. */
  timeRemaining: string;
}

/**
 * Event header: title, "Hosted by …", format (Virtual/Hybrid/In-Person),
 * and — when the event hasn't started or filled — a countdown.
 */
export function DetailHeader({
  title,
  hostName,
  hostIsInstitution,
  isVirtual,
  isHybrid,
  isPast,
  isFullyBooked,
  timeRemaining,
}: DetailHeaderProps) {
  const showCountdown = !isPast && !isFullyBooked && timeRemaining;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {hostIsInstitution ? (
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <User className="h-4 w-4 shrink-0" />
          )}
          <span>Hosted by</span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            {hostName}
            {hostIsInstitution && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            )}
          </span>
        </div>

        <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 shrink-0" />
          <span>
            {isVirtual
              ? 'Virtual Event'
              : isHybrid
                ? 'Hybrid Event'
                : 'In-Person'}
          </span>
        </div>

        {showCountdown && (
          <>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <div className="flex items-center gap-1.5 font-medium text-primary">
              <ClockIcon className="h-4 w-4 shrink-0" />
              <span>{timeRemaining}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}