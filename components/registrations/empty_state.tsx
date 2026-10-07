'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  sub: string;
  action?: React.ReactNode;
  eyebrow?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
  eyebrow,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <Card
      className={cn(
        'border-border/60 border-dashed bg-muted/20 overflow-hidden',
        className,
      )}
    >
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center text-center',
          isCompact ? 'p-8 sm:p-10 gap-3' : 'p-10 sm:p-16 gap-5',
        )}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-primary/5 blur-xl"
            aria-hidden
          />
          <div
            className={cn(
              'relative flex items-center justify-center rounded-2xl',
              'bg-background border border-border/70 shadow-sm',
              isCompact ? 'h-12 w-12' : 'h-14 w-14',
            )}
          >
            {icon}
          </div>
        </div>

        {eyebrow && (
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </span>
        )}

        <div className={cn('space-y-1.5', isCompact ? 'max-w-xs' : 'max-w-sm')}>
          <h3
            className={cn(
              'font-semibold text-foreground tracking-tight',
              isCompact ? 'text-[15px]' : 'text-base sm:text-lg',
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground leading-relaxed',
              isCompact ? 'text-[13px]' : 'text-sm',
            )}
          >
            {sub}
          </p>
        </div>

        {action && (
          <div className={cn('pt-1', isCompact ? 'w-full' : 'mt-1')}>
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
}