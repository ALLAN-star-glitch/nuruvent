// components/events/types.ts

// ============================================================
// FORM SHAPE — flat scalars + nested structured slices
// ============================================================
//
// Event-level timing, venue, and virtual/hybrid fields have been
// REMOVED from EventFormData. They are derived by the backend from
// `schedules[]`. The schedules are the single source of truth.
//
// The preview/review components compute any event-level display
// values on the fly from the schedules.

// ============================================================
// SCHEDULE
// ============================================================

export interface ScheduleForm {
  /** Client-side stable key for React lists. Never sent to the backend. */
  _key: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  session_name: string;
  session_number: number | null;
  location: string;
  is_virtual: boolean;
  /**
   * Manual override. When empty and is_virtual is true, the backend
   * auto-creates a meeting on the host's connected account. When set,
   * the backend uses the pasted link and skips auto-creation.
   */
  zoom_link: string;
  meet_link: string;
  max_attendees: number | null;
}

export function makeEmptySchedule(timezone = 'Africa/Nairobi'): ScheduleForm {
  return {
    _key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sched-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    timezone,
    session_name: '',
    session_number: null,
    location: '',
    is_virtual: true,
    zoom_link: '',
    meet_link: '',
    max_attendees: null,
  };
}

export function makeEmptySchedules(timezone = 'Africa/Nairobi'): ScheduleForm[] {
  return [makeEmptySchedule(timezone)];
}

// ============================================================
// RECURRENCE
// ============================================================

export interface RecurrenceForm {
  pattern: '' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number | null;
  days_of_week: string[];
  day_of_month: number | null;
  week_of_month: string;
  ends_on: string;
  occurrences: number | null;
}

export function makeEmptyRecurrence(): RecurrenceForm {
  return {
    pattern: '',
    interval: null,
    days_of_week: [],
    day_of_month: null,
    week_of_month: '',
    ends_on: '',
    occurrences: null,
  };
}

export const WEEKDAY_CODES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type WeekdayCode = (typeof WEEKDAY_CODES)[number];

export const WEEKDAY_LABELS: Record<WeekdayCode, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

// ============================================================
// TICKETS
// ============================================================

export interface TicketForm {
  _key: string;
  id: string;
  ticket_type_id: string;
  name: string;
  description: string;
  price: number | null;
  quantity: number | null;
  max_per_person: number | null;
  early_bird_deadline: string;
  group_min_attendees: number | null;
  group_discount: number | null;
}

export function makeEmptyTicket(): TicketForm {
  return {
    _key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    id: '',
    ticket_type_id: '',
    name: '',
    description: '',
    price: null,
    quantity: null,
    max_per_person: null,
    early_bird_deadline: '',
    group_min_attendees: null,
    group_discount: null,
  };
}

export function makeEmptyTickets(): TicketForm[] {
  return [makeEmptyTicket()];
}

// ============================================================
// SPEAKERS
// ============================================================

export interface SpeakerForm {
  _key: string;
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  social_links: Record<string, string>;
  is_keynote: boolean;
  sort_order: number;
}

export function makeEmptySpeaker(sortOrder = 0): SpeakerForm {
  return {
    _key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `spk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    id: '',
    name: '',
    title: '',
    bio: '',
    photo_url: '',
    social_links: {},
    is_keynote: false,
    sort_order: sortOrder,
  };
}

// ============================================================
// MATERIALS
// ============================================================

export interface MaterialForm {
  _key: string;
  id: string;
  title: string;
  material_type_id: string;
  url: string;
  description: string;
  is_pre_event: boolean;
  sort_order: number;
}

export function makeEmptyMaterial(sortOrder = 0): MaterialForm {
  return {
    _key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `mat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    id: '',
    title: '',
    material_type_id: '',
    url: '',
    description: '',
    is_pre_event: false,
    sort_order: sortOrder,
  };
}

// ============================================================
// SEO
// ============================================================

export interface SEOForm {
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  canonical_url: string;
  robots: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image_url: string;
}

export function makeEmptySEO(): SEOForm {
  return {
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    canonical_url: '',
    robots: '',
    noindex: false,
    og_title: '',
    og_description: '',
    og_image_url: '',
    og_type: '',
    twitter_card: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image_url: '',
  };
}

// ============================================================
// EVENT FORM DATA
// ============================================================
//
// Note on derived fields:
//
// Event-level timing (start_date, end_date, duration), venue
// (venue_name, venue_address, venue_city, venue_country,
// in_person_location), virtual/hybrid flags (is_virtual, is_hybrid),
// platform info (virtual_platform, virtual_platform_url), and meeting
// links (zoom_link, meet_link) are NOT stored on the form.
//
// They are computed by the backend from `schedules[]` and returned in
// the Event response. UI that needs them (preview cards, review step)
// computes them on the fly from `schedules`.

export interface EventFormData {
  // ---- Basic info ----
  name: string;
  display_name: string;
  description: string;
  short_description: string;
  event_type_id: string;
  category_id: string;
  tags: string[];
  language: string;

  // ---- Schedule (source of truth for timing + venue + virtual) ----
  schedules: ScheduleForm[];

  // ---- Recurrence ----
  is_recurring: boolean;
  recurrence: RecurrenceForm | null;

  // ---- Tickets ----
  // The ticket list is the source of truth for per-ticket pricing.
  // `capacity` is the event-wide maximum (independent of the sum of
  // ticket quantities). `waitlist_enabled` gates the waitlist feature.
  tickets: TicketForm[];
  capacity: number | null;
  waitlist_enabled: boolean;

  // ---- Certificate ----
  certificate_enabled: boolean;
  certificate_price: number | null;
  certificate_template_id: string;

  // ---- Access & privacy ----
  is_private: boolean;
  password: string;
  invite_only: boolean;
  invited_emails: string[];

  // ---- Monetization / promotion ----
  is_featured: boolean;

  // ---- Extras ----
  speakers: SpeakerForm[];
  materials: MaterialForm[];
  seo: SEOForm | null;

  // ---- Media ----
  imagePreview?: string;
}

// ============================================================
// VALIDATION ERRORS
// ============================================================

export interface FormErrors {
  name?: string;
  description?: string;
  short_description?: string;
  event_type_id?: string;
  category_id?: string;
  schedules?: string;
  tickets?: string;
  capacity?: string;
  certificate_price?: string;
  image?: string;
  recurrence?: string;
  speakers?: string;
  materials?: string;
  seo?: string;
}

// ============================================================
// DEFAULTS
// ============================================================

export const defaultFormData: EventFormData = {
  // Basic
  name: '',
  display_name: '',
  description: '',
  short_description: '',
  event_type_id: '',
  category_id: '',
  tags: [],
  language: 'en',

  // Schedule — start with one empty row
  schedules: makeEmptySchedules(),

  // Recurrence
  is_recurring: false,
  recurrence: null,

  // Tickets — start with one empty row
  tickets: makeEmptyTickets(),
  capacity: null,
  waitlist_enabled: false,

  // Certificate
  certificate_enabled: false,
  certificate_price: null,
  certificate_template_id: '',

  // Access & privacy
  is_private: false,
  password: '',
  invite_only: false,
  invited_emails: [],

  // Promotion
  is_featured: false,

  // Extras
  speakers: [],
  materials: [],
  seo: null,

  // Media
  imagePreview: '',
};

// ============================================================
// WIZARD CONSTANTS
// ============================================================

export const STEPS = [
  'Basic Info',
  'Tickets',
  'Details',
  'Content',
  'Review',
] as const;

export const DRAFT_ID_STORAGE_KEY = 'nuruvent_draft_id';

export const DEFAULT_TICKET_TYPE_SLUG = 'general-admission';

export const NO_CATEGORY = '__none__';

// ============================================================
// DERIVED EVENT-LEVEL HELPERS
// ============================================================
//
// Compute event-level display values from schedules. These mirror the
// backend's `deriveEventFromSchedules` and are used only for UI.
//
// Never send these to the backend. They are computed there.

/** Earliest session start date (ISO YYYY-MM-DD), or '' if none. */
export function deriveStartDate(schedules: ScheduleForm[]): string {
  let earliest = '';
  for (const s of schedules) {
    if (!s.start_date) continue;
    if (!earliest || s.start_date < earliest) earliest = s.start_date;
  }
  return earliest;
}

/** Latest session end date (or start if no end), ISO YYYY-MM-DD, or ''. */
export function deriveEndDate(schedules: ScheduleForm[]): string {
  let latest = '';
  for (const s of schedules) {
    const candidate = s.end_date || s.start_date;
    if (!candidate) continue;
    if (!latest || candidate > latest) latest = candidate;
  }
  return latest;
}

/** Whether the event spans more than one calendar day. */
export function deriveIsMultiDay(schedules: ScheduleForm[]): boolean {
  if (schedules.length > 1) {
    const start = deriveStartDate(schedules);
    const end = deriveEndDate(schedules);
    if (start && end && start !== end) return true;
  }
  return schedules.some(
    (s) => !!s.end_date && s.end_date !== s.start_date,
  );
}

/**
 * Virtual/hybrid flags. Returns:
 *   allVirtual  → true when every session is virtual
 *   isHybrid    → true when some are virtual and some aren't
 */
export function deriveVirtualFlags(schedules: ScheduleForm[]): {
  allVirtual: boolean;
  isHybrid: boolean;
} {
  let virtual = 0;
  let inPerson = 0;
  for (const s of schedules) {
    if (s.is_virtual) virtual++;
    else inPerson++;
  }
  return {
    allVirtual: virtual > 0 && inPerson === 0,
    isHybrid: virtual > 0 && inPerson > 0,
  };
}

/** First in-person location label, or ''. */
export function deriveInPersonLocation(schedules: ScheduleForm[]): string {
  for (const s of schedules) {
    if (!s.is_virtual && s.location) return s.location;
  }
  return '';
}

/** First virtual platform implied by a schedule link, or ''. */
export function deriveVirtualPlatform(schedules: ScheduleForm[]): string {
  for (const s of schedules) {
    if (s.zoom_link) return 'zoom';
    if (s.meet_link) return 'google_meet';
  }
  return '';
}

/** First schedule's location label. Useful for hybrid previews. */
export function derivePrimaryLocation(schedules: ScheduleForm[]): string {
  return schedules[0]?.location ?? '';
}