// components/events/new/steps/TicketStep.tsx

'use client';

import { AlertCircle } from 'lucide-react';

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
      {/* ---- Open-access banner ---- */}
      {!formData.registration_enabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Registration is disabled
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Because this is an open access event, attendees will not
              register or select tickets. You can safely leave the ticket
              details below blank, or turn registration back on in Step 1
              to sell tickets.
            </p>
          </div>
        </div>
      )}

      {/* ---- Tickets ---- */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Tickets
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
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
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Capacity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
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