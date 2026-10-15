// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/pay/[orderId]/_components/OrderSummary.tsx

'use client';

import { Award, Shield } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  eventTitle: string;
  attendeeCount: number;
  pricePerCertMinor: number;
  totalMinor: number;
  currency: string;
}

function formatPrice(minor: number, currency: string): string {
  if (minor === 0) return 'Free';
  return `${currency} ${(minor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function OrderSummary({
  eventTitle,
  attendeeCount,
  pricePerCertMinor,
  totalMinor,
  currency,
}: Props) {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Order summary
        </h3>
        <span className="font-mono text-xs text-muted-foreground">
          Certificates
        </span>
      </div>
      <CardContent className="space-y-4 p-5">
        {/* Event context */}
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {eventTitle}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Certificate batch
            </p>
          </div>
        </div>

        <Separator />

        {/* Line items */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Price per certificate
            </span>
            <span className="text-xs font-medium text-foreground">
              {formatPrice(pricePerCertMinor, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Recipients
            </span>
            <span className="text-xs font-medium text-foreground">
              × {attendeeCount}
            </span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-foreground">
            Total due
          </span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(totalMinor, currency)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Guaranteed safe checkout</span>
        </div>
      </CardContent>
    </Card>
  );
}