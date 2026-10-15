// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/IssueBatchCostSummary.tsx

import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  pricePerCertMinor: number;
  recipientCount: number;
  totalMinor: number;
  currency: string;
  isFree: boolean;
}

function formatKES(minor: number): string {
  return `KES ${(minor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function IssueBatchCostSummary({
  pricePerCertMinor,
  recipientCount,
  totalMinor,
  isFree,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        isFree
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
          : 'border-border bg-muted/40',
      )}
    >
      {isFree ? (
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            Free certificates — no payment required
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Price per certificate</span>
            <span>{formatKES(pricePerCertMinor)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Recipients</span>
            <span>× {recipientCount}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">
              {formatKES(totalMinor)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}