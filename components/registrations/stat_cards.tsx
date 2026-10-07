'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  Video,
  User as UserIcon,
} from 'lucide-react';
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
   * Number of columns on desktop (>= md breakpoint).
   * Mobile always shows 2 columns.
   * Defaults to 4.
   */
  desktopColumns?: 3 | 4 | 5;
}

const toneMap: Record<
  StatTone,
  {
    iconBg: string;
    iconBorder: string;
    iconFg: string;
    fallbackIcon: React.ReactNode;
  }
> = {
  primary: {
    iconBg: 'bg-primary/10',
    iconBorder: 'border-primary/15',
    iconFg: 'text-primary',
    fallbackIcon: <UserIcon className="h-3.5 w-3.5" />,
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconBorder: 'border-emerald-500/15',
    iconFg: 'text-emerald-600 dark:text-emerald-400',
    fallbackIcon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconBorder: 'border-amber-500/15',
    iconFg: 'text-amber-600 dark:text-amber-400',
    fallbackIcon: <Clock3 className="h-3.5 w-3.5" />,
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconBorder: 'border-sky-500/15',
    iconFg: 'text-sky-600 dark:text-sky-400',
    fallbackIcon: <Video className="h-3.5 w-3.5" />,
  },
};

const DESKTOP_COLS: Record<3 | 4 | 5, string> = {
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
};

export function StatsCards({
  stats,
  desktopColumns = 4,
}: StatsCardsProps) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-2.5 sm:gap-3',
        DESKTOP_COLS[desktopColumns],
      )}
    >
      {stats.map((s) => {
        const t = toneMap[s.tone];
        const interactive = !!(s.onClick || s.href);

        const card = (
          <Card
            className={cn(
              'h-full border-border shadow-sm transition-all duration-200',
              'hover:shadow-md',
              interactive && 'cursor-pointer',
            )}
          >
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md border',
                    t.iconBg,
                    t.iconBorder,
                    t.iconFg,
                  )}
                >
                  {s.icon ?? t.fallbackIcon}
                </div>
              </div>

              <p className="mt-1.5 text-base font-bold leading-tight tracking-tight text-foreground tabular-nums sm:text-lg">
                {s.value}
              </p>

              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {s.label}
              </p>

              <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground/80">
                {s.sub}
              </p>
            </CardContent>
          </Card>
        );

        if (s.href) {
          return (
            <Link key={s.label} href={s.href} className="block min-w-0">
              {card}
            </Link>
          );
        }

        if (s.onClick) {
          return (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              className="block w-full min-w-0 text-left"
            >
              {card}
            </button>
          );
        }

        return (
          <div key={s.label} className="min-w-0">
            {card}
          </div>
        );
      })}
    </div>
  );
}