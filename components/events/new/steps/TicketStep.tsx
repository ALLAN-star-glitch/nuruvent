// components/events/new/steps/TicketStep.tsx

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { TicketListField } from '@/components/events/fields/TicketListField';
import { WaitlistField } from '@/components/events/fields/WaitlistField';
import { NumberField } from '@/components/form';

import type {
  EventFormData,
  FormErrors,
} from '../../types';

// ============================================================
// TICKET STEP (Step 2)
// ============================================================
//
// Fields rendered:
//   - Tickets *           (TicketListField — accordion array editor)
//   - Capacity            (NumberField — event-wide maximum)
//   - Waitlist            (WaitlistField — toggle)
//
// Note on capacity vs ticket quantities:
//   `capacity` is the event-wide maximum, independent of the sum of
//   ticket quantities. It's a top-level field on the payload. Ticket
//   quantities are per-ticket. Both matter — the backend checks that
//   the sum of ticket quantities doesn't exceed capacity.

interface TicketStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
}

export function TicketStep({
  formData,
  validationErrors,
  onFieldChange,
}: TicketStepProps) {
  return (
    <div className="space-y-6">
      {/* ---- Tickets ---- */}
      <Card className="border border-neutral-light">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-dark">
            Tickets
          </CardTitle>
          <CardDescription className="text-xs text-neutral-gray">
            Define the ticket options attendees can purchase. Add multiple
            tickets for tiered access, VIP passes, or different price points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketListField
            value={formData.tickets}
            onChange={(v) => onFieldChange('tickets', v)}
            error={validationErrors.tickets}
          />
        </CardContent>
      </Card>

      {/* ---- Capacity ---- */}
      <Card className="border border-neutral-light">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-dark">
            Capacity
          </CardTitle>
          <CardDescription className="text-xs text-neutral-gray">
            The maximum number of attendees for the whole event. If left
            blank, capacity is unlimited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NumberField
            name="capacity"
            label="Maximum Attendees"
            placeholder="Leave blank for unlimited"
            value={formData.capacity}
            onChange={(v) => onFieldChange('capacity', v)}
            min={0}
            helper="The sum of ticket quantities can't exceed this."
            error={validationErrors.capacity}
          />
        </CardContent>
      </Card>

      {/* ---- Waitlist ---- */}
      <WaitlistField
        value={formData.waitlist_enabled}
        onChange={(v) => onFieldChange('waitlist_enabled', v)}
        error={validationErrors.capacity}
      />
    </div>
  );
}