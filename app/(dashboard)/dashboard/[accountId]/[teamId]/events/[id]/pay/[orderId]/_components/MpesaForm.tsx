// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/pay/[orderId]/_components/MpesaForm.tsx

'use client';

import { Phone } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Props {
  phone: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function MpesaForm({ phone, onChange, disabled }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            M-Pesa phone number
          </h4>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label
            htmlFor="mpesaPhone"
            className="text-xs font-medium text-muted-foreground"
          >
            Enter the active M-Pesa registered number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mpesaPhone"
              type="tel"
              placeholder="254712345678"
              value={phone}
              onChange={(e) => onChange(e.target.value)}
              className="h-11 pl-10 text-sm"
              disabled={disabled}
              required
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            An STK push authorization prompt will be delivered to this phone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}