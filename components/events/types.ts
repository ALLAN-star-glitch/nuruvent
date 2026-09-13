// components/events/types.ts

// ============================================================
// FORM SHAPE — flat scalars + nested structured slices
// ============================================================

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
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export type WeekdayCode = (typeof WEEKDAY_CODES)[number];

export const WEEKDAY_LABELS: Record<WeekdayCode, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
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

export interface EventFormData {
  // ---- Basic info ----
  name: string;
  description: string;
  short_description: string;
  event_type_id: string;
  category_id: string;
  tags: string[];
  language: string;

  // ---- Schedule (array of sessions) ----
  schedules: ScheduleForm[];

  // ---- Recurrence ----
  is_recurring: boolean;
  recurrence: RecurrenceForm | null;

  // ---- Venue ----
  is_virtual: boolean;
  is_hybrid: boolean;
  location: string;
  zoom_link: string;
  meet_link: string;
  virtual_platform: string;
  virtual_platform_url: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_country: string;

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
  location?: string;
  zoom_link?: string;
  meet_link?: string;
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

  // Venue
  is_virtual: true,
  is_hybrid: false,
  location: '',
  zoom_link: '',
  meet_link: '',
  virtual_platform: '',
  virtual_platform_url: '',
  venue_name: '',
  venue_address: '',
  venue_city: '',
  venue_country: '',

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