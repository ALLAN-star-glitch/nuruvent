// components/events/new/hooks/useEventValidation.ts

'use client';

import { useCallback, useMemo } from 'react';

import type {
  EventFormData,
  FormErrors,
  ScheduleForm,
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
// Steps (6-step wizard):
//   1  Basic Info   name, event type, description
//   2  Schedule     at least one session, recurrence rules
//   3  Tickets      at least one usable ticket, capacity vs quantities
//   4  Details      certificate tier, invite-only
//   5  Content      nothing required
//   6  Review       nothing required
//
// Certificate pricing is no longer user-entered — the organizer picks
// a system tier and the backend resolves the price from that tier. The
// only check here is that a tier was chosen when certificates are
// enabled.

export interface UseEventValidationResult {
  validateStep: (step: number) => FormErrors;
  isPublishReady: boolean;
}

/** A ticket is usable when it has a type and a positive quantity. */
function isUsableTicket(t: TicketForm): boolean {
  return !!t.ticket_type_id && (t.quantity ?? 0) > 0;
}

/** A schedule is usable when it has all required date/time fields. */
function isUsableSchedule(s: ScheduleForm): boolean {
  return !!(s.start_date && s.start_time && s.end_time);
}

function validateSchedule(s: ScheduleForm, index: number): string | null {
  const prefix = `Session ${index + 1}`;

  if (!s.start_date) return `${prefix}: start date is required`;
  if (!s.start_time) return `${prefix}: start time is required`;
  if (!s.end_time) return `${prefix}: end time is required`;
  if (s.start_time >= s.end_time) {
    return `${prefix}: end time must be after start time`;
  }
  if (s.end_date && s.start_date && s.end_date < s.start_date) {
    return `${prefix}: end date cannot be before start date`;
  }

  if (s.is_virtual) {
    const zoom = s.zoom_link?.trim();
    if (zoom && !/^https?:\/\//i.test(zoom)) {
      return `${prefix}: Zoom link must start with http:// or https://`;
    }
    const meet = s.meet_link?.trim();
    if (meet && !/^https?:\/\//i.test(meet)) {
      return `${prefix}: Google Meet link must start with http:// or https://`;
    }
  } else {
    if (!s.location?.trim()) {
      return `${prefix}: location is required for in-person sessions`;
    }
  }

  return null;
}

export function useEventValidation(
  formData: EventFormData,
): UseEventValidationResult {
  const validateStep = useCallback(
    (step: number): FormErrors => {
      const newErrors: FormErrors = {};

      switch (step) {
        case 1: {
          // ---- Basic Info ----
          if (!formData.name?.trim()) {
            newErrors.name = 'Event name is required';
          } else if (formData.name.length > 100) {
            newErrors.name = 'Event name must be less than 100 characters';
          }

          if (!formData.event_type_id) {
            newErrors.event_type_id = 'Event type is required';
          }

          if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
          }

          break;
        }

        case 2: {
          // ---- Schedule ----
          if (!formData.schedules || formData.schedules.length === 0) {
            newErrors.schedules = 'Add at least one schedule';
          } else {
            // When recurring, only the first schedule is the template
            // and the backend ignores the rest. Validate only the
            // template in that case.
            const schedulesToCheck = formData.is_recurring
              ? formData.schedules.slice(0, 1)
              : formData.schedules;

            for (let i = 0; i < schedulesToCheck.length; i++) {
              const err = validateSchedule(schedulesToCheck[i], i);
              if (err) {
                newErrors.schedules = err;
                break;
              }
            }
          }

          // Recurrence validity — only when the toggle is on.
          if (formData.is_recurring) {
            const r = formData.recurrence;
            if (!r || !r.pattern) {
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

        case 3: {
          // ---- Tickets ----
          const usable = formData.tickets.filter(isUsableTicket);
          if (usable.length === 0) {
            newErrors.tickets =
              'Add at least one ticket with a type and quantity';
          } else {
            if (formData.capacity !== null && formData.capacity > 0) {
              const totalQty = usable.reduce(
                (sum, t) => sum + (t.quantity ?? 0),
                0,
              );
              if (totalQty > formData.capacity) {
                newErrors.capacity = `Total ticket quantities (${totalQty}) exceed capacity (${formData.capacity})`;
              }
            }

            const badIndex = formData.tickets.findIndex(
              (t) => t.ticket_type_id && (t.quantity ?? 0) <= 0,
            );
            if (badIndex !== -1) {
              newErrors.tickets = `Ticket ${badIndex + 1}: quantity must be at least 1`;
            }
          }

          if (
            formData.waitlist_enabled &&
            (formData.capacity === null || formData.capacity === 0)
          ) {
            newErrors.capacity =
              'Waitlist can only be enabled when capacity is set';
          }

          break;
        }

        case 4: {
          // ---- Details ----
          // Certificate tier — required when certificates are enabled.
          if (
            formData.certificate_enabled &&
            !formData.certificate_template_id
          ) {
            newErrors.certificate_template_id =
              'Select a certificate tier.';
          }

          break;
        }

        case 5:
          // ---- Content ---- (nothing required)
          break;

        case 6:
          // ---- Review ---- (nothing required)
          break;
      }

      return newErrors;
    },
    [formData],
  );

  const isPublishReady = useMemo(() => {
    const hasName = !!formData.name?.trim();
    const hasEventType = !!formData.event_type_id;
    const hasDescription = !!formData.description?.trim();

    const schedules = formData.schedules ?? [];
    const hasSchedules = schedules.length > 0;

    // When recurring, only the template (first schedule) is validated
    // against the schedule rules. The rest are ignored by the backend.
    const schedulesToCheck = formData.is_recurring
      ? schedules.slice(0, 1)
      : schedules;
    const allSchedulesValid =
      hasSchedules &&
      schedulesToCheck.every((s) => validateSchedule(s, 0) === null);

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

    // Certificate: when enabled, a tier must be chosen.
    const certificateOk =
      !formData.certificate_enabled ||
      !!formData.certificate_template_id;

    const fieldChecksPass =
      hasName &&
      hasEventType &&
      hasDescription &&
      allSchedulesValid &&
      hasTickets &&
      capacityOk &&
      waitlistOk &&
      recurrenceOk &&
      certificateOk;

    if (!fieldChecksPass) return false;

    return (
      Object.keys(validateStep(1)).length === 0 &&
      Object.keys(validateStep(2)).length === 0 &&
      Object.keys(validateStep(3)).length === 0 &&
      Object.keys(validateStep(4)).length === 0
    );
  }, [formData, validateStep]);

  return {
    validateStep,
    isPublishReady,
  };
}