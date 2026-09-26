// lib/types/events.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 1. ENUMS / UNIONS
// ============================================================

export type EventVisibility = 'public' | 'private' | 'unlisted';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type OrganizerType = 'personal' | 'institution';
export type EventSortBy = 'created_at' | 'start_date' | 'name';
export type SortOrder = 'asc' | 'desc';

/**
 * Supported video platforms. Mirrors the backend `videodomain.Platform`.
 */
export type VideoPlatform = 'zoom' | 'google_meet' | 'microsoft_teams' | 'webex';

// ============================================================
// 2. REFERENCE DATA
// ============================================================

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
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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

export interface RecurrencePatternRef {
  id: string;
  slug: RecurrencePattern;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ============================================================
// 3. NESTED EVENT PIECES
// ============================================================

/**
 * Mirrors `ScheduleDTO`.
 *
 * Derived event-level fields (`start_date`, `end_date`, `duration`,
 * `is_virtual`, `virtual_platform`, `zoom_link`) come from the
 * schedules. The schedules are the single source of truth.
 *
 * `video_meeting_id` is present only when the video module auto-created
 * a meeting for this session. Manually-pasted links leave it null.
 */
export interface Schedule {
  id: string;
  session_name?: string;
  session_number?: number;
  /** ISO date (YYYY-MM-DD). */
  start_date: string;
  /** ISO date (YYYY-MM-DD). Omitted for single-day sessions. */
  end_date?: string;
  /** HH:MM:SS. */
  start_time: string;
  /** HH:MM:SS. */
  end_time: string;
  timezone: string;
  location?: string;
  is_virtual: boolean;
  zoom_link?: string;
  meet_link?: string;
  /** UUID of the auto-created video meeting. Null when manual. */
  video_meeting_id?: string;
  max_attendees?: number;
}

export interface Ticket {
  id: string;
  ticket_type?: TicketType;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  max_per_person?: number;
  early_bird_deadline?: string;
  group_min_attendees?: number;
  group_discount?: number;
  sort_order: number;
  is_active: boolean;
}

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

export interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  is_pre_event: boolean;
  sort_order: number;
}

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

export interface Venue {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: Record<string, number>;
}

export interface Recurrence {
  pattern: RecurrencePattern;
  interval: number;
  days_of_week?: string[];
  day_of_month?: number;
  week_of_month?: string;
  ends_on?: string;
  occurrences: number;
}

export interface Organizer {
  id: string;
  name: string;
  display_name: string;
  type: OrganizerType;
  avatar_url?: string;
  slug?: string;
}

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
 * Mirrors `EventResponse`.
 *
 * Derived fields — computed from `schedules` by the backend:
 *   - `start_date`, `end_date` (min/max of sessions)
 *   - `date` (date-only, midnight in schedule tz)
 *   - `time` (HH:MM:SS of the first session)
 *   - `duration_minutes` (sum of session durations)
 *   - `is_multi_day`
 *   - `is_virtual`, `is_hybrid`
 *   - `virtual_platform`, `virtual_platform_url`
 *   - `zoom_link`, `meet_link`
 *   - `venue`, `in_person_location`
 *
 * The client should not send these on create/update. They are accepted
 * for backward compatibility and ignored by the backend.
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

  // ---- Relations ----
  event_type?: EventType;
  event_status?: EventStatus;
  category?: Category;
  event_format?: EventFormat;
  certificate_template?: CertificateTemplate;

  // ---- Ownership ----
  team_id: string;
  organizer: Organizer | null;
  creator?: Creator;

  // ---- Schedule (derived from sessions) ----
  start_date?: string;
  end_date?: string;
  /** Date portion of the earliest session, ISO date (YYYY-MM-DD). */
  date?: string;
  /** HH:MM:SS of the earliest session. */
  time?: string;
  /** Sum of session durations, in minutes. */
  duration_minutes?: number;
  is_multi_day: boolean;
  is_recurring: boolean;
  schedules?: Schedule[];
  recurrence?: Recurrence;

  // ---- Venue (derived) ----
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

/**
 * Nested: schedule input for create/update requests.
 *
 * This is the ONLY place timing, venue, and virtual/hybrid info is
 * entered. Event-level fields are derived from these.
 *
 * For auto video creation: omit `zoom_link`/`meet_link` and set
 * `is_virtual: true`. The backend will create a meeting on the host's
 * connected account.
 *
 * For manual mode: set `zoom_link` or `meet_link` explicitly. The
 * backend will not create a meeting.
 */
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

export interface RecurrenceInput {
  pattern: RecurrencePattern;
  interval?: number;
  days_of_week?: string[];
  day_of_month?: number;
  week_of_month?: string;
  ends_on?: string;
  occurrences?: number;
}

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

export interface MaterialInput {
  id?: string;
  title: string;
  material_type_id: string;
  url: string;
  description?: string;
  is_pre_event?: boolean;
  sort_order?: number;
}

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
 * Mirrors `CreateDraftRequest`.
 *
 * Event-level timing, venue, and virtual/hybrid fields are accepted for
 * backward compatibility but IGNORED by the backend. They are derived
 * from `schedules`. Do not send them on new calls.
 */
export interface CreateDraftRequest {
  name?: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  event_type_id?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  schedules?: ScheduleInput[];
  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

  is_free?: boolean;
  capacity?: number;
  tickets?: TicketInput[];

  visibility?: EventVisibility;
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

export interface CreateEventRequest {
  // ---- Required ----
  name: string;
  description: string;
  event_type_id: string;
  schedules: ScheduleInput[]; // min 1
  tickets: TicketInput[]; // min 1
  visibility: EventVisibility;

  // ---- Optional ----
  display_name?: string;
  short_description?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

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
 * Mirrors `UpdateEventRequest`. All fields optional.
 *
 * Same derived-field caveat as CreateDraftRequest.
 */
export interface UpdateEventRequest {
  name?: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  event_type_id?: string;
  category_id?: string;
  tags?: string[];
  language?: string;

  team_id?: string;

  schedules?: ScheduleInput[];
  is_recurring?: boolean;
  recurrence?: RecurrenceInput;

  is_free?: boolean;
  capacity?: number;
  waitlist_enabled?: boolean;
  tickets?: TicketInput[];

  visibility?: EventVisibility;
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

// ============================================================
// 6. QUERY PARAMS
// ============================================================

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

  page?: number;
  page_size?: number;

  sort_by?: EventSortBy;
  sort_order?: SortOrder;
}

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

export interface GetEventsByTypeParams {
  type: string;
  page?: number;
  page_size?: number;
}

export interface GetUpcomingEventsParams {
  limit?: number;
}

export interface GetPastEventsParams {
  limit?: number;
}

export interface BulkIDsRequest {
  ids: string[];
}

export interface DuplicateEventRequest {
  name?: string;
  date?: string;
  is_draft?: boolean;
}

export interface BulkDuplicateRequest {
  ids: string[];
  name_prefix?: string;
  date_offset_days?: number;
  is_draft?: boolean;
}

// ============================================================
// 7. RESPONSE WRAPPERS
// ============================================================

export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OffsetEvents {
  data: Event[];
  total: number;
  limit: number;
  offset: number;
  sort_by?: string;
  sort_order?: string;
}

export interface BulkDeleteResult {
  deleted_count: number;
  failed_ids?: string[];
  errors?: string[];
}

export interface BulkRestoreResult {
  restored_count: number;
  failed_ids?: string[];
  errors?: string[];
}

export interface BulkStatusResult {
  processed_count: number;
  failed_ids?: string[];
  errors?: string[];
}

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
// The AI draft shape mirrors the schedule-only model. Event-level
// timing, venue, and virtual/hybrid fields are NOT produced by the AI
// — they are derived from schedules by the events service when the
// draft is submitted to /events.

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
  recurrence?: RecurrenceInput | null;
}

/**
 * The draft produced by the AI.
 *
 * Event-level venue/virtual/hybrid fields are absent by design. Only
 * identity, discovery, pricing, policy, and one canonical schedule.
 */
export interface GeneratedEventDraft {
  name: string;
  description: string;
  short_description?: string;
  tags?: string[];
  language?: string;

  /** Exactly one canonical session. */
  schedules: GeneratedSchedule[];

  is_recurring?: boolean;
  recurrence?: {
    pattern: RecurrencePattern;
    interval?: number;
    days_of_week?: string[];
    day_of_month?: number;
    week_of_month?: string;
    ends_on?: string;
    occurrences?: number;
  } | null;

  is_free?: boolean;
  capacity?: number;
  tickets?: TicketInput[];

  visibility?: EventVisibility;
  invite_only?: boolean;
  is_featured?: boolean;
  certificate_enabled?: boolean;
}

/**
 * Mirrors the backend's `GeneratedSchedule`. This is the shape the AI
 * returns — the frontend maps it to `ScheduleInput` when submitting.
 */
export interface GeneratedSchedule {
  start_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  session_name: string;
  session_number: number;
  location: string;
  is_virtual: boolean;
  max_attendees?: number | null;
}

export interface GenerateEventDraftResult {
  draft: GeneratedEventDraft;
  warnings: string[];
}

// ============================================================
// 9. VIDEO MODULE
// ============================================================
//
// Mirrors `service.ConnectionResponse` and `service.ListConnectionsResponse`
// from the video module.

/**
 * Mirrors `ConnectionResponse`. A host's authorized link to their
 * account on a video platform.
 *
 * Tokens are never present in the response. `is_active` is derived from
 * `revoked_at == null`.
 */
export interface VideoConnection {
  id: string;
  platform: VideoPlatform;
  external_user_id: string;
  external_email: string;
  external_org_id?: string;
  scopes?: string;
  connected_at: string;
  revoked_at?: string | null;
  is_active: boolean;
  token_expires_at: string;
}

export interface ListConnectionsResponse {
  count: number;
  connections: VideoConnection[];
}

/**
 * Response of GET /video/oauth/:platform/connect when the request is
 * made with `Accept: application/json`. The frontend should open
 * `authorize_url` in a popup or same-tab navigation.
 */
export interface VideoConnectResponse {
  authorize_url: string;
}

// ============================================================
// 10. TYPE GUARDS
// ============================================================

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