// app/(public)/events/[slug]/_components/DetailMobileCTA.tsx

'use client';

import { CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/eventDisplay';

interface DetailMobileCTAProps {
  /** Whether a ticket is already selected. */
  hasSelection: boolean;
  /** Price of the selected ticket, or 0 when none selected. */
  totalPrice: number;
  /** Lowest active-ticket price, shown as "Starting at" when nothing is selected. */
  minTicketPrice: number;
  /** Scrolls the sidebar into view when tapped. */
  onScrollToTickets: () => void;
}

/**
 * Sticky bottom CTA on mobile. Visible while the ticket card is out of
 * view and the event is still bookable. Hidden on `lg` and up.
 */
export function DetailMobileCTA({
  hasSelection,
  totalPrice,
  minTicketPrice,
  onScrollToTickets,
}: DetailMobileCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {hasSelection ? 'Selected' : 'Starting at'}
          </p>
          <p className="truncate text-base font-bold text-foreground">
            {formatPrice(hasSelection ? totalPrice : minTicketPrice)}
          </p>
        </div>
        <Button
          onClick={onScrollToTickets}
          className="h-11 shrink-0 cursor-pointer rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {hasSelection ? 'Continue' : 'Get Ticket'}
        </Button>
      </div>
    </div>
  );
}