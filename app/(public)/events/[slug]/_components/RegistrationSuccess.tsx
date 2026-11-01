// app/(public)/events/[slug]/_components/RegistrationSuccess.tsx

'use client';

import { CheckCircle2, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Registration } from '@/lib/types/registration';

interface RegistrationSuccessProps {
  registration: Registration;
  totalPrice: number;
  /** Called when the "Proceed to Checkout" button is clicked. */
  onProceedToCheckout: () => void;
}

/**
 * Post-registration summary block: status pill + optional checkout
 * button (paid events) or confirmation message (free events).
 */
export function RegistrationSuccess({
  registration,
  totalPrice,
  onProceedToCheckout,
}: RegistrationSuccessProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Registration Created</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Status:{' '}
          <span className="font-medium text-foreground">
            {registration.status.display_name}
          </span>
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          Ref #{registration.registration_number}
        </p>
      </div>

      {totalPrice > 0 ? (
        <Button
          onClick={onProceedToCheckout}
          className="h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Button>
      ) : (
        <p className="py-2 text-center text-xs text-muted-foreground">
          Free registration confirmed. We sent your confirmation pass to
          your email!
        </p>
      )}
    </div>
  );
}