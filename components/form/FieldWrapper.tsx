// components/form/FieldWrapper.tsx

'use client';

import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ============================================================
// FIELD WRAPPER
// ============================================================

interface FieldWrapperProps {
  id: string;
  label: ReactNode;
  helper?: ReactNode;
  error?: string;
  counter?: { current: number; max: number };
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({
  id,
  label,
  helper,
  error,
  counter,
  optional,
  children,
  className,
}: FieldWrapperProps) {
  const counterOver = counter ? counter.current > counter.max : false;

  return (
    <div id={id} className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {optional && (
          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        )}
      </Label>

      {children}

      {(helper || error || counter) && (
        <div className="flex items-center justify-between text-xs">
          <div>
            {error ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </span>
            ) : helper ? (
              <span className="text-muted-foreground">{helper}</span>
            ) : null}
          </div>
          {counter && (
            <span
              className={cn(
                'tabular-nums',
                counterOver ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {counter.current} / {counter.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}