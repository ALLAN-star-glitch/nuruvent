// lib/types/events.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 1. ENUMS / UNIONS
// ============================================================

/**
 * Event visibility. Mirrors the backend `visibility` field.
 * - `public`:   listed everywhere, anyone can see
 * - `unlisted`: accessible by direct link only
 * - `private`:  only invited users can see
 */
export type EventVisibility = 'public' | 'private' | 'unlisted';

/**
 * Recurrence pattern slug. Mirrors the `recurrence_patterns.slug`
 * column and the `oneof` binding on `RecurrenceRequest.Pattern`.
 *
 * The corresponding rows in `recurrence_patterns` are:
 *   daily   -> recurrence_daily
 *   weekly  -> recurrence_weekly
 *   monthly -> recurrence_monthly
 *   custom  -> recurrence_custom
 */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Organizer type. Mirrors `OrganizerResponse.Type`.
 */
export type OrganizerType = 'personal' | 'institution';

/**
 * Sort field for event listings. Mirrors `ListEventsRequest.SortBy`.
 */
export type EventSortBy = 'created_at' | 'start_date' | 'name';

/**
 * Sort direction. Mirrors `ListEventsRequest.SortOrder`.
 */
export type SortOrder = 'asc' | 'desc';

// ============================================================
// 2. REFERENCE DATA
// ============================================================
//
// These mirror the *_types tables. Public endpoints serve them.
// Fields not present on the backend DTO are marked optional so the
// frontend can render a richer UI without requiring a backend change.

/**
 * Mirrors `EventTypeDTO` plus the metadata the `event_types` table
 * carries (sort_order, is_active, timestamps). Use `sort_order` for
 * dropdown ordering, `is_active` to hide deactivated types.
 */
export interface EventType {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  supports_certificate: boolean;
  min_duration: number;
  max_duration: number;

  /** Present in the DB; may be omitted by the current DTO. */
  sort_order?: number;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Mirrors `EventStatusDTO` plus the metadata the `event_statuses`
 * table carries.
 */
export interface EventStatus {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  color: string;
  icon: string;
  is_final: boolean;

  sort_order?: number;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Mirrors `CategoryDTO` plus the metadata the `categories` table
 * carries.
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;

  sort_order?: number;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Mirrors `EventFormatDTO` plus the metadata the `event_formats`
 * table carries.
 *
 * Values seen in the DB: `virtual`, `in-person`, `hybrid`.
 */
export interface EventFormat {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;

  sort_order?: number;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Mirrors `TicketTypeDTO` plus the metadata the `ticket_types` table
 * carries.
 *
 * This is the *global* ticket type catalogue (e.g. "General Admission",
 * "VIP Pass", "Early Bird"), not a per-event ticket.
 */
export interface TicketType {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  sort_order: number;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Mirrors `CertificateTemplateDTO` plus the metadata the
 * `certificate_templates` table carries.
 */
export interface CertificateTemplate {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  preview_url: string;

  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Certificate types reference.
 * Mirrors the `certificate_types` table:
 *   event-certificate  -> certificate_type_event
 *   course-certificate -> certificate_type_course
 *   cpd-certificate    -> certificate_type_cpd
 */
export interface CertificateType {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Recurrence pattern reference.
 * Mirrors the `recurrence_patterns` table:
 *   daily   -> recurrence_daily
 *   weekly  -> recurrence_weekly
 *   monthly -> recurrence_monthly
 *   custom  -> recurrence_custom
 *
 * The `slug` field is what gets submitted as `RecurrencePattern` in
 * a create/update request.
 */
export interface RecurrencePatternRef {
  id: string;
  slug: RecurrencePattern;
  name: string;         // "recurrence_daily"
  display_name: string; // "Daily"
  description: string;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ============================================================
// 3. NESTED EVENT PIECES
// ============================================================

/** Mirrors `ScheduleDTO`. */
export interface Schedule {
  id: string;
  session_name?: string;
  session_number?: number;
  /** ISO date (YYYY-MM-DD). */
  start_date: string;
  /** ISO date (YYYY-MM-DD). Omitted for single-day sessions. */
  end_date?: string;
  /** HH:MM. */
  start_time: string;
  /** HH:MM. */
  end_time: string;
  timezone: string;
  location?: string;
  is_virtual: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

/** Mirrors `TicketDTO`. Per-event ticket instance. */
export interface Ticket {
  id: string;
  ticket_type?: TicketType;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  max_per_person?: number;
  /** RFC3339 timestamp. */
  early_bird_deadline?: string;
  group_min_attendees?: number;
  group_discount?: number;
  sort_order: number;
  is_active: boolean;
}

/** Mirrors `SpeakerDTO`. */
export interface Speaker {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photo_url?: string;
  social_links?: Record<string, string>;
  is_keynote: boolean;
  sort_order: number;
}

/** Mirrors `MaterialDTO`. */
export interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  is_pre_event: boolean;
  sort_order: number;
}

/** Mirrors `SEODTO`. */
export interface SEO {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  robots?: string;
  noindex: boolean;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
}

/** Mirrors `VenueDTO`. */
export interface Venue {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: Record<string, number>;
}

/** Mirrors `RecurrenceDTO`. */
export interface Recurrence {
  pattern: RecurrencePattern;
  interval: number;
  days_of_week?: string[];
  day_of_month?: number;
  week_of_month?: string;
  ends_on?: string;
  occurrences: number;
}

/** Mirrors `OrganizerResponse` (public-facing host info). */
export interface Organizer {
  id: string;
  name: string;
  display_name: string;
  type: OrganizerType;
  avatar_url?: string;
  slug?: string;
}

/**
 * Mirrors `CreatorDTO` (internal creator info).
 * Only present when the caller is authorized to see it
 * (e.g. the event owner or an admin).
 */
export interface Creator {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// ============================================================
// 4. MAIN RESPONSE
// ============================================================

/**
 * Mirrors `EventResponse`. The canonical shape of an event as the
 * backend sends it. Every field is typed; no `any`, no defensive
 * `DisplayName || display_name` fallbacks.
 */
export interface Event {
  // ---- Core identity ----
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  short_description?: string;
  tags?: string[];
  language: string;

  // ---- Relations (full nested objects) ----
  event_type?: EventType;
  event_status?: EventStatus;
  category?: Category;
  event_format?: EventFormat;
  certificate_template?: CertificateTemplate;

  // ---- Ownership ----
  /** The team this event belongs to (not the account). */
  team_id: string;
  organizer: Organizer | null;
  creator?: Creator;

  // ---- Schedule ----
  /** RFC3339. Present for single or multi-day events. */
  start_date?: string;
  /** RFC3339. Present for multi-day events. */
  end_date?: string;
  is_multi_day: boolean;
  is_recurring: boolean;
  schedules?: Schedule[];
  recurrence?: Recurrence;

  // ---- Venue ----
  venue?: Venue;
  is_virtual: boolean;
  is_hybrid: boolean;
  virtual_platform?: string;
  virtual_platform_url?: string;
  in_person_location?: string;
  zoom_link?: string;
  meet_link?: string;

  // ---- Tickets ----
  is_free: boolean;
  capacity: number;
  current_attendees: number;
  waitlist_enabled: boolean;
  waitlist_capacity?: number;
  min_tickets_per_order: number;
  max_tickets_per_order: number;
  tickets?: Ticket[];

  // ---- Access & privacy ----
  visibility: EventVisibility;
  is_private: boolean;
  invite_only: boolean;
  invited_emails?: string[];

  // ---- Monetization ----
  is_featured: boolean;
  certificate_enabled: boolean;
  certificate_price?: number;

  // ---- Content ----
  speakers?: Speaker[];
  materials?: Material[];
  seo?: SEO;
  schema_org?: Record<string, unknown>;

  // ---- Media ----
  image_url?: string;
  thumbnail_url?: string;

  // ---- Social ----
  social_links?: Record<string, string>;
  has_livestream: boolean;
  livestream_url?: string;
  recording_available: boolean;
  recording_url?: string;

  // ---- Metadata ----
  version: number;
  published_at?: string;
  scheduled_publish_at?: string;
  last_published_at?: string;

  // ---- Audit ----
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================================
// 5. REQUEST SHAPES
// ============================================================

/** Nested: schedule input for create/update requests. */
export interface ScheduleInput {
  id?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  session_name?: string;
  session_number?: number;
  location?: string;
  is_virtual?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

/** Nested: recurrence input for create/update requests. */
export interface RecurrenceInput {
  pattern: RecurrencePattern;
  interval?: number;
  days_of_week?: string[];
  day_of_month?: number;
  week_of_month?: string;
  ends_on?: string;
  occurrences?: number;
}

/** Nested: ticket input for create/update requests. */
export interface TicketInput {
  id?: string;
  ticket_type_id: string;
  name?: string;
  description?: string;
  price: number;
  quantity: number;
  max_per_person?: number;
  early_bird_deadline?: string;
  group_min_attendees?: number;
  group_discount?: number;
}

/** Nested: speaker input for create/update requests. */
export interface SpeakerInput {
  id?: string;
  name: string;
  title?: string;
  bio?: string;
  photo_url?: string;
  social_links?: Record<string, string>;
  is_keynote?: boolean;
  sort_order?: number;
}

/** Nested: material input for create/update requests. */
export interface MaterialInput {
  id?: string;
  title: string;
  material_type_id: string;
  url: string;
  description?: string;
  is_pre_event?: boolean;
  sort_order?: number;
}

/** Nested: SEO input for create/update requests. */
export interface SEOInput {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  robots?: string;
  noindex?: boolean;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
}

/**
 * Mirrors `CreateDraftRequest`. All fields optional — drafts can be
 * saved incrementally. Scope (team, account) is resolved from the JWT
 * by the backend; do NOT include team_id or account_id.
 */
export interface CreateDraftRequest {
  // ---- Basic ----
  name?: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  event_type_id?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  // ---- Schedule ----
  schedules?: ScheduleInput[];
  is_multi_day?: boolean;
  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

  // ---- Venue ----
  is_virtual?: boolean;
  is_hybrid?: boolean;
  in_person_location?: string;
  virtual_platform?: string;
  virtual_platform_url?: string;
  zoom_link?: string;
  meet_link?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;

  // ---- Tickets ----
  is_free?: boolean;
  capacity?: number;
  tickets?: TicketInput[];

  // ---- Access & privacy ----
  visibility?: EventVisibility;
  password?: string;
  invite_only?: boolean;
  invited_emails?: string[];

  // ---- Monetization ----
  is_featured?: boolean;
  certificate_enabled?: boolean;
  certificate_price?: number;
  certificate_template_id?: string;

  // ---- Content ----
  speakers?: SpeakerInput[];
  materials?: MaterialInput[];
  seo?: SEOInput;
}

/**
 * Mirrors `CreateEventRequest`. Same as `CreateDraftRequest` but with
 * the fields the backend requires for a published event.
 */
export interface CreateEventRequest {
  // ---- Required ----
  name: string;
  description: string;
  event_type_id: string;
  schedules: ScheduleInput[];   // min 1
  tickets: TicketInput[];       // min 1
  visibility: EventVisibility;

  // ---- Optional (same as draft) ----
  display_name?: string;
  short_description?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  is_multi_day?: boolean;
  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

  is_virtual?: boolean;
  is_hybrid?: boolean;
  in_person_location?: string;
  virtual_platform?: string;
  virtual_platform_url?: string;
  zoom_link?: string;
  meet_link?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;

  is_free?: boolean;
  capacity?: number;
  waitlist_enabled?: boolean;

  password?: string;
  invite_only?: boolean;
  invited_emails?: string[];

  is_featured?: boolean;
  certificate_enabled?: boolean;
  certificate_price?: number;
  certificate_template_id?: string;

  speakers?: SpeakerInput[];
  materials?: MaterialInput[];
  seo?: SEOInput;
}

/**
 * Mirrors `UpdateEventRequest`. All fields optional (pointer semantics
 * on the backend: omitted = leave unchanged, empty = clear).
 *
 * `team_id` is the one field that can move an event between teams.
 */
export interface UpdateEventRequest {
  // ---- Basic ----
  name?: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  event_type_id?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  /** Move the event to a different team. */
  team_id?: string;

  // ---- Schedule ----
  schedules?: ScheduleInput[];
  is_multi_day?: boolean;
  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

  // ---- Venue ----
  is_virtual?: boolean;
  is_hybrid?: boolean;
  in_person_location?: string;
  virtual_platform?: string;
  virtual_platform_url?: string;
  zoom_link?: string;
  meet_link?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;

  // ---- Tickets ----
  is_free?: boolean;
  capacity?: number;
  waitlist_enabled?: boolean;
  tickets?: TicketInput[];

  // ---- Access & privacy ----
  visibility?: EventVisibility;
  password?: string;
  invite_only?: boolean;
  invited_emails?: string[];

  // ---- Monetization ----
  is_featured?: boolean;
  certificate_enabled?: boolean;
  certificate_price?: number;
  certificate_template_id?: string;

  // ---- Content ----
  speakers?: SpeakerInput[];
  materials?: MaterialInput[];
  seo?: SEOInput;
}

// ============================================================
// 6. QUERY PARAMS
// ============================================================

/** Mirrors `ListEventsRequest` query params. */
export interface ListEventsParams {
  team_id?: string;
  team_type?: 'personal' | 'institution';

  event_type_id?: string;
  event_status_id?: string;
  category_id?: string;
  user_id?: string;
  visibility?: EventVisibility;

  include_deleted?: boolean;
  only_deleted?: boolean;
  include_creator?: boolean;

  limit?: number;
  offset?: number;

  page?: number;         // ← add
  page_size?: number;    // ← add

  sort_by?: EventSortBy;
  sort_order?: SortOrder;
}

/** Params for the public/authenticated search endpoint. */
export interface SearchEventsParams {
  q: string;

  team_id?: string;
  team_type?: 'personal' | 'institution';

  event_type_id?: string;
  category_id?: string;
  visibility?: EventVisibility;

  include_deleted?: boolean;
  only_deleted?: boolean;
  include_creator?: boolean;

  page?: number;
  page_size?: number;
}

/** Params for GET /events/type/:type. */
export interface GetEventsByTypeParams {
  type: string;
  page?: number;
  page_size?: number;
}

/** Params for GET /events/upcoming. */
export interface GetUpcomingEventsParams {
  limit?: number;
}

/** Params for GET /events/past. */
export interface GetPastEventsParams {
  limit?: number;
}

/** Payload for bulk operations by ID. */
export interface BulkIDsRequest {
  ids: string[];
}

/** Mirrors `DuplicateEventRequest`. */
export interface DuplicateEventRequest {
  name?: string;
  date?: string;
  is_draft?: boolean;
}

/** Mirrors `BulkDuplicateRequest`. */
export interface BulkDuplicateRequest {
  ids: string[];
  name_prefix?: string;
  date_offset_days?: number;
  is_draft?: boolean;
}

// ============================================================
// 7. RESPONSE WRAPPERS
// ============================================================

/**
 * The standard `{ success, message, data }` envelope the backend wraps
 * every response in.
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Paginated event list response.
 * The backend emits this shape for GET /events (protected),
 * GET /events/search, GET /events/me/search, GET /events/type/:type.
 */
export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Offset-based list response.
 * The backend emits this shape for the public GET /events endpoint.
 */
export interface OffsetEvents {
  data: Event[];
  total: number;
  limit: number;
  offset: number;
  sort_by?: string;
  sort_order?: string;
}

/** Mirrors `BulkDeleteResultResponse`. */
export interface BulkDeleteResult {
  deleted_count: number;
  failed_ids?: string[];
  errors?: string[];
}

/** Mirrors `BulkRestoreResultResponse`. */
export interface BulkRestoreResult {
  restored_count: number;
  failed_ids?: string[];
  errors?: string[];
}

/** Mirrors `BulkStatusResultResponse`. */
export interface BulkStatusResult {
  processed_count: number;
  failed_ids?: string[];
  errors?: string[];
}

/** Mirrors `BulkDuplicateResultResponse`. */
export interface BulkDuplicateResult {
  duplicated_count: number;
  created_events: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  failed_ids?: string[];
  errors?: string[];
}

/** Mirrors `MediaInfoResponse`. */
export interface MediaInfo {
  id: string;
  url: string;
  media_type: string;
  entity_id: string;
  uploaded_by: string;
  created_at: string;
}

// ============================================================
// 8. AI DRAFT GENERATION
// ============================================================
//
// Mirrors `service.GenerateEventDraftRequest` and the JSON shape the
// AI returns in `GenerateEventDraftResult.Draft`.
//
// The response's `draft` object has the same fields as a
// `CreateDraftRequest`, so it can be fed directly into `createDraft`
// after a small mapping on the frontend (mostly to reshape it into the
// wizard's internal form structure).

/**
 * Mirrors `service.GenerateEventDraftRequest`. Scope fields (team,
 * account, created_by) are set by the backend from the JWT and are
 * not part of the client payload.
 */
export interface GenerateEventDraftRequest {
  prompt: string;
  event_type_id: string;
  category_id?: string;
  ticket_type_ids: string[];
  language?: string;
  timezone?: string;
  currency?: string;
  min_capacity?: number;
  max_capacity?: number;
}

/**
 * The draft produced by the AI. Mirrors the JSON schema declared in
 * the backend's system prompt. Every field is optional except `name`
 * and `description` — the AI is prompted to fill in the rest, but
 * `checkPublishReadiness` may return warnings for missing or
 * malformed values.
 */
export interface GeneratedEventDraft {
  name: string;
  description: string;
  short_description?: string;
  tags?: string[];
  language?: string;

  schedules?: ScheduleInput[];
  is_multi_day?: boolean;

  is_virtual?: boolean;
  is_hybrid?: boolean;
  in_person_location?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  virtual_platform?: string;
  virtual_platform_url?: string;
  timezone?: string;

  is_free?: boolean;
  capacity?: number;
  tickets?: TicketInput[];

  visibility?: EventVisibility;
  invite_only?: boolean;
  is_featured?: boolean;
  certificate_enabled?: boolean;
}

/**
 * Mirrors `service.GenerateEventDraftResult`. `warnings` describes
 * non-fatal corrections the backend applied to the AI output (e.g.
 * "removed a schedule in the past"). It does not indicate failure.
 */
export interface GenerateEventDraftResult {
  draft: GeneratedEventDraft;
  warnings: string[];
}

// ============================================================
// 9. TYPE GUARDS
// ============================================================

/**
 * Narrows a value to a BaseResponse<Event>.
 * Useful when a caller receives `unknown` and needs to verify the shape.
 */
export function isEventResponse(
  payload: unknown,
): payload is BaseResponse<Event> {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as BaseResponse<any>;
  return (
    !!p.data &&
    typeof p.data === 'object' &&
    typeof (p.data as any).id === 'string' &&
    typeof (p.data as any).slug === 'string'
  );
}