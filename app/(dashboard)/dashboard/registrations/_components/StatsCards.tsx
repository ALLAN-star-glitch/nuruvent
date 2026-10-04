'use client';

import { CheckCircle2, Clock3, Video, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatTone = 'primary' | 'emerald' | 'amber' | 'sky';

export interface StatItem {
  label: string;
  value: number;
  sub: string;
  tone: StatTone;
  icon: React.ReactNode;
}

const toneMap: Record<StatTone, { bg: string; fg: string; ring: string; fallbackIcon: React.ReactNode }> = {
  primary: {
    bg: 'bg-primary/10',
    fg: 'text-primary',
    ring: 'ring-primary/15',
    fallbackIcon: <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />,
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    fg: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/15',
    fallbackIcon: <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />,
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    fg: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/15',
    fallbackIcon: <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />,
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    fg: 'text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-500/15',
    fallbackIcon: <Video className="h-4 w-4 sm:h-5 sm:w-5" />,
  },
};

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => {
        const t = toneMap[s.tone];
        return (
          <Card key={s.label} className="border-border/70 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] truncate">
                    {s.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums mt-1.5 sm:mt-2 leading-none">
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 truncate">
                    {s.sub}
                  </p>
                </div>
                <div className={cn('p-2 sm:p-2.5 rounded-xl shrink-0 ring-1', t.bg, t.fg, t.ring)}>
                  {s.icon ?? t.fallbackIcon}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}