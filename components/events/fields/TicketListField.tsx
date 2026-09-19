/* eslint-disable react-hooks/set-state-in-effect */
// components/events/fields/TicketListField.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Ticket as TicketIcon,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  NumberField,
  TextField,
  TextareaField,
  fieldId,
  type FieldBaseProps,
} from '@/components/form';

import { useGetTicketTypesQuery } from '@/lib/store/api/eventsApi';

import { makeEmptyTicket, type TicketForm } from '../types';

// ============================================================
// TICKET LIST FIELD (events)
// ============================================================

interface TicketListFieldProps extends FieldBaseProps {
  value: TicketForm[];
  onChange: (value: TicketForm[]) => void;
}

const MAX_TICKETS = 10;

export function TicketListField({
  value,
  onChange,
  error,
  disabled,
  id,
}: TicketListFieldProps) {
  const { data: ticketTypesResponse, isLoading: isLoadingTypes } =
    useGetTicketTypesQuery();
  const ticketTypes = ticketTypesResponse?.data ?? [];

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);

  const tickets = useMemo(
    () => (value.length > 0 ? value : [makeEmptyTicket()]),
    [value],
  );

  useEffect(() => {
    if (openKey !== null) return;
    const firstIncomplete = tickets.find(
      (t) => !t.ticket_type_id || !(t.quantity && t.quantity > 0),
    );
    if (firstIncomplete) {
      setOpenKey(firstIncomplete._key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof TicketForm>(
    key: string,
    field: K,
    v: TicketForm[K],
  ) => {
    onChange(tickets.map((t) => (t._key === key ? { ...t, [field]: v } : t)));
  };

  const addTicket = () => {
    if (tickets.length >= MAX_TICKETS) return;
    const next = makeEmptyTicket();
    next.ticket_type_id = ticketTypes[0]?.id ?? '';
    onChange([...tickets, next]);
    setOpenKey(next._key);
  };

  const confirmRemove = (key: string) => {
    if (tickets.length <= 1) return;
    onChange(tickets.filter((t) => t._key !== key));
    if (openKey === key) setOpenKey(null);
    setPendingRemoveKey(null);
  };

  const toggleOpen = (key: string) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <div id={fieldId('tickets', id)} className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <TicketIcon className="h-4 w-4 text-primary" />
          Tickets <span className="text-destructive">*</span>
        </Label>
        <span className="text-xs text-muted-foreground">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      {/* Loading state */}
      {isLoadingTypes && (
        <p className="text-xs text-muted-foreground">Loading ticket types…</p>
      )}

      {/* No types available */}
      {!isLoadingTypes && ticketTypes.length === 0 && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-sm text-amber-700 dark:text-amber-300">
          No ticket types available. Add one in the admin panel before
          creating tickets.
        </div>
      )}

      {/* Rows */}
      <div className="space-y-2">
        {tickets.map((ticket, index) => {
          const isOpen = openKey === ticket._key;
          const isPendingRemove = pendingRemoveKey === ticket._key;
          const typeLabel =
            ticketTypes.find((tt) => tt.id === ticket.ticket_type_id)
              ?.display_name ??
            ticketTypes.find((tt) => tt.id === ticket.ticket_type_id)?.name ??
            'No type';

          const isUsable =
            !!ticket.ticket_type_id && (ticket.quantity ?? 0) > 0;

          const displayName = ticket.name?.trim() || `Ticket ${index + 1}`;

          return (
            <div
              key={ticket._key}
              className={cn(
                'border rounded-lg bg-card transition-shadow',
                isOpen
                  ? 'border-primary/40 shadow-sm'
                  : 'border-border hover:border-border/80',
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleOpen(ticket._key)}
                  disabled={disabled}
                  className="flex-1 flex items-start gap-3 text-left cursor-pointer min-w-0"
                  aria-expanded={isOpen}
                >
                  <div className="pt-0.5 text-muted-foreground">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {typeLabel}
                      </span>
                    </div>

                    <div className="mt-1">
                      <TicketSummary
                        ticket={ticket}
                        isUsable={isUsable}
                      />
                    </div>
                  </div>
                </button>

                {/* Remove button */}
                {tickets.length > 1 && !isPendingRemove && (
                  <button
                    type="button"
                    onClick={() => setPendingRemoveKey(ticket._key)}
                    disabled={disabled}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                    aria-label={`Remove ${displayName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {/* Inline remove confirmation */}
                {isPendingRemove && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground mr-1">
                      Remove?
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingRemoveKey(null)}
                      disabled={disabled}
                      className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:bg-accent cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmRemove(ticket._key)}
                      disabled={disabled}
                      className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                      Yes
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                  {/* Ticket type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">
                      Ticket Type <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select
                      value={ticket.ticket_type_id || undefined}
                      onValueChange={(v) =>
                        update(ticket._key, 'ticket_type_id', v)
                      }
                      disabled={disabled || isLoadingTypes}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((tt) => (
                          <SelectItem
                            key={tt.id}
                            value={tt.id}
                            className="cursor-pointer"
                          >
                            {tt.display_name || tt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name */}
                  <TextField
                    name={`ticket_${index}_name`}
                    label="Ticket Name"
                    placeholder="e.g., VIP Engineer Pass"
                    value={ticket.name}
                    onChange={(v) => update(ticket._key, 'name', v)}
                    optional
                    disabled={disabled}
                  />

                  {/* Description */}
                  <TextareaField
                    name={`ticket_${index}_description`}
                    label="Description"
                    placeholder="What's included with this ticket?"
                    value={ticket.description}
                    onChange={(v) => update(ticket._key, 'description', v)}
                    optional
                    disabled={disabled}
                    minHeightClass="min-h-[70px]"
                  />

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberField
                      name={`ticket_${index}_price`}
                      label="Price"
                      suffix="KES"
                      placeholder="0"
                      value={ticket.price}
                      onChange={(v) => update(ticket._key, 'price', v)}
                      min={0}
                      decimal
                      step="0.01"
                      helper="Set to 0 for a free ticket."
                      disabled={disabled}
                    />
                    <NumberField
                      name={`ticket_${index}_quantity`}
                      label={
                        <>
                          Quantity <span className="text-destructive ml-1">*</span>
                        </>
                      }
                      placeholder="e.g., 100"
                      value={ticket.quantity}
                      onChange={(v) => update(ticket._key, 'quantity', v)}
                      min={1}
                      helper="How many are available."
                      disabled={disabled}
                    />
                  </div>

                  {/* Max per person + Early bird */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberField
                      name={`ticket_${index}_max_per_person`}
                      label="Max per person"
                      placeholder="e.g., 4"
                      value={ticket.max_per_person}
                      onChange={(v) =>
                        update(ticket._key, 'max_per_person', v)
                      }
                      min={1}
                      optional
                      disabled={disabled}
                    />
                    <TextField
                      name={`ticket_${index}_early_bird_deadline`}
                      label="Early bird deadline"
                      placeholder="YYYY-MM-DD HH:MM"
                      value={ticket.early_bird_deadline}
                      onChange={(v) =>
                        update(ticket._key, 'early_bird_deadline', v)
                      }
                      optional
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add button */}
      {tickets.length < MAX_TICKETS && ticketTypes.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={addTicket}
          disabled={disabled}
          className="w-full cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another ticket
        </Button>
      )}

      {tickets.length >= MAX_TICKETS && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum of {MAX_TICKETS} tickets reached.
        </p>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// TICKET SUMMARY (collapsed state)
// ============================================================

interface TicketSummaryProps {
  ticket: TicketForm;
  isUsable: boolean;
}

function TicketSummary({ ticket, isUsable }: TicketSummaryProps) {
  if (!isUsable) {
    return (
      <span className="text-xs text-amber-600 dark:text-amber-400 italic">
        Needs ticket type and quantity
      </span>
    );
  }

  const price = ticket.price ?? 0;
  const priceLabel = price === 0 ? 'Free' : `${price} KES`;
  const quantity = ticket.quantity ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{priceLabel}</span>
      <span>·</span>
      <span>{quantity} available</span>
      {ticket.max_per_person && (
        <>
          <span>·</span>
          <span>max {ticket.max_per_person}/person</span>
        </>
      )}
    </div>
  );
}