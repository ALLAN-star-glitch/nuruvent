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
// The form's `schedules` array is the single source of truth.
// Every entry maps 1:1 to the backend's ScheduleRequest shape.

function schedulesToRequest(schedules: ScheduleForm[]) {
  const usable = schedules.filter(
    (s) => s.start_date && s.start_time && s.end_time,
  );
  if (!usable.length) return undefined;

  return usable.map((s) => ({
    start_date: s.start_date,
    end_date: s.end_date || s.start_date,
    start_time: s.start_time,
    end_time: s.end_time,
    timezone: s.timezone || 'Africa/Nairobi',
    session_name: s.session_name || undefined,
    session_number: s.session_number ?? undefined,
    location: s.location || undefined,
    is_virtual: s.is_virtual,
    zoom_link: s.zoom_link || undefined,
    meet_link: s.meet_link || undefined,
    max_attendees: s.max_attendees ?? undefined,
  }));
}

/**
 * Multi-day is implied by the schedules:
 *   - more than one schedule, OR
 *   - any schedule whose end_date differs from its start_date
 */
function deriveIsMultiDay(schedules: ScheduleForm[]): boolean {
  if (schedules.length > 1) return true;
  return schedules.some(
    (s) => !!s.end_date && s.end_date !== s.start_date,
  );
}

/**
 * Top-level start/end date come from the first / last usable schedule.
 */
function deriveStartEnd(schedules: ScheduleForm[]) {
  const first = schedules.find(
    (s) => s.start_date && s.start_time && s.end_time,
  );
  if (!first) return { start_date: undefined, end_date: undefined };

  const last = [...schedules]
    .reverse()
    .find((s) => s.start_date && s.start_time && s.end_time);

  return {
    start_date: first.start_date || undefined,
    end_date: last?.end_date || last?.start_date || undefined,
  };
}

// ============================================================
// RECURRENCE
// ============================================================

function recurrenceToRequest(recurrence: RecurrenceForm | null) {
  if (!recurrence || !recurrence.pattern) return undefined;

  return {
    pattern: recurrence.pattern,
    interval: recurrence.interval ?? undefined,
    days_of_week: recurrence.days_of_week.length
      ? recurrence.days_of_week
      : undefined,
    day_of_month: recurrence.day_of_month ?? undefined,
    week_of_month: recurrence.week_of_month || undefined,
    ends_on: recurrence.ends_on || undefined,
    occurrences: recurrence.occurrences ?? undefined,
  };
}

// ============================================================
// TICKETS
// ============================================================
//
// `form.tickets` is the source of truth. A ticket is "usable" only
// when it has a ticket_type_id and a quantity > 0. Rows that are
// still empty (the default state) are dropped from the payload.
//
// `is_free` is derived: true iff there is at least one usable ticket
// and every usable ticket has price === 0 (or null, treated as 0).

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

/**
 * Derive `is_free` from the usable ticket list.
 *   - No usable tickets → false (payload shouldn't be submitted anyway).
 *   - All usable tickets have price === 0 or null → true.
 *   - Any ticket has a non-zero price → false.
 */
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
  const { start_date, end_date } = deriveStartEnd(form.schedules);
  const is_multi_day = deriveIsMultiDay(form.schedules);
  const tickets = ticketsToRequest(form.tickets);
  const is_free = deriveIsFree(form.tickets);
  const recurrence = recurrenceToRequest(form.recurrence);

  return {
    schedules,
    start_date,
    end_date,
    is_multi_day,
    tickets,
    is_free,
    recurrence,
  };
}

// ============================================================
// DRAFT PAYLOAD
// ============================================================

export function buildDraftPayload(form: EventFormData): CreateDraftRequest {
  const { schedules, tickets, is_free, recurrence } = buildCommonFields(form);

  return {
    name: form.name?.trim() || 'Untitled Event',
    description: form.description || '',
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id || undefined,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules,
    is_recurring: form.is_recurring || undefined,
    recurrence,
    is_virtual: form.is_virtual,
    is_hybrid: form.is_hybrid || undefined,
    zoom_link: form.zoom_link || undefined,
    meet_link: form.meet_link || undefined,
    virtual_platform: form.virtual_platform || undefined,
    virtual_platform_url: form.virtual_platform_url || undefined,
    venue_name:
      !form.is_virtual && form.venue_name
        ? form.venue_name
        : !form.is_virtual && form.location
          ? form.location
          : undefined,
    in_person_location: !form.is_virtual
      ? form.venue_address || form.location || undefined
      : undefined,
    venue_address: form.venue_address || undefined,
    venue_city: form.venue_city || undefined,
    venue_country: form.venue_country || undefined,
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
  const { schedules, tickets, is_free, recurrence } = buildCommonFields(form);

  return {
    name: form.name?.trim() || 'Untitled Event',
    description: form.description || '',
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules: schedules ?? [],
    is_recurring: form.is_recurring || undefined,
    recurrence,
    tickets: tickets ?? [],
    visibility: (form.is_private ? 'private' : 'public') as EventVisibility,
    is_virtual: form.is_virtual,
    is_hybrid: form.is_hybrid || undefined,
    zoom_link: form.zoom_link || undefined,
    meet_link: form.meet_link || undefined,
    virtual_platform: form.virtual_platform || undefined,
    virtual_platform_url: form.virtual_platform_url || undefined,
    venue_name:
      !form.is_virtual && form.venue_name
        ? form.venue_name
        : !form.is_virtual && form.location
          ? form.location
          : undefined,
    in_person_location: !form.is_virtual
      ? form.venue_address || form.location || undefined
      : undefined,
    venue_address: form.venue_address || undefined,
    venue_city: form.venue_city || undefined,
    venue_country: form.venue_country || undefined,
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

export function buildUpdatePayload(
  form: EventFormData,
): UpdateEventRequest {
  const { schedules, tickets, is_free, recurrence } = buildCommonFields(form);

  return {
    name: form.name?.trim() || undefined,
    description: form.description || undefined,
    short_description: form.short_description || undefined,
    event_type_id: form.event_type_id || undefined,
    category_id: form.category_id || undefined,
    tags: form.tags.length ? form.tags : undefined,
    language: form.language || undefined,
    schedules,
    is_recurring: form.is_recurring,
    recurrence,
    is_virtual: form.is_virtual,
    is_hybrid: form.is_hybrid,
    zoom_link: form.zoom_link || undefined,
    meet_link: form.meet_link || undefined,
    virtual_platform: form.virtual_platform || undefined,
    virtual_platform_url: form.virtual_platform_url || undefined,
    venue_name:
      !form.is_virtual && form.venue_name
        ? form.venue_name
        : !form.is_virtual && form.location
          ? form.location
          : undefined,
    in_person_location: !form.is_virtual
      ? form.venue_address || form.location || undefined
      : undefined,
    venue_address: form.venue_address || undefined,
    venue_city: form.venue_city || undefined,
    venue_country: form.venue_country || undefined,
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

/**
 * Flatten the AI's draft into the wizard's form shape.
 *
 * Schedules are mapped from `draft.schedules`. Tickets are mapped from
 * `draft.tickets`. Other nested slices (recurrence, speakers, materials,
 * SEO) are user-driven and not read from the AI.
 */
export function mapAIDraftToForm(
  draft: GeneratedEventDraft,
): Partial<EventFormData> {
  // ---- Schedules ----
  const schedules: ScheduleForm[] | undefined = draft.schedules?.length
    ? draft.schedules.map((s, i) => ({
        _key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `sched-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
        start_date: s.start_date ?? '',
        end_date: s.end_date ?? '',
        start_time: s.start_time ?? '',
        end_time: s.end_time ?? '',
        timezone: s.timezone ?? draft.timezone ?? 'Africa/Nairobi',
        session_name: s.session_name ?? '',
        session_number: s.session_number ?? null,
        location: s.location ?? '',
        is_virtual: s.is_virtual ?? draft.is_virtual ?? true,
        zoom_link: s.zoom_link ?? '',
        meet_link: s.meet_link ?? '',
        max_attendees: s.max_attendees ?? null,
      }))
    : undefined;

  // ---- Tickets ----
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

  const locationCandidate =
    draft.in_person_location ||
    draft.venue_city ||
    draft.venue_address ||
    '';

  const isVirtual = draft.is_virtual ?? true;

  const firstSchedule = draft.schedules?.[0];
  const zoomLink =
    firstSchedule?.zoom_link ?? draft.virtual_platform_url ?? '';
  const meetLink = firstSchedule?.meet_link ?? '';

  return {
    // Basic
    name: draft.name ?? undefined,
    description: draft.description ?? undefined,
    short_description: draft.short_description ?? undefined,
    tags: draft.tags ?? undefined,
    language: draft.language ?? undefined,

    // Schedule
    schedules,

    // Tickets
    tickets,
    capacity: draft.capacity ?? undefined,

    // Venue
    is_virtual: isVirtual,
    is_hybrid: draft.is_hybrid ?? undefined,
    location: !isVirtual ? locationCandidate : '',
    zoom_link: isVirtual ? zoomLink : '',
    meet_link: isVirtual ? meetLink : '',
    virtual_platform: draft.virtual_platform ?? undefined,
    virtual_platform_url: draft.virtual_platform_url ?? undefined,
    venue_name: draft.venue_name ?? undefined,
    venue_address: draft.venue_address ?? undefined,
    venue_city: draft.venue_city ?? undefined,
    venue_country: draft.venue_country ?? undefined,

    // Access & privacy
    invite_only: draft.invite_only ?? undefined,
    is_private: draft.visibility === 'private' ? true : undefined,

    // Monetization
    is_featured: draft.is_featured ?? undefined,
    certificate_enabled: draft.certificate_enabled ?? undefined,
  };
}