'use client';

import { CheckCircle2, Clock3, Video, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatTone = 'primary' | 'emerald' | 'amber' | 'sky';

export interface StatItem {
  label: string;
  value: number | string;
  sub: string;
  tone: StatTone;
  icon?: React.ReactNode;
}

const toneMap: Record<
  StatTone,
  {
    halo: string;
    iconBg: string;
    iconBorder: string;
    iconFg: string;
    fallbackIcon: React.ReactNode;
  }
> = {
  primary: {
    halo: 'bg-primary/10',
    iconBg: 'bg-background',
    iconBorder: 'border-primary/15',
    iconFg: 'text-primary',
    fallbackIcon: <UserIcon className="h-4 w-4" />,
  },
  emerald: {
    halo: 'bg-emerald-500/10',
    iconBg: 'bg-background',
    iconBorder: 'border-emerald-500/15',
    iconFg: 'text-emerald-600 dark:text-emerald-400',
    fallbackIcon: <CheckCircle2 className="h-4 w-4" />,
  },
  amber: {
    halo: 'bg-amber-500/10',
    iconBg: 'bg-background',
    iconBorder: 'border-amber-500/15',
    iconFg: 'text-amber-600 dark:text-amber-400',
    fallbackIcon: <Clock3 className="h-4 w-4" />,
  },
  sky: {
    halo: 'bg-sky-500/10',
    iconBg: 'bg-background',
    iconBorder: 'border-sky-500/15',
    iconFg: 'text-sky-600 dark:text-sky-400',
    fallbackIcon: <Video className="h-4 w-4" />,
  },
};

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => {
        const t = toneMap[s.tone];
        return (
          <Card
            key={s.label}
            className="border-border/60 shadow-none hover:border-border transition-colors"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] truncate">
                    {s.label}
                  </p>
                  <p className="text-[26px] sm:text-[30px] font-semibold text-foreground tabular-nums mt-2 leading-none tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 truncate">
                    {s.sub}
                  </p>
                </div>

                <div className="relative shrink-0">
                  <div
                    className={cn('absolute inset-0 rounded-xl blur-md', t.halo)}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      'relative flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm',
                      t.iconBg,
                      t.iconBorder,
                      t.iconFg,
                    )}
                  >
                    {s.icon ?? t.fallbackIcon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}