// app/(public)/events/[slug]/_components/TicketSelector.tsx

'use client';

import { AlertCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/lib/types/events';
import { formatPrice } from '@/lib/utils/eventDisplay';

interface TicketSelectorProps {
  tickets: Ticket[];
  selectedTicketTypeId: string | null;
  onSelect: (ticketTypeId: string) => void;
  disabled?: boolean;
}

export function TicketSelector({
  tickets,
  selectedTicketTypeId,
  onSelect,
  disabled,
}: TicketSelectorProps) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>No tickets currently available for this event</span>
      </div>
    );
  }

  return (
    <div
      className="space-y-2.5"
      role="radiogroup"
      aria-label="Select a ticket type"
    >
      {tickets.map((ticket) => {
        const type = ticket.ticket_type;
        const typeId = type?.id;
        const isSoldOut = ticket.quantity <= 0;
        const isInactive = !ticket.is_active;
        const isDisabled = disabled || isSoldOut || isInactive || !typeId;
        const isSelected = !!typeId && selectedTicketTypeId === typeId;

        return (
          <div
            key={ticket.id}
            onClick={() => {
              if (typeId && !isDisabled) onSelect(typeId);
            }}
            tabIndex={isDisabled ? -1 : 0}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            onKeyDown={(e) => {
              if (
                (e.key === 'Enter' || e.key === ' ') &&
                typeId &&
                !isDisabled
              ) {
                e.preventDefault();
                onSelect(typeId);
              }
            }}
            className={cn(
              'group relative w-full cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-200 outline-none',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30',
              isDisabled &&
                'cursor-not-allowed bg-muted/20 opacity-50 hover:border-border hover:bg-transparent',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40 group-hover:border-primary/60',
                  )}
                >
                  {isSelected && (
                    <div className="h-1.5 w-1.5 rounded-full bg-background" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold leading-none text-foreground">
                      {ticket.name}
                    </span>
                    {type?.display_name && (
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[10px] font-medium uppercase tracking-wider"
                      >
                        {type.display_name}
                      </Badge>
                    )}
                  </div>

                  {ticket.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {ticket.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3 shrink-0" />
                    {isSoldOut ? (
                      <span className="font-medium text-destructive">
                        Sold out
                      </span>
                    ) : isInactive ? (
                      <span>Unavailable</span>
                    ) : (
                      <span>{ticket.quantity} spots available</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-0.5 text-right">
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(ticket.price)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}