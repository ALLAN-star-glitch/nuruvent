// components/events/mapEventToForm.ts

import type {
  Event as EventModel,
  Material as MaterialModel,
  Recurrence as RecurrenceModel,
  Schedule as ScheduleModel,
  SEO as SEOModel,
  Speaker as SpeakerModel,
  Ticket as TicketModel,
} from '@/lib/types/events';

import {
  makeEmptyRecurrence,
  makeEmptySchedule,
  makeEmptyTicket,
  type EventFormData,
  type MaterialForm,
  type RecurrenceForm,
  type ScheduleForm,
  type SEOForm,
  type SpeakerForm,
  type TicketForm,
} from './types';

// ============================================================
// mapEventToForm
// ============================================================
//
// Inverse of transform.ts. Takes the API's `Event` response and
// produces the wizard's `EventFormData`. Used by the edit wizard to
// hydrate its form state.
//
// Notes:
//   - Schedules are mapped 1:1 from the API's `schedules[]`.
//   - Tickets are mapped 1:1 from the API's `tickets[]`.
//   - The API's `Ticket.ticket_type` is a full object; we extract its
//     `id` into `TicketForm.ticket_type_id`.
//   - The API's `Material.type` is a display string, not the ID we
//     need for `MaterialForm.material_type_id`. We leave that field
//     empty — the user re-selects the type if they care.
//   - Recurrence maps what the API returns; missing optional fields
//     default to null/empty so the UI doesn't receive undefined.

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${Date.now()}-${keyCounter}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

// ============================================================
// HELPERS
// ============================================================

/** "2026-11-15T00:00:00Z" → "2026-11-15". Returns "" on bad input. */
function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  // If it's already YYYY-MM-DD, keep it.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** "09:00:00" → "09:00". Keeps "HH:MM" as-is. Returns "" on bad input. */
function toTimeInput(value: string | undefined | null): string {
  if (!value) return '';
  const parts = value.split(':');
  if (parts.length < 2) return '';
  return `${parts[0]}:${parts[1]}`;
}

// ============================================================
// SUB-MAPPERS
// ============================================================

function mapSchedule(s: ScheduleModel): ScheduleForm {
  return {
    _key: nextKey('sched'),
    start_date: toDateInput(s.start_date),
    end_date: toDateInput(s.end_date),
    start_time: toTimeInput(s.start_time),
    end_time: toTimeInput(s.end_time),
    timezone: s.timezone || 'Africa/Nairobi',
    session_name: s.session_name ?? '',
    session_number: s.session_number ?? null,
    location: s.location ?? '',
    is_virtual: s.is_virtual ?? true,
    zoom_link: s.zoom_link ?? '',
    meet_link: s.meet_link ?? '',
    max_attendees: s.max_attendees ?? null,
  };
}

function mapTicket(t: TicketModel): TicketForm {
  return {
    _key: nextKey('tkt'),
    id: t.id ?? '',
    ticket_type_id: t.ticket_type?.id ?? '',
    name: t.name ?? '',
    description: t.description ?? '',
    price: t.price ?? null,
    quantity: t.quantity ?? null,
    max_per_person: t.max_per_person ?? null,
    early_bird_deadline: t.early_bird_deadline ?? '',
    group_min_attendees: t.group_min_attendees ?? null,
    group_discount: t.group_discount ?? null,
  };
}

function mapSpeaker(s: SpeakerModel): SpeakerForm {
  return {
    _key: nextKey('spk'),
    id: s.id ?? '',
    name: s.name ?? '',
    title: s.title ?? '',
    bio: s.bio ?? '',
    photo_url: s.photo_url ?? '',
    social_links: s.social_links ?? {},
    is_keynote: s.is_keynote ?? false,
    sort_order: s.sort_order ?? 0,
  };
}

function mapMaterial(m: MaterialModel): MaterialForm {
  return {
    _key: nextKey('mat'),
    id: m.id ?? '',
    title: m.title ?? '',
    // The API's Material.type is a display string, not the ID.
    // Leave empty so the user re-selects it if they edit.
    material_type_id: '',
    url: m.url ?? '',
    description: m.description ?? '',
    is_pre_event: m.is_pre_event ?? false,
    sort_order: m.sort_order ?? 0,
  };
}

function mapSEO(seo: SEOModel | undefined): SEOForm | null {
  if (!seo) return null;

  // If everything is empty, treat it as "no SEO".
  const hasAny =
    seo.meta_title ||
    seo.meta_description ||
    (seo.meta_keywords && seo.meta_keywords.length) ||
    seo.canonical_url ||
    seo.robots ||
    seo.og_title ||
    seo.og_description ||
    seo.og_image_url ||
    seo.og_type ||
    seo.twitter_card ||
    seo.twitter_title ||
    seo.twitter_description ||
    seo.twitter_image_url;
  if (!hasAny) return null;

  return {
    meta_title: seo.meta_title ?? '',
    meta_description: seo.meta_description ?? '',
    meta_keywords: seo.meta_keywords ?? [],
    canonical_url: seo.canonical_url ?? '',
    robots: seo.robots ?? '',
    noindex: seo.noindex ?? false,
    og_title: seo.og_title ?? '',
    og_description: seo.og_description ?? '',
    og_image_url: seo.og_image_url ?? '',
    og_type: seo.og_type ?? '',
    twitter_card: seo.twitter_card ?? '',
    twitter_title: seo.twitter_title ?? '',
    twitter_description: seo.twitter_description ?? '',
    twitter_image_url: seo.twitter_image_url ?? '',
  };
}

function mapRecurrence(
  r: RecurrenceModel | undefined,
): RecurrenceForm | null {
  if (!r) return null;
  if (!r.pattern) return null;

  return {
    ...makeEmptyRecurrence(),
    pattern: r.pattern,
    interval: r.interval ?? null,
    days_of_week: r.days_of_week ?? [],
    day_of_month: r.day_of_month ?? null,
    week_of_month: r.week_of_month ?? '',
    ends_on: toDateInput(r.ends_on),
    occurrences: r.occurrences ?? null,
  };
}

// ============================================================
// MAIN MAPPER
// ============================================================

export function mapEventToForm(event: EventModel): EventFormData {
  // ---- Schedules ----
  const schedules: ScheduleForm[] =
    event.schedules && event.schedules.length > 0
      ? event.schedules.map(mapSchedule)
      : [makeEmptySchedule()];

  // ---- Tickets ----
  const tickets: TicketForm[] =
    event.tickets && event.tickets.length > 0
      ? event.tickets.map(mapTicket)
      : [makeEmptyTicket()];

  // ---- Speakers ----
  const speakers: SpeakerForm[] = (event.speakers ?? []).map(mapSpeaker);

  // ---- Materials ----
  const materials: MaterialForm[] = (event.materials ?? []).map(mapMaterial);

  // ---- SEO ----
  const seo = mapSEO(event.seo);

  // ---- Recurrence ----
  const recurrence = mapRecurrence(event.recurrence);

  // ---- Location fallback chain ----
  // venue.city is preferred; then in_person_location; then legacy
  // location from the API response.
  const location =
    event.venue?.city ??
    event.in_person_location ??
    '';

  // ---- Virtual link fallback chain ----
  const virtualPlatformUrl = event.virtual_platform_url ?? '';

  return {
    // ---- Basic ----
    name: event.display_name?.trim() || event.name || '',
    display_name: event.display_name ?? '',
    description: event.description ?? '',
    short_description: event.short_description ?? '',
    event_type_id: event.event_type?.id ?? '',
    category_id: event.category?.id ?? '',
    tags: event.tags ?? [],
    language: event.language ?? 'en',

    // ---- Schedule ----
    schedules,

    // ---- Recurrence ----
    is_recurring: event.is_recurring ?? false,
    recurrence,

    // ---- Venue ----
    is_virtual: event.is_virtual ?? true,
    is_hybrid: event.is_hybrid ?? false,
    location,
    zoom_link: event.zoom_link ?? '',
    meet_link: event.meet_link ?? '',
    virtual_platform: event.virtual_platform ?? '',
    virtual_platform_url: virtualPlatformUrl,
    venue_name: event.venue?.name ?? '',
    venue_address: event.venue?.address ?? '',
    venue_city: event.venue?.city ?? '',
    venue_country: event.venue?.country ?? '',

    // ---- Tickets ----
    tickets,
    capacity: event.capacity ?? null,
    waitlist_enabled: event.waitlist_enabled ?? false,

    // ---- Certificate ----
    certificate_enabled: event.certificate_enabled ?? false,
    certificate_price: event.certificate_price ?? null,
    certificate_template_id: event.certificate_template?.id ?? '',

    // ---- Access & privacy ----
    is_private: event.is_private ?? event.visibility === 'private',
    password: '', // API doesn't return the password
    invite_only: event.invite_only ?? false,
    invited_emails: event.invited_emails ?? [],

    // ---- Promotion ----
    is_featured: event.is_featured ?? false,

    // ---- Extras ----
    speakers,
    materials,
    seo,

    // ---- Media ----
    imagePreview: event.image_url ?? '',
  };
}