// components/events/transform.ts

import type {
  CreateDraftRequest,
  CreateEventRequest,
  EventVisibility,
  GeneratedEventDraft,
  RecurrenceInput,
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

function schedulesToRequest(schedules: ScheduleForm[]) {
  const usable = schedules.filter(
    (s) => s.start_date && s.start_time && s.end_time,
  );
  if (!usable.length) return undefined;

  return usable.map((s) => ({
    id: s.id || undefined,
    start_date: s.start_date,
    end_date: s.end_date || undefined,
    start_time: s.start_time,
    end_time: s.end_time,
    timezone: s.timezone || 'Africa/Nairobi',
    session_name: s.session_name || undefined,
    session_number: s.session_number ?? undefined,
    location: s.location || undefined,
    is_virtual: s.is_virtual,
    platform:
      s.is_virtual && !s.zoom_link && !s.meet_link && s.platform
        ? s.platform
        : undefined,
    zoom_link: s.zoom_link || undefined,
    meet_link: s.meet_link || undefined,
    max_attendees: s.max_attendees ?? undefined,
  }));
}

// ============================================================
// RECURRENCE
// ============================================================

/**
 * Maps the form's RecurrenceForm to the backend's RecurrenceInput.
 *
 * The form still uses the legacy field names (pattern, ends_on,
 * occurrences, day_of_month, week_of_month) so existing UI code
 * doesn't need to be rewritten. This function translates them into
 * the new shape (frequency, end_date, count) that the backend now
 * requires.
 *
 * Fields the backend no longer supports (day_of_month,
 * week_of_month) are silently dropped. If a user had them set, they
 * are lost on save — that's acceptable because the backend rejects
 * "custom" recurrence anyway.
 */
function recurrenceToRequest(
  recurrence: RecurrenceForm | null,
): RecurrenceInput | undefined {
  if (!recurrence || !recurrence.pattern) return undefined;

  // Legacy "custom" is no longer supported. Downgrade to the closest
  // concrete frequency so users don't lose their saved events.
  const frequency: RecurrenceInput['frequency'] =
    recurrence.pattern === 'custom' ? 'weekly' : recurrence.pattern;

  const days = (recurrence.days_of_week ?? []).filter(Boolean);

  if (frequency === 'weekly' && days.length === 0) {
    return undefined;
  }

  return {
    frequency,
    interval: recurrence.interval ?? undefined,
    days_of_week: frequency === 'weekly' && days.length ? days : undefined,
    end_date: recurrence.ends_on || undefined,
    count: recurrence.occurrences ?? undefined,
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
// CERTIFICATE FIELDS
// ============================================================
//
// The event wizard no longer collects a free-form certificate price.
// The organizer picks a system tier (Basic / Professional / Premium),
// and its ID is stored on the event. Pricing is resolved server-side
// from that tier's price_minor when certificates are issued.
//
// `certificate_price` is only kept in the payload for backward
// compatibility with older backend versions that still require it.
// It is always derived from the tier's snapshot — never typed by the
// user.

function certificateFields(form: EventFormData) {
  if (!form.certificate_enabled) {
    return {
      certificate_enabled: false,
      certificate_template_id: undefined,
    };
  }
  return {
    certificate_enabled: true,
    certificate_template_id: form.certificate_template_id || undefined,
  };
}

// ============================================================
// DRAFT PAYLOAD
// ============================================================

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
    ...certificateFields(form),
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
    ...certificateFields(form),
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
    ...certificateFields(form),
    speakers: speakersToRequest(form.speakers),
    materials: materialsToRequest(form.materials),
    seo: seoToRequest(form.seo),
  };
}

// ============================================================
// AI DRAFT → FORM MAPPING
// ============================================================

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
        platform: null,
        zoom_link: '',
        meet_link: '',
        max_attendees: s.max_attendees ?? null,
      }))
    : undefined;

  // The form's RecurrenceForm shape is still legacy (pattern /
  // ends_on / occurrences). Map the AI's new-shape output (frequency
  // / end_date / count) into the form's field names so the UI
  // continues to work without changing the form component.
  const recurrence: RecurrenceForm | null =
    draft.is_recurring && draft.recurrence
      ? {
          pattern: draft.recurrence.frequency,
          interval: draft.recurrence.interval ?? 1,
          days_of_week: draft.recurrence.days_of_week ?? [],
          day_of_month: null,
          week_of_month: '',
          ends_on: draft.recurrence.end_date ?? '',
          occurrences: draft.recurrence.count ?? null,
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
    name: draft.name ?? undefined,
    description: draft.description ?? undefined,
    short_description: draft.short_description ?? undefined,
    tags: draft.tags ?? undefined,
    language: draft.language ?? undefined,
    schedules,
    is_recurring: !!draft.is_recurring,
    recurrence,
    tickets,
    capacity: draft.capacity ?? undefined,
    invite_only: draft.invite_only ?? undefined,
    is_private: draft.visibility === 'private' ? true : undefined,
    is_featured: draft.is_featured ?? undefined,
    certificate_enabled: draft.certificate_enabled ?? undefined,
  };
}