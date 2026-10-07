'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MethodVisual {
  label: string;
  color: string;
}

const methodConfig: Record<string, MethodVisual> = {
  mpesa: {
    label: 'M-Pesa',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  },
  card: {
    label: 'Card',
    color:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  },
  bank: {
    label: 'Bank',
    color:
      'bg-muted text-muted-foreground border-border',
  },
};

const FALLBACK_METHOD: MethodVisual = {
  label: 'Unknown',
  color: 'bg-muted text-muted-foreground border-border',
};

export function getMethodVisual(slug: string, label?: string): MethodVisual {
  const base = methodConfig[(slug ?? '').toLowerCase()] ?? FALLBACK_METHOD;
  return label ? { ...base, label } : base;
}

interface MethodBadgeProps {
  method: string;
  label?: string;
  className?: string;
}

export function MethodBadge({ method, label, className }: MethodBadgeProps) {
  const m = getMethodVisual(method, label);

  return (
    <Badge
      variant="outline"
      className={cn('inline-flex items-center border', m.color, className)}
    >
      {m.label}
    </Badge>
  );
}