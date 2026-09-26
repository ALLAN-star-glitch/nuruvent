// components/events/ai/draftToPublishPayload.ts

import type {
  CreateEventRequest,
  GeneratedEventDraft,
  ScheduleInput,
  TicketInput,
} from '@/lib/types/events';

// ============================================================
// draftToPublishPayload
// ============================================================
//
// Turns the AI's draft into a payload the backend's POST /events
// endpoint accepts.
//
// The AI draft carries only identity, discovery, pricing, policy, and
// one canonical schedule. Event-level timing, venue, and virtual/
// hybrid flags are NOT part of the AI's output. The backend derives
// them from the schedules.
//
// This function therefore emits NO event-level derived fields
// (is_virtual, is_hybrid, zoom_link, meet_link, virtual_platform,
// venue_*, in_person_location). The backend will compute them.

export function draftToPublishPayload(
  draft: GeneratedEventDraft,
  eventTypeId: string,
  categoryId?: string,
): CreateEventRequest {
  const schedules = buildSchedules(draft);
  const tickets = buildTickets(draft);

  return {
    // ---- Required ----
    name: draft.name,
    description: draft.description,
    event_type_id: eventTypeId,
    schedules,
    tickets,
    visibility: draft.visibility ?? 'public',

    // ---- Basic optional ----
    short_description: draft.short_description || undefined,
    category_id: categoryId || undefined,
    tags: draft.tags?.length ? draft.tags : undefined,
    language: draft.language || undefined,

    // ---- Recurrence ----
    is_recurring: draft.is_recurring || undefined,
    recurrence: draft.recurrence
      ? {
          pattern: draft.recurrence.pattern,
          interval: draft.recurrence.interval,
          days_of_week: draft.recurrence.days_of_week,
          day_of_month: draft.recurrence.day_of_month,
          week_of_month: draft.recurrence.week_of_month,
          ends_on: draft.recurrence.ends_on,
          occurrences: draft.recurrence.occurrences,
        }
      : undefined,

    // ---- Tickets / capacity ----
    is_free: deriveIsFree(tickets),
    capacity: draft.capacity ?? undefined,

    // ---- Access ----
    invite_only: draft.invite_only || undefined,

    // ---- Monetization ----
    is_featured: draft.is_featured || undefined,
    certificate_enabled: draft.certificate_enabled || undefined,

    // ---- Not produced by AI ----
    speakers: undefined,
    materials: undefined,
    seo: undefined,
  };
}

// ============================================================
// SUB-BUILDERS
// ============================================================

function buildSchedules(draft: GeneratedEventDraft): ScheduleInput[] {
  const usable = (draft.schedules ?? []).filter(
    (s) => s.start_date && s.start_time && s.end_time,
  );

  return usable.map((s) => ({
    start_date: s.start_date,
    start_time: s.start_time,
    end_time: s.end_time,
    timezone: s.timezone || 'Africa/Nairobi',
    session_name: s.session_name || undefined,
    session_number: s.session_number ?? undefined,
    location: s.location || undefined,
    is_virtual: s.is_virtual,
    // zoom_link / meet_link intentionally omitted — the backend
    // creates the meeting if the schedule is virtual.
    max_attendees: s.max_attendees ?? undefined,
  }));
}

function buildTickets(draft: GeneratedEventDraft): TicketInput[] {
  const usable = (draft.tickets ?? []).filter(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  );

  return usable.map((t) => ({
    ticket_type_id: t.ticket_type_id,
    name: t.name || undefined,
    description: t.description || undefined,
    price: t.price ?? 0,
    quantity: t.quantity ?? 1,
    max_per_person: t.max_per_person ?? undefined,
    early_bird_deadline: t.early_bird_deadline || undefined,
    group_min_attendees: t.group_min_attendees ?? undefined,
    group_discount: t.group_discount ?? undefined,
  }));
}

function deriveIsFree(tickets: TicketInput[]): boolean {
  if (tickets.length === 0) return false;
  return tickets.every((t) => (t.price ?? 0) === 0);
}