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
// Steps (5-step wizard):
//   1  Basic Info   name, event type, first schedule, description
//   2  Tickets      at least one usable ticket, capacity vs quantities
//   3  Details      recurrence, certificate, invite-only
//   4  Content      nothing required
//   5  Review       nothing required
//
// Schedule-level checks live in validateSchedule() and run on step 1
// and during publish readiness. Meeting-link and location validation
// are per-session: a session is either virtual (needs a link or a
// connected host) or in-person (needs a location label).
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

/** A schedule is usable when it has all required date/time fields. */
function isUsableSchedule(s: ScheduleForm): boolean {
  return !!(s.start_date && s.start_time && s.end_time);
}

/**
 * Validate a single schedule row. Returns an error string or null.
 *
 * Rules:
 *   - start_date, start_time, end_time required
 *   - end_time > start_time
 *   - end_date >= start_date when set
 *   - if virtual: no link is required (backend auto-creates), but if a
 *     link IS provided it must be a plausible URL
 *   - if not virtual: location label required
 */
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
    // Manual links are optional. If provided, they must look like URLs.
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

          // ---- Schedules ----
          // Every schedule must validate. The first message wins so the
          // form shows one actionable error at a time.
          if (!formData.schedules || formData.schedules.length === 0) {
            newErrors.schedules = 'Add at least one schedule';
          } else {
            for (let i = 0; i < formData.schedules.length; i++) {
              const err = validateSchedule(formData.schedules[i], i);
              if (err) {
                newErrors.schedules = err;
                break;
              }
            }
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

            // Each ticket's quantity must be positive.
            const badIndex = formData.tickets.findIndex(
              (t) => t.ticket_type_id && (t.quantity ?? 0) <= 0,
            );
            if (badIndex !== -1) {
              newErrors.tickets = `Ticket ${badIndex + 1}: quantity must be at least 1`;
            }
          }

          // Waitlist requires capacity.
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
          // ---- Details: recurrence + certificate ----
          // Location and meeting-link validation moved to step 1
          // (they are per-schedule now).

          if (
            formData.certificate_enabled &&
            formData.certificate_price !== null &&
            formData.certificate_price < 0
          ) {
            newErrors.certificate_price =
              'Certificate price cannot be negative';
          }

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

    // All schedules must be usable and validate cleanly.
    const schedules = formData.schedules ?? [];
    const hasSchedules = schedules.length > 0;
    const allSchedulesValid =
      hasSchedules &&
      schedules.every((s) => validateSchedule(s, 0) === null);

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

    const certificateOk =
      !formData.certificate_enabled ||
      formData.certificate_price === null ||
      formData.certificate_price >= 0;

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