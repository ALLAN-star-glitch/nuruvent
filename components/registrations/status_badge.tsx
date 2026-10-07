'use client';

import {
  CheckCircle2,
  Clock3,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StatusVisual {
  label: string;
  color: string;
  dot: string;
  icon: LucideIcon;
}

const statusConfig: Record<string, StatusVisual> = {
  // ---- Registration statuses ----
  confirmed: {
    label: 'Confirmed',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  attended: {
    label: 'Attended',
    color: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  canceled: {
    label: 'Cancelled',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },

  // ---- Event statuses ----
  draft: {
    label: 'Draft',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: Clock3,
  },
  published: {
    label: 'Published',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    color: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
    icon: CheckCircle2,
  },
  postponed: {
    label: 'Postponed',
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    dot: 'bg-amber-500',
    icon: Clock3,
  },

  // ---- Payment statuses ----
  succeeded: {
    label: 'Completed',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },

  // ---- Shared ----
  pending: {
    label: 'Pending',
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    dot: 'bg-amber-500',
    icon: Clock3,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: Clock3,
  },
};

const FALLBACK_STATUS: StatusVisual = {
  label: 'Unknown',
  color: 'bg-muted text-muted-foreground border-border',
  dot: 'bg-muted-foreground',
  icon: Clock3,
};

export function getStatusVisual(slug: string, label?: string): StatusVisual {
  const base = statusConfig[(slug ?? '').toLowerCase()] ?? FALLBACK_STATUS;
  return label ? { ...base, label } : base;
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  variant?: 'dot' | 'icon';
  className?: string;
}

export function StatusBadge({
  status,
  label,
  variant = 'dot',
  className,
}: StatusBadgeProps) {
  const s = getStatusVisual(status, label);
  const Icon = s.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 border',
        s.color,
        className,
      )}
    >
      {variant === 'dot' ? (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', s.dot)} />
      ) : (
        <Icon className="h-3 w-3 shrink-0" />
      )}
      {s.label}
    </Badge>
  );
}