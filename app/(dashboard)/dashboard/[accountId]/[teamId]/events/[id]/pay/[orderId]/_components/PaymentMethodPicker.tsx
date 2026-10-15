// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/pay/[orderId]/_components/PaymentMethodPicker.tsx

'use client';

import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export type PaymentMethod = 'mpesa' | 'card';

interface Props {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}

const METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  imageUrl: string;
}> = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    description: 'Instant STK Push',
    imageUrl: '/payment-logos/mpesa.jpeg',
  },
  {
    id: 'card',
    label: 'Card',
    description: 'Visa, Mastercard',
    imageUrl: '/payment-logos/card.png',
  },
];

export function PaymentMethodPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Select payment method
      </p>
      <div className="grid grid-cols-2 gap-3">
        {METHODS.map((m) => {
          const selected = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 bg-card p-4 transition-all duration-200',
                selected
                  ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/10'
                  : 'border-border hover:border-border/80 hover:bg-muted/40',
              )}
            >
              {selected && (
                <div className="absolute right-3 top-3">
                  <CheckCircle className="h-4 w-4 fill-primary/10 text-primary" />
                </div>
              )}
              <div className="relative h-10 w-12 overflow-hidden rounded-md border border-border/40 bg-white p-1">
                <Image
                  src={m.imageUrl}
                  alt={m.label}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {m.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}