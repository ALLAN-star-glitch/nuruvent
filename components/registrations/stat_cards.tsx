'use client';

import Link from 'next/link';
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
  onClick?: () => void;
  href?: string;
}

interface StatsCardsProps {
  stats: StatItem[];
  /**
   * Minimum card width in px. Grid auto-fits columns based on available space.
   * Increase to force fewer columns, decrease to force more.
   * Default: 180 (works well for 3–5 stats on desktop).
   */
  minCardWidth?: number;
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

export function StatsCards({ stats, minCardWidth = 180 }: StatsCardsProps) {
  return (
    <div
      className="grid gap-3 sm:gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
      }}
    >
      {stats.map((s) => {
        const t = toneMap[s.tone];
        const interactive = !!(s.onClick || s.href);

        const inner = (
          <Card
            className={cn(
              'h-full border-border/60 shadow-none transition-all',
              interactive
                ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm'
                : 'hover:border-border',
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-muted-foreground sm:text-[11px]">
                  {s.label}
                </p>
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'absolute inset-0 rounded-lg blur-md sm:rounded-xl',
                      t.halo,
                    )}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      'relative flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm sm:h-9 sm:w-9 sm:rounded-xl',
                      t.iconBg,
                      t.iconBorder,
                      t.iconFg,
                    )}
                  >
                    {s.icon ?? t.fallbackIcon}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[22px] font-semibold leading-none tracking-tight text-foreground tabular-nums sm:mt-3 sm:text-[26px]">
                {s.value}
              </p>

              <p className="mt-1.5 truncate text-[11px] leading-tight text-muted-foreground sm:mt-2 sm:text-xs">
                {s.sub}
              </p>
            </CardContent>
          </Card>
        );

        if (s.href) {
          return (
            <Link key={s.label} href={s.href} className="block">
              {inner}
            </Link>
          );
        }

        if (s.onClick) {
          return (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              className="block w-full text-left"
            >
              {inner}
            </button>
          );
        }

        return <div key={s.label}>{inner}</div>;
      })}
    </div>
  );
}