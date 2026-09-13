// lib/utils/eventDisplay.ts

import type { Event, Schedule } from '@/lib/types/events';

// ============================================================
// DATE & TIME
// ============================================================
//
// The backend exposes date information in three places:
//   1. `event.start_date` / `event.end_date`  — RFC3339, top-level
//   2. `event.schedules[]`                    — per-session details
//   3. `event.recurrence`                     — for recurring events
//
// For display purposes we want a single "when does this event begin"
// answer. The helpers below resolve that using the top-level dates
// when present, falling back to the first schedule.

/**
 * The effective start date of the event as an ISO string.
 *
 * Priority:
 *   1. `event.start_date` (RFC3339) if set
 *   2. `event.schedules[0].start_date` (YYYY-MM-DD)
 *   3. empty string
 *
 * Callers that need a Date object should wrap with `new Date(...)`
 * and guard against `isNaN`.
 */
export function getEventStartDate(event: Event): string {
  if (event.start_date) return event.start_date;
  const first = event.schedules?.[0];
  return first?.start_date ?? '';
}

/**
 * The effective end date of the event as an ISO string, if any.
 * Returns null when the event is single-day.
 */
export function getEventEndDate(event: Event): string | null {
  if (event.end_date) return event.end_date;
  const first = event.schedules?.[0];
  return first?.end_date ?? null;
}

/**
 * The effective start time in HH:MM format, or 'TBD'.
 * Resolved from the first schedule.
 */
export function getEventStartTime(event: Event): string {
  const first = event.schedules?.[0];
  return first?.start_time ?? 'TBD';
}

/**
 * The effective end time in HH:MM format, or null.
 */
export function getEventEndTime(event: Event): string | null {
  const first = event.schedules?.[0];
  return first?.end_time ?? null;
}

/**
 * True if the event's start date is in the past.
 * Events without a parseable date are treated as not-past.
 */
export function isEventPast(event: Event): boolean {
  const start = getEventStartDate(event);
  if (!start) return false;
  const d = new Date(start);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/**
 * True if the event starts in the future (today or later).
 */
export function isEventUpcoming(event: Event): boolean {
  const start = getEventStartDate(event);
  if (!start) return false;
  const d = new Date(start);
  if (isNaN(d.getTime())) return false;
  return d.getTime() >= Date.now();
}

// ============================================================
// PRICE
// ============================================================
//
// `event.is_free` is the authoritative "is this free" flag. When it's
// false, the "price" is the minimum non-zero ticket price. If there
// are no tickets yet (drafts), price is 0.

/**
 * The lowest ticket price for the event.
 * Returns 0 for free events or events with no tickets yet.
 */
export function getEventMinPrice(event: Event): number {
  if (event.is_free) return 0;
  const prices = (event.tickets ?? [])
    .map((t) => t.price)
    .filter((p) => typeof p === 'number' && p > 0);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

/**
 * The highest ticket price for the event, or null when there are no
 * paid tickets.
 */
export function getEventMaxPrice(event: Event): number | null {
  if (event.is_free) return 0;
  const prices = (event.tickets ?? [])
    .map((t) => t.price)
    .filter((p) => typeof p === 'number' && p > 0);
  if (prices.length === 0) return null;
  return Math.max(...prices);
}

/**
 * True if the event is free (no paid tickets).
 * Uses the backend's `is_free` flag first, then falls back to
 * inspecting the tickets array.
 */
export function isEventFree(event: Event): boolean {
  if (event.is_free) return true;
  if (!event.tickets || event.tickets.length === 0) return true;
  return event.tickets.every((t) => !t.price || t.price <= 0);
}

/**
 * The certificate fee, or 0 if certificates aren't offered.
 */
export function getCertificatePrice(event: Event): number {
  if (!event.certificate_enabled) return 0;
  return event.certificate_price ?? 0;
}

// ============================================================
// LOCATION
// ============================================================

/**
 * A short human-readable location string.
 *
 * Priority:
 *   1. "Virtual" for virtual-only events with no venue
 *   2. venue.city, else venue.name, else venue.address
 *   3. in_person_location
 *   4. 'TBD'
 */
export function getEventLocation(event: Event): string {
  if (event.is_virtual && !event.is_hybrid && !event.venue?.city && !event.in_person_location) {
    return 'Virtual';
  }
  if (event.venue?.city) return event.venue.city;
  if (event.venue?.name) return event.venue.name;
  if (event.venue?.address) return event.venue.address;
  if (event.in_person_location) return event.in_person_location;
  return 'TBD';
}

/**
 * True if this is an online event (virtual or hybrid).
 */
export function isEventOnline(event: Event): boolean {
  return event.is_virtual || event.is_hybrid;
}

// ============================================================
// CAPACITY
// ============================================================

/**
 * Spots remaining before the event is full.
 * Returns null when capacity is unlimited (0) or unset.
 */
export function getSpotsLeft(event: Event): number | null {
  if (!event.capacity || event.capacity <= 0) return null;
  const taken = event.current_attendees ?? 0;
  const left = event.capacity - taken;
  return left > 0 ? left : 0;
}

/**
 * True if the event has reached its capacity.
 */
export function isEventFullyBooked(event: Event): boolean {
  if (!event.capacity || event.capacity <= 0) return false;
  return (event.current_attendees ?? 0) >= event.capacity;
}

/**
 * Attendance fill rate (0–100). Returns 0 for unlimited-capacity events.
 */
export function getEventFillRate(event: Event): number {
  if (!event.capacity || event.capacity <= 0) return 0;
  const pct = ((event.current_attendees ?? 0) / event.capacity) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// ============================================================
// TYPE / STATUS / ORGANIZER
// ============================================================

/**
 * The event's type display name, or 'Event' if unknown.
 */
export function getEventTypeName(event: Event): string {
  return event.event_type?.display_name || event.event_type?.name || 'Event';
}

/**
 * The event's type color (hex), or a neutral default.
 */
export function getEventTypeColor(event: Event): string {
  return event.event_type?.color || '#6B7280';
}

/**
 * The event's status display name, or 'Draft' if unknown.
 */
export function getEventStatusName(event: Event): string {
  return event.event_status?.display_name || event.event_status?.name || 'Draft';
}

/**
 * True when the event's status slug is `event-status-published`.
 * Matches on slug for stability across DB edits.
 */
export function isEventPublished(event: Event): boolean {
  return event.event_status?.slug === 'event-status-published';
}

/**
 * True when the event's status slug is `event-status-draft`.
 */
export function isEventDraft(event: Event): boolean {
  return (
    !event.event_status ||
    event.event_status.slug === 'event-status-draft'
  );
}

/**
 * The public-facing host name (institution name or person name).
 * Prefers the organizer object when present, falls back to creator.
 */
export function getEventHostName(event: Event): string {
  if (event.organizer?.display_name) return event.organizer.display_name;
  if (event.organizer?.name) return event.organizer.name;
  if (event.creator?.display_name) return event.creator.display_name;
  if (event.creator?.name) return event.creator.name;
  return 'Host';
}

/**
 * True when the host is an institution (as opposed to an individual).
 */
export function isHostInstitution(event: Event): boolean {
  return event.organizer?.type === 'institution';
}

// ============================================================
// FORMATTING
// ============================================================

/**
 * Format a numeric price for display.
 * Free events render "Free"; paid events render "KSh N".
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null || price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
}

/**
 * Format an event's date for a compact badge (month, day, weekday).
 * Returns placeholder strings when the date can't be parsed.
 */
export function formatEventDateBadge(event: Event): {
  month: string;
  day: string;
  weekday: string;
  time: string;
  fullDate: string;
} {
  const start = getEventStartDate(event);
  const time = getEventStartTime(event);

  if (!start) {
    return { month: 'DEC', day: '--', weekday: '---', time, fullDate: 'TBD' };
  }

  const d = new Date(start);
  if (isNaN(d.getTime())) {
    return { month: 'DEC', day: '--', weekday: '---', time, fullDate: 'TBD' };
  }

  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    time,
    fullDate: d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

/**
 * A "3 days away" style string for countdown display.
 * Returns '' when the event is in the past or the date can't be parsed.
 */
export function getTimeUntilEvent(event: Event): string {
  const start = getEventStartDate(event);
  if (!start) return '';
  const target = new Date(start).getTime();
  if (isNaN(target)) return '';

  const diff = target - Date.now();
  if (diff < 0) return '';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return 'Starting soon!';
}

/**
 * Compact duration string ("2h 30m", "45m", "3 days").
 * Prefers `event.schedules[0]` start/end times; falls back to
 * `event.duration` minutes if the schedule is missing.
 */
export function getEventDuration(event: Event): string {
  const sched = event.schedules?.[0];
  if (sched?.start_time && sched?.end_time) {
    const [sh, sm] = sched.start_time.split(':').map(Number);
    const [eh, em] = sched.end_time.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(eh)) {
      const minutes = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
      if (minutes > 0) return formatMinutes(minutes);
    }
  }
  // Fallback: sum schedule durations if end_date differs from start_date
  // (multi-day events) — out of scope for now; return a simple label.
  return '';
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ============================================================
// PREDICATES FOR UI
// ============================================================

/**
 * Whether an event should be rendered as "unavailable to register".
 * Combines past + fully booked into one call for card buttons.
 */
export function isEventUnavailable(event: Event): boolean {
  return isEventPast(event) || isEventFullyBooked(event);
}

/**
 * Whether an event is "featured" for badge rendering.
 */
export function isEventFeatured(event: Event): boolean {
  return event.is_featured === true;
}

/**
 * Whether the event is public and listed.
 */
export function isEventPublic(event: Event): boolean {
  return event.visibility === 'public';
}

// ============================================================
// SCHEDULE CONVENIENCE
// ============================================================

/**
 * The first schedule, or null when there are none.
 * Useful in components that render one session and don't care about
 * multi-day displays yet.
 */
export function getFirstSchedule(event: Event): Schedule | null {
  return event.schedules?.[0] ?? null;
}

/**
 * The number of schedules (sessions). 0 when the event has no schedules.
 */
export function getScheduleCount(event: Event): number {
  return event.schedules?.length ?? 0;
}