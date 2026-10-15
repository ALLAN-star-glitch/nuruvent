// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/pay/[orderId]/_components/CardForm.tsx

'use client';

import { CreditCard, Lock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CardForm() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Debit or credit card
          </h4>
        </div>
        <Separator />
        <div className="flex items-start gap-3 pt-1 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Secure modal checkout
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Clicking pay below opens a secure Paystack popup where you
              complete the card details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}