// components/events/transform.ts

import type {
  CreateDraftRequest,
  CreateEventRequest,
  EventVisibility,
  GeneratedEventDraft,
  TicketInput,
  UpdateEventRequest,
} from '@/lib/types/events';

import type {
  EventFormData,
  MaterialForm,
  RecurrenceForm,
  ScheduleForm,
  SEOForm,
  SpeakerForm,
  TicketForm,
} from './types';

// ============================================================
// SCHEDULES
// ============================================================
//
// Schedules are the single source of truth for timing, venue, and
// virtual/hybrid info. The backend derives event-level fields from
// them. This module never sends event-level derived fields.

function schedulesToRequest(schedules: ScheduleForm[]) {
  const usable = schedules.filter(
    (s) => s.start_date && s.start_time && s.end_time,
  );
  if (!usable.length) return undefined;

  return usable.map((s) => ({
    start_date: s.start_date,
    end_date: s.end_date || undefined,
    start_time: s.start_time,
    end_time: s.end_time,
    timezone: s.timezone || 'Africa/Nairobi',
    session_name: s.session_name || undefined,
    session_number: s.session_number ?? undefined,
    location: s.location || undefined,
    is_virtual: s.is_virtual,
    // zoom_link / meet_link are only sent when the host pasted a link
    // manually. When they're empty, the backend auto-creates a meeting
    // on the host's connected account.
    zoom_link: s.zoom_link || undefined,
    meet_link: s.meet_link || undefined,
    max_attendees: s.max_attendees ?? undefined,
  }));
}

// ============================================================
// RECURRENCE
// ============================================================
//
// The backend publish-readiness check requires:
//   - pattern weekly  -> days_of_week must be non-empty
//   - pattern monthly -> day_of_month OR week_of_month must be set
//   - pattern custom  -> days_of_week must be non-empty
//
// If those conditions aren't met, we drop the recurrence entirely
// rather than send `days_of_week: []` (which the backend rejects).
// Dropping is preferable to a 400 because the event can still be
// published as a non-recurring event.

function recurrenceToRequest(recurrence: RecurrenceForm | null) {
  if (!recurrence || !recurrence.pattern) return undefined;

  const days = (recurrence.days_of_week ?? []).filter(Boolean);

  if (
    (recurrence.pattern === 'weekly' ||
      recurrence.pattern === 'custom') &&
    days.length === 0
  ) {
    return undefined;
  }

  if (
    recurrence.pattern === 'monthly' &&
    recurrence.day_of_month == null &&
    !recurrence.week_of_month
  ) {
    return undefined;
  }

  return {
    pattern: recurrence.pattern,
    interval: recurrence.interval ?? undefined,
    days_of_week: days.length ? days : undefined,
    day_of_month: recurrence.day_of_month ?? undefined,
    week_of_month: recurrence.week_of_month || undefined,
    ends_on: recurrence.ends_on || undefined,
    occurrences: recurrence.occurrences ?? undefined,
  };
}

// ============================================================
// TICKETS
// ============================================================

function ticketsToRequest(tickets: TicketForm[]): TicketInput[] | undefined {
  const usable = tickets.filter(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  );
  if (!usable.length) return undefined;

  return usable.map((t) => ({
    id: t.id || undefined,
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

function deriveIsFree(tickets: TicketForm[]): boolean {
  const usable = tickets.filter(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  );
  if (!usable.length) return false;
  return usable.every((t) => (t.price ?? 0) === 0);
}

// ============================================================
// SPEAKERS / MATERIALS / SEO
// ============================================================

function speakersToRequest(speakers: SpeakerForm[]) {
  const usable = speakers.filter((s) => s.name?.trim());
  if (!usable.length) return undefined;
  return usable.map((s) => ({
    id: s.id || undefined,
    name: s.name,
    title: s.title || undefined,
    bio: s.bio || undefined,
    photo_url: s.photo_url || undefined,
    social_links: Object.keys(s.social_links).length
      ? s.social_links
      : undefined,
    is_keynote: s.is_keynote,
    sort_order: s.sort_order,
  }));
}

function materialsToRequest(materials: MaterialForm[]) {
  const usable = materials.filter(
    (m) => m.title?.trim() && m.url?.trim(),
  );
  if (!usable.length) return undefined;
  return usable.map((m) => ({
    id: m.id || undefined,
    title: m.title,
    material_type_id: m.material_type_id,
    url: m.url,
    description: m.description || undefined,
    is_pre_event: m.is_pre_event,
    sort_order: m.sort_order,
  }));
}

function seoToRequest(seo: SEOForm | null) {
  if (!seo) return undefined;

  const hasAny =
    seo.meta_title ||
    seo.meta_description ||
    seo.meta_keywords.length ||
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
  if (!hasAny) return undefined;

  return {
    meta_title: seo.meta_title || undefined,
    meta_description: seo.meta_description || undefined,
    meta_keywords: seo.meta_keywords.length ? seo.meta_keywords : undefined,
    canonical_url: seo.canonical_url || undefined,
    robots: seo.robots || undefined,
    noindex: seo.noindex,
    og_title: seo.og_title || undefined,
    og_description: seo.og_description || undefined,
    og_image_url: seo.og_image_url || undefined,
    og_type: seo.og_type || undefined,
    twitter_card: seo.twitter_card || undefined,
    twitter_title: seo.twitter_title || undefined,
    twitter_description: seo.twitter_description || undefined,
    twitter_image_url: seo.twitter_image_url || undefined,
  };
}

// ============================================================
// SHARED BUILDER
// ============================================================

function buildCommonFields(form: EventFormData) {
  const schedules = schedulesToRequest(form.schedules);
  const tickets = ticketsToRequest(form.tickets);
  const is_free = deriveIsFree(form.tickets);

  const recurrence = recurrenceToRequest(form.recurrence);
  // If the recurrence was dropped (invalid config), the event is
  // effectively non-recurring — keep is_recurring in lockstep.
  const is_recurring = recurrence ? !!form.is_recurring : false;

  return {
    schedules,
    tickets,
    is_free,
    recurrence,
    is_recurring,
  };
}

// ============================================================
// DRAFT PAYLOAD
// ============================================================
//
// Event-level timing, venue, and virtual/hybrid fields are NOT sent.
// The backend derives them from `schedules`. The client still carries
// them in the form for UI display, but they are omitted here.

export function buildDraftPayload(form: EventFormData): CreateDraftRequest {
  const { schedules, tickets, is_free, recurrence, is_recurring } =
    buildCommonFields(form);

  return {
    name: form.name?.trim() || 'Untitled Event',
    description: form.description || '',
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id || undefined,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules,
    is_recurring: is_recurring || undefined,
    recurrence,
    is_free,
    capacity: form.capacity ?? undefined,
    tickets,
    visibility: (form.is_private ? 'private' : 'public') as EventVisibility,
    password: form.password || undefined,
    invite_only: form.invite_only || undefined,
    invited_emails: form.invited_emails.length
      ? form.invited_emails
      : undefined,
    is_featured: form.is_featured,
    certificate_enabled: form.certificate_enabled,
    certificate_price: form.certificate_enabled
      ? (form.certificate_price ?? 0)
      : undefined,
    certificate_template_id: form.certificate_template_id || undefined,
    speakers: speakersToRequest(form.speakers),
    materials: materialsToRequest(form.materials),
    seo: seoToRequest(form.seo),
  };
}

// ============================================================
// PUBLISH PAYLOAD
// ============================================================

export function buildPublishPayload(form: EventFormData): CreateEventRequest {
  const { schedules, tickets, is_free, recurrence, is_recurring } =
    buildCommonFields(form);

  return {
    name: form.name?.trim() || 'Untitled Event',
    description: form.description || '',
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules: schedules ?? [],
    is_recurring: is_recurring || undefined,
    recurrence,
    tickets: tickets ?? [],
    visibility: (form.is_private ? 'private' : 'public') as EventVisibility,
    is_free,
    capacity: form.capacity ?? undefined,
    waitlist_enabled: form.waitlist_enabled || undefined,
    is_featured: form.is_featured,
    certificate_enabled: form.certificate_enabled,
    certificate_price: form.certificate_enabled
      ? (form.certificate_price ?? 0)
      : undefined,
    certificate_template_id: form.certificate_template_id || undefined,
    password: form.password || undefined,
    invite_only: form.invite_only || undefined,
    invited_emails: form.invited_emails.length
      ? form.invited_emails
      : undefined,
    speakers: speakersToRequest(form.speakers),
    materials: materialsToRequest(form.materials),
    seo: seoToRequest(form.seo),
  };
}

// ============================================================
// UPDATE PAYLOAD
// ============================================================
//
// Update semantics are pointer-based: `undefined` means "leave as-is".
// We therefore send `is_recurring` as the derived boolean (not
// `|| undefined`) so clearing a recurrence actually clears it
// server-side, and `recurrence: undefined` alone means "keep the
// existing recurrence".

export function buildUpdatePayload(
  form: EventFormData,
): UpdateEventRequest {
  const { schedules, tickets, is_free, recurrence, is_recurring } =
    buildCommonFields(form);

  return {
    name: form.name?.trim() || undefined,
    description: form.description || undefined,
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id || undefined,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules,
    is_recurring,
    recurrence: recurrence,
    is_free,
    capacity: form.capacity ?? undefined,
    waitlist_enabled: form.waitlist_enabled,
    tickets,
    visibility: (form.is_private ? 'private' : 'public') as EventVisibility,
    password: form.password || undefined,
    invite_only: form.invite_only,
    invited_emails: form.invited_emails.length
      ? form.invited_emails
      : undefined,
    is_featured: form.is_featured,
    certificate_enabled: form.certificate_enabled,
    certificate_price: form.certificate_enabled
      ? (form.certificate_price ?? 0)
      : undefined,
    certificate_template_id: form.certificate_template_id || undefined,
    speakers: speakersToRequest(form.speakers),
    materials: materialsToRequest(form.materials),
    seo: seoToRequest(form.seo),
  };
}

// ============================================================
// AI DRAFT → FORM MAPPING
// ============================================================
//
// The AI draft (v8+) carries only identity, discovery, pricing,
// policy, and ONE canonical schedule. Event-level timing, venue, and
// virtual/hybrid flags are NOT part of the AI's output — they are
// derived from schedules by the backend.
//
// We populate only what the form still owns: identity fields,
// schedules, recurrence, and tickets. Event-level derived fields are
// computed on the fly by preview components via the derive* helpers
// in ./types.

export function mapAIDraftToForm(
  draft: GeneratedEventDraft,
): Partial<EventFormData> {
  const schedules: ScheduleForm[] | undefined = draft.schedules?.length
    ? draft.schedules.map((s, i) => ({
        _key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `sched-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
        start_date: s.start_date ?? '',
        end_date: '',
        start_time: s.start_time ?? '',
        end_time: s.end_time ?? '',
        timezone: s.timezone ?? 'Africa/Nairobi',
        session_name: s.session_name ?? '',
        session_number: s.session_number ?? null,
        location: s.location ?? '',
        is_virtual: s.is_virtual ?? false,
        // Left blank on purpose. The backend creates the meeting if
        // the schedule is virtual and the host is connected.
        zoom_link: '',
        meet_link: '',
        max_attendees: s.max_attendees ?? null,
      }))
    : undefined;

  const recurrence: RecurrenceForm | null =
    draft.is_recurring && draft.recurrence
      ? {
          pattern: draft.recurrence.pattern,
          interval: draft.recurrence.interval ?? 1,
          days_of_week: draft.recurrence.days_of_week ?? [],
          day_of_month: draft.recurrence.day_of_month ?? null,
          week_of_month: draft.recurrence.week_of_month ?? '',
          ends_on: draft.recurrence.ends_on ?? '',
          occurrences: draft.recurrence.occurrences ?? null,
        }
      : null;

  const tickets: TicketForm[] | undefined = draft.tickets?.length
    ? draft.tickets.map((t, i) => ({
        _key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `tkt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
        id: '',
        ticket_type_id: t.ticket_type_id ?? '',
        name: t.name ?? '',
        description: t.description ?? '',
        price: t.price ?? null,
        quantity: t.quantity ?? null,
        max_per_person: t.max_per_person ?? null,
        early_bird_deadline: t.early_bird_deadline ?? '',
        group_min_attendees: t.group_min_attendees ?? null,
        group_discount: t.group_discount ?? null,
      }))
    : undefined;

  return {
    // ---- Basic ----
    name: draft.name ?? undefined,
    description: draft.description ?? undefined,
    short_description: draft.short_description ?? undefined,
    tags: draft.tags ?? undefined,
    language: draft.language ?? undefined,

    // ---- Schedule ----
    schedules,

    // ---- Recurrence ----
    is_recurring: !!draft.is_recurring,
    recurrence,

    // ---- Tickets ----
    tickets,
    capacity: draft.capacity ?? undefined,

    // ---- Access ----
    invite_only: draft.invite_only ?? undefined,
    is_private: draft.visibility === 'private' ? true : undefined,

    // ---- Monetization ----
    is_featured: draft.is_featured ?? undefined,
    certificate_enabled: draft.certificate_enabled ?? undefined,
  };
}