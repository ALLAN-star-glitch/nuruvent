// components/events/new/hooks/useEventValidation.ts

'use client';

import { useCallback, useMemo } from 'react';

import type {
  EventFormData,
  FormErrors,
  TicketForm,
} from '@/components/events/new';

// ============================================================
// useEventValidation
// ============================================================
//
// Two responsibilities:
//
//   validateStep(step)  — per-step validation, called on "Next" and
//                         on Publish. Returns a FormErrors map.
//
//   isPublishReady      — computed boolean. True only when every
//                         required field for publishing is present.
//
// Steps (5-step wizard):
//   1  Basic Info   name, event type, first schedule, description
//   2  Tickets      at least one usable ticket, capacity vs quantities
//   3  Details      virtual link / location, recurrence, invite-only
//   4  Content      nothing required
//   5  Review       nothing required
//
// Rules mirror the backend's ValidateForPublish. When the backend
// adds a rule, add it here too.

export interface UseEventValidationResult {
  validateStep: (step: number) => FormErrors;
  isPublishReady: boolean;
}

/** A ticket is usable when it has a type and a positive quantity. */
function isUsableTicket(t: TicketForm): boolean {
  return !!t.ticket_type_id && (t.quantity ?? 0) > 0;
}

export function useEventValidation(
  formData: EventFormData,
): UseEventValidationResult {
  // ---- Per-step validation ----
  const validateStep = useCallback(
    (step: number): FormErrors => {
      const newErrors: FormErrors = {};

      switch (step) {
        case 1: {
          // ---- Basic info ----
          if (!formData.name?.trim()) {
            newErrors.name = 'Event name is required';
          } else if (formData.name.length > 100) {
            newErrors.name = 'Event name must be less than 100 characters';
          }

          if (!formData.event_type_id) {
            newErrors.event_type_id = 'Event type is required';
          }

          const first = formData.schedules?.[0];
          if (!first) {
            newErrors.schedules = 'Add at least one schedule';
          } else if (!first.start_date) {
            newErrors.schedules = 'Start date is required';
          } else if (!first.start_time) {
            newErrors.schedules = 'Start time is required';
          } else if (!first.end_time) {
            newErrors.schedules = 'End time is required';
          } else if (first.start_time >= first.end_time) {
            newErrors.schedules = 'End time must be after start time';
          } else if (
            first.end_date &&
            first.start_date &&
            first.end_date < first.start_date
          ) {
            newErrors.schedules = 'End date cannot be before start date';
          }

          if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
          }

          break;
        }

        case 2: {
          // ---- Tickets ----
          const usable = formData.tickets.filter(isUsableTicket);
          if (usable.length === 0) {
            newErrors.tickets =
              'Add at least one ticket with a type and quantity';
          } else {
            // Capacity check: sum of usable ticket quantities must not
            // exceed the event-wide capacity (when set).
            if (formData.capacity !== null && formData.capacity > 0) {
              const totalQty = usable.reduce(
                (sum, t) => sum + (t.quantity ?? 0),
                0,
              );
              if (totalQty > formData.capacity) {
                newErrors.capacity = `Total ticket quantities (${totalQty}) exceed capacity (${formData.capacity})`;
              }
            }

            // Each ticket's quantity must be positive
            const badIndex = formData.tickets.findIndex(
              (t) => t.ticket_type_id && (t.quantity ?? 0) <= 0,
            );
            if (badIndex !== -1) {
              newErrors.tickets = `Ticket ${badIndex + 1}: quantity must be at least 1`;
            }
          }

          // Waitlist requires capacity
          if (
            formData.waitlist_enabled &&
            (formData.capacity === null || formData.capacity === 0)
          ) {
            newErrors.capacity =
              'Waitlist can only be enabled when capacity is set';
          }

          break;
        }

        case 3: {
          // ---- Details: location / meeting link ----
          if (formData.is_virtual) {
            const hasLink =
              formData.zoom_link ||
              formData.meet_link ||
              formData.virtual_platform_url;
            if (!hasLink) {
              newErrors.zoom_link =
                'At least one meeting link is required for virtual events';
            }
          } else {
            const hasLocation =
              formData.location ||
              formData.venue_name ||
              formData.venue_address;
            if (!hasLocation) {
              newErrors.location = 'Location is required for in-person events';
            }
          }

          // Certificate price
          if (
            formData.certificate_enabled &&
            formData.certificate_price !== null &&
            formData.certificate_price < 0
          ) {
            newErrors.certificate_price =
              'Certificate price cannot be negative';
          }

          // Recurrence
          if (formData.is_recurring && formData.recurrence) {
            const r = formData.recurrence;
            if (!r.pattern) {
              newErrors.recurrence = 'Pick a recurrence pattern.';
            } else if (
              r.pattern === 'weekly' &&
              r.days_of_week.length === 0
            ) {
              newErrors.recurrence = 'Pick at least one day of the week.';
            } else if (
              r.pattern === 'monthly' &&
              !r.day_of_month &&
              !r.week_of_month
            ) {
              newErrors.recurrence =
                'Pick a day of month or week of month.';
            } else if (!r.ends_on && !r.occurrences) {
              newErrors.recurrence =
                'Set an end date or number of occurrences.';
            }
          }

          break;
        }

        case 4:
          // ---- Content: nothing required ----
          break;

        case 5:
          // ---- Review: nothing required ----
          break;
      }

      return newErrors;
    },
    [formData],
  );

  // ---- Publish readiness ----
  const isPublishReady = useMemo(() => {
    // ---- Field-level checks ----
    const hasName = !!formData.name?.trim();
    const hasEventType = !!formData.event_type_id;
    const hasDescription = !!formData.description?.trim();

    const first = formData.schedules?.[0];
    const hasSchedule =
      !!first &&
      !!first.start_date &&
      !!first.start_time &&
      !!first.end_time &&
      first.start_time < first.end_time &&
      (!first.end_date ||
        !first.start_date ||
        first.end_date >= first.start_date);

    const usableTickets = formData.tickets.filter(isUsableTicket);
    const hasTickets = usableTickets.length > 0;

    const capacityOk =
      formData.capacity === null ||
      formData.capacity === 0 ||
      usableTickets.reduce((sum, t) => sum + (t.quantity ?? 0), 0) <=
        formData.capacity;

    const waitlistOk =
      !formData.waitlist_enabled ||
      (formData.capacity !== null && formData.capacity > 0);

    const hasLocationOrLink = formData.is_virtual
      ? !!(
          formData.zoom_link ||
          formData.meet_link ||
          formData.virtual_platform_url
        )
      : !!(
          formData.location ||
          formData.venue_name ||
          formData.venue_address
        );

    const recurrenceOk =
      !formData.is_recurring ||
      (!!formData.recurrence?.pattern &&
        (formData.recurrence.pattern !== 'weekly' ||
          formData.recurrence.days_of_week.length > 0) &&
        (formData.recurrence.pattern !== 'monthly' ||
          !!formData.recurrence.day_of_month ||
          !!formData.recurrence.week_of_month) &&
        (!!formData.recurrence.ends_on ||
          !!formData.recurrence.occurrences));

    const certificateOk =
      !formData.certificate_enabled ||
      formData.certificate_price === null ||
      formData.certificate_price >= 0;

    const fieldChecksPass =
      hasName &&
      hasEventType &&
      hasDescription &&
      hasSchedule &&
      hasTickets &&
      capacityOk &&
      waitlistOk &&
      hasLocationOrLink &&
      recurrenceOk &&
      certificateOk;

    if (!fieldChecksPass) return false;

    // ---- Step-level checks ----
    // Every step with required fields must validate cleanly.
    return (
      Object.keys(validateStep(1)).length === 0 &&
      Object.keys(validateStep(2)).length === 0 &&
      Object.keys(validateStep(3)).length === 0
    );
  }, [formData, validateStep]);

  return {
    validateStep,
    isPublishReady,
  };
}