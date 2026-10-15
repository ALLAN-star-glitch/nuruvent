// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/pay/[orderId]/_components/PollingView.tsx

'use client';

import { Loader2, Smartphone } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface Props {
  phone: string;
}

export function PollingView({ phone }: Props) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="flex flex-col items-center p-8 text-center sm:p-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Smartphone className="h-10 w-10 animate-pulse" />
          </div>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          STK push sent to phone
        </h3>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Check your phone for the M-Pesa prompt and enter your PIN to
          complete the payment for{' '}
          <span className="font-semibold text-foreground">{phone}</span>.
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
          <span>
            Waiting for payment confirmation. Do not close this window.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}