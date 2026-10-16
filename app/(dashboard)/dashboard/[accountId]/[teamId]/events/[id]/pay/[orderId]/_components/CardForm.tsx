// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/pay/[orderId]/_components/CardForm.tsx

'use client';

import { CreditCard, Lock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type CardFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  disabled?: boolean;
};

export function CardForm({ email, onEmailChange, disabled }: CardFormProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Debit or credit card
          </h4>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="payer-email" className="text-sm font-medium">
            Email for receipt
          </Label>
          <Input
            id="payer-email"
            name="payer-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={disabled}
            required
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">
            Your card receipt and payment confirmation will be sent here.
          </p>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Secure modal checkout
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Clicking pay below opens a secure Paystack popup where you
              complete the card details. Card details never touch our servers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}