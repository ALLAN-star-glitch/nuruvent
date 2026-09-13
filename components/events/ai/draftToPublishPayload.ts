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
// The AI's shape is close to the request shape but a few things
// need normalizing:
//
//   - Schedules come with nullable end_date, zoom_link, meet_link.
//     The request expects optional strings, not nulls.
//   - Tickets come with nullable max_per_person. Same normalization.
//   - The AI does not send is_recurring / recurrence.
//   - display_name is not sent — the backend derives it from name.
//   - event_type_id and category_id are inputs to the modal, not
//     outputs from the AI. They're passed in by the caller.
//
// A "usable" schedule has start_date, start_time, end_time.
// A "usable" ticket has a ticket_type_id and quantity >= 1.

export function draftToPublishPayload(
  draft: GeneratedEventDraft,
  eventTypeId: string,
  categoryId?: string,
): CreateEventRequest {
  const schedules = buildSchedules(draft);
  const tickets = buildTickets(draft);

  const inPersonLocation =
    !draft.is_virtual && !draft.is_hybrid
      ? draft.venue_address || draft.in_person_location || undefined
      : draft.venue_address || undefined;

  const venueName =
    !draft.is_virtual && draft.venue_name
      ? draft.venue_name
      : !draft.is_virtual && draft.in_person_location
        ? draft.in_person_location
        : undefined;

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

    // ---- Venue ----
    is_virtual: draft.is_virtual ?? false,
    is_hybrid: draft.is_hybrid ?? false,
    virtual_platform: draft.virtual_platform || undefined,
    virtual_platform_url: draft.virtual_platform_url || undefined,
    venue_name: venueName,
    in_person_location: inPersonLocation,
    venue_address: draft.venue_address || undefined,
    venue_city: draft.venue_city || undefined,
    venue_country: draft.venue_country || undefined,
    zoom_link: undefined,
    meet_link: undefined,

    // ---- Tickets / capacity ----
    is_free: deriveIsFree(tickets),
    capacity: draft.capacity ?? undefined,
    waitlist_enabled: undefined,

    // ---- Access ----
    invite_only: draft.invite_only || undefined,
    invited_emails: undefined,
    password: undefined,

    // ---- Monetization ----
    is_featured: draft.is_featured || undefined,
    certificate_enabled: draft.certificate_enabled || undefined,

    // ---- Content (not produced by the AI) ----
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
    end_date: s.end_date || undefined,
    start_time: s.start_time,
    end_time: s.end_time,
    timezone: s.timezone || draft.timezone || 'Africa/Nairobi',
    session_name: s.session_name || undefined,
    session_number: s.session_number ?? undefined,
    location: s.location || undefined,
    is_virtual: s.is_virtual ?? draft.is_virtual ?? false,
    zoom_link: s.zoom_link || undefined,
    meet_link: s.meet_link || undefined,
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