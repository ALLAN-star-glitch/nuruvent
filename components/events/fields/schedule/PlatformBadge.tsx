// components/events/fields/schedule/PlatformBadge.tsx

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ScheduleForm } from '../../types';
import { resolvePlatformMeta } from './scheduleUtils';

export function PlatformBadge({ schedule }: { schedule: ScheduleForm }) {
  if (!schedule.is_virtual) return null;

  const meta = resolvePlatformMeta(schedule);
  if (!meta) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 shrink-0',
        'rounded-md border border-border bg-background',
        'px-1.5 py-0.5',
      )}
      title={meta.label}
      aria-label={`Video platform: ${meta.label}`}
    >
      <span className="relative h-3.5 w-3.5 shrink-0">
        <Image
          src={meta.logo}
          alt=""
          fill
          sizes="14px"
          className="object-contain"
        />
      </span>
      <span className="text-[10px] font-medium text-muted-foreground leading-none">
        {meta.label}
      </span>
    </span>
  );
}