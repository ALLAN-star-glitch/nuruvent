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
//
// Accordion list editor for one or more tickets. One open at a time.
// Header shows a summary; body shows the fields.
//
// A ticket is "usable" when it has a ticket_type_id and quantity > 0.
// Rows that are still empty are visually marked but not dropped —
// the transform layer filters them out of the payload.

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

  // Auto-expand the first incomplete ticket on mount.
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

  // ---- Mutators ----

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
    // Default to the first available ticket type so the user has one
    // less decision to make.
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
        <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
          <TicketIcon className="h-4 w-4 text-primary-500" />
          Tickets <span className="text-error-500">*</span>
        </Label>
        <span className="text-xs text-neutral-gray">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      {/* Loading state */}
      {isLoadingTypes && (
        <p className="text-xs text-neutral-gray">Loading ticket types…</p>
      )}

      {/* No types available */}
      {!isLoadingTypes && ticketTypes.length === 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
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
                'border rounded-lg bg-white transition-shadow',
                isOpen
                  ? 'border-primary-300 shadow-sm'
                  : 'border-neutral-light hover:border-neutral-300',
              )}
            >
              {/* ---- Header ---- */}
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleOpen(ticket._key)}
                  disabled={disabled}
                  className="flex-1 flex items-start gap-3 text-left cursor-pointer min-w-0"
                  aria-expanded={isOpen}
                >
                  <div className="pt-0.5 text-neutral-gray">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-neutral-dark truncate">
                        {displayName}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-gray bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
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
                    className="p-1.5 rounded-md text-neutral-gray hover:text-error-500 hover:bg-error-50 transition-colors cursor-pointer shrink-0"
                    aria-label={`Remove ${displayName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {/* Inline remove confirmation */}
                {isPendingRemove && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-neutral-gray mr-1">
                      Remove?
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingRemoveKey(null)}
                      disabled={disabled}
                      className="px-2 py-1 text-xs rounded border border-neutral-light text-neutral-gray hover:bg-neutral-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmRemove(ticket._key)}
                      disabled={disabled}
                      className="px-2 py-1 text-xs rounded bg-error-500 text-white hover:bg-error-600 cursor-pointer"
                    >
                      Yes
                    </button>
                  </div>
                )}
              </div>

              {/* ---- Body ---- */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-light space-y-4">
                  {/* Ticket type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-neutral-dark">
                      Ticket Type <span className="text-error-500 ml-1">*</span>
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
                          Quantity <span className="text-error-500 ml-1">*</span>
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
        <p className="text-xs text-neutral-gray text-center">
          Maximum of {MAX_TICKETS} tickets reached.
        </p>
      )}

      {/* Error */}
      {error && <p className="text-sm text-error-500">{error}</p>}
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
      <span className="text-xs text-amber-600 italic">
        Needs ticket type and quantity
      </span>
    );
  }

  const price = ticket.price ?? 0;
  const priceLabel = price === 0 ? 'Free' : `${price} KES`;
  const quantity = ticket.quantity ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-gray">
      <span className="font-medium text-neutral-dark">{priceLabel}</span>
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