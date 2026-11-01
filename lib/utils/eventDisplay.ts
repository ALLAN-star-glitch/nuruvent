// lib/utils/eventDisplay.ts

import type { Event, Schedule } from '@/lib/types/events';

// ============================================================
// DATE & TIME
// ============================================================

export function getEventStartDate(event: Event): string {
  if (event.start_date) return event.start_date;
  const first = event.schedules?.[0];
  return first?.start_date ?? '';
}

export function getEventEndDate(event: Event): string | null {
  if (event.end_date) return event.end_date;
  const first = event.schedules?.[0];
  return first?.end_date ?? null;
}

export function getEventStartTime(event: Event): string {
  const first = event.schedules?.[0];
  return first?.start_time ?? 'TBD';
}

export function getEventEndTime(event: Event): string | null {
  const first = event.schedules?.[0];
  return first?.end_time ?? null;
}

export function isEventPast(event: Event): boolean {
  const start = getEventStartDate(event);
  if (!start) return false;
  const d = new Date(start);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function isEventUpcoming(event: Event): boolean {
  return !isEventPast(event);
}

// ============================================================
// TIMEZONE HELPERS (internal)
// ============================================================

/**
 * The IANA timezone the event's first schedule is expressed in.
 * Defaults to the platform timezone.
 */
function getEventTimezone(event: Event): string {
  const first = event.schedules?.[0];
  return first?.timezone || 'Africa/Nairobi';
}

/**
 * Format a date in a specific IANA timezone, independent of the
 * browser's locale. Falls back to browser-local when the tz string
 * is missing or invalid.
 */
function formatInTimeZone(
  date: Date | string,
  timeZone: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        ...options,
        timeZone,
      }).format(d);
    } catch {
      // fall through to local
    }
  }
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Convert "HH:MM" or "HH:MM:SS" to "h:MM AM/PM".
 * Returns "" for empty or unparseable input.
 */
function to12Hour(time: string | null | undefined): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (isNaN(h) || isNaN(m)) return '';

  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, '0');
  return `${h12}:${mm} ${period}`;
}

// ============================================================
// BADGE (compact pill)
// ============================================================

/**
 * Format an event's date for the compact badge on event cards.
 *
 * Timezone-safe: the calendar day is resolved in the event's own
 * timezone, so a Nairobi event viewed from New York still shows the
 * correct local event date.
 *
 * Returned shape is a superset of the previous version — `timeRange`
 * is new; everything else keeps the same contract.
 */
export function formatEventDateBadge(event: Event): {
  month: string;
  day: string;
  weekday: string;
  time: string;
  timeRange: string;
  fullDate: string;
} {
  const tz = getEventTimezone(event);
  const first = event.schedules?.[0];

  // Prefer schedule date-only (already local calendar date).
  const dateOnly: string | undefined = first?.start_date;
  const isoFallback: string | undefined = event.start_date;

  if (!dateOnly && !isoFallback) {
    return {
      month: 'DEC',
      day: '--',
      weekday: '---',
      time: 'TBD',
      timeRange: 'TBD',
      fullDate: 'TBD',
    };
  }

  let month = 'DEC';
  let day = '--';
  let weekday = '---';
  let fullDate = 'TBD';

  if (dateOnly) {
    // Anchor at noon UTC so no DST/tz drift can flip the day.
    const d = new Date(`${dateOnly}T12:00:00Z`);
    if (!isNaN(d.getTime())) {
      month = d
        .toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
        .toUpperCase();
      day = String(d.getUTCDate());
      weekday = d.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      });
      fullDate = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  } else if (isoFallback) {
    month = formatInTimeZone(isoFallback, tz, { month: 'short' }).toUpperCase();
    day = formatInTimeZone(isoFallback, tz, { day: 'numeric' });
    weekday = formatInTimeZone(isoFallback, tz, { weekday: 'short' });
    fullDate = formatInTimeZone(isoFallback, tz, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const startTime = first?.start_time || event.time || '';
  const endTime = first?.end_time || '';

  const shortStart = to12Hour(startTime);
  const shortEnd = to12Hour(endTime);

  const time = shortStart || 'TBD';
  const timeRange =
    shortStart && shortEnd
      ? `${shortStart} – ${shortEnd}`
      : shortStart || 'TBD';

  return { month, day, weekday, time, timeRange, fullDate };
}

// ============================================================
// DATE SUMMARY (single line under the title)
// ============================================================

/**
 * A single-line human-readable date summary for event cards.
 *
 * Outputs:
 *   - Single session:      "Wed, Jan 15, 2027 · 10:00 AM – 12:00 PM"
 *   - Multi-day:           "Jan 1 – Jan 8, 2027 · 2 sessions"
 *   - Recurring (short):   "Weekly on Mon & Thu, from Jan 4, 2027"
 *   - Recurring (long):    "Weekly on Mon & Thu · Jan 4, 2027 – Dec 28, 2028"
 *   - No date:             "Date to be announced"
 *
 * All dates are rendered in UTC-anchored form so DST/tz drift can't
 * shift the calendar day.
 */
export function formatEventDateSummary(event: Event): string {
  const first = event.schedules?.[0];
  const sessionCount = event.schedules?.length ?? 0;

  const startDateStr =
    first?.start_date ?? event.start_date?.split('T')[0] ?? '';
  const endDateStr =
    event.schedules?.[event.schedules.length - 1]?.start_date ??
    first?.end_date ??
    event.end_date?.split('T')[0] ??
    '';

  if (!startDateStr) return 'Date to be announced';

  const startDate = new Date(`${startDateStr}T12:00:00Z`);
  const endDate = endDateStr ? new Date(`${endDateStr}T12:00:00Z`) : null;

  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

  // ---- Recurring ----
  if (event.is_recurring && event.recurrence) {
    const r = event.recurrence;
    const freq =
      r.frequency === 'daily' ? 'Daily'
      : r.frequency === 'monthly' ? 'Monthly'
      : 'Weekly';

    let cadence = freq;
    if (freq === 'Weekly' && r.days_of_week?.length) {
      const days = r.days_of_week
        .map((d) => capitalize(d.slice(0, 3)))
        .join(' & ');
      cadence = `Weekly on ${days}`;
    } else if (freq === 'Monthly' && r.days_of_week?.length) {
      // rare, but handle
      cadence = `Monthly`;
    }

    const startLabel = startDate ? fmtShort(startDate) : '';
    const endLabel = endDate ? fmtShort(endDate) : '';

    const spanDays =
      startDate && endDate
        ? Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000)
        : 0;

    if (endLabel && spanDays > 60) {
      return `${cadence} · ${startLabel} – ${endLabel}`;
    }
    return `${cadence}, from ${startLabel}`;
  }

  // ---- Multi-day (non-recurring) ----
  if (
    event.is_multi_day &&
    startDate &&
    endDate &&
    startDateStr !== endDateStr
  ) {
    const startLabel = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const endLabel = fmtShort(endDate);
    const sessions =
      sessionCount > 0
        ? ` · ${sessionCount} session${sessionCount === 1 ? '' : 's'}`
        : '';
    return `${startLabel} – ${endLabel}${sessions}`;
  }

  // ---- Single session ----
  const weekday = startDate
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      })
    : '';
  const dateLabel = startDate
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  const badge = formatEventDateBadge(event);
  const timePart =
    badge.timeRange && badge.timeRange !== 'TBD' ? ` · ${badge.timeRange}` : '';

  return `${dateLabel || weekday}${timePart}`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
// PRICE
// ============================================================

export function getEventMinPrice(event: Event): number {
  if (event.is_free) return 0;
  const prices = (event.tickets ?? [])
    .map((t) => t.price)
    .filter((p) => typeof p === 'number' && p > 0);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

export function getEventMaxPrice(event: Event): number | null {
  if (event.is_free) return 0;
  const prices = (event.tickets ?? [])
    .map((t) => t.price)
    .filter((p) => typeof p === 'number' && p > 0);
  if (prices.length === 0) return null;
  return Math.max(...prices);
}

export function isEventFree(event: Event): boolean {
  if (event.is_free) return true;
  if (!event.tickets || event.tickets.length === 0) return true;
  return event.tickets.every((t) => !t.price || t.price <= 0);
}

export function getCertificatePrice(event: Event): number {
  if (!event.certificate_enabled) return 0;
  return event.certificate_price ?? 0;
}

// ============================================================
// LOCATION
// ============================================================

export function getEventLocation(event: Event): string {
  if (
    event.is_virtual &&
    !event.is_hybrid &&
    !event.venue?.city &&
    !event.in_person_location
  ) {
    return 'Virtual';
  }
  if (event.venue?.city) return event.venue.city;
  if (event.venue?.name) return event.venue.name;
  if (event.venue?.address) return event.venue.address;
  if (event.in_person_location) return event.in_person_location;
  return 'TBD';
}

export function isEventOnline(event: Event): boolean {
  return event.is_virtual || event.is_hybrid;
}

// ============================================================
// CAPACITY
// ============================================================

export function getSpotsLeft(event: Event): number | null {
  if (!event.capacity || event.capacity <= 0) return null;
  const taken = event.current_attendees ?? 0;
  const left = event.capacity - taken;
  return left > 0 ? left : 0;
}

export function isEventFullyBooked(event: Event): boolean {
  if (!event.capacity || event.capacity <= 0) return false;
  return (event.current_attendees ?? 0) >= event.capacity;
}

export function getEventFillRate(event: Event): number {
  if (!event.capacity || event.capacity <= 0) return 0;
  const pct = ((event.current_attendees ?? 0) / event.capacity) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// ============================================================
// TYPE / STATUS / ORGANIZER
// ============================================================

export function getEventTypeName(event: Event): string {
  return event.event_type?.display_name || event.event_type?.name || 'Event';
}

export function getEventTypeColor(event: Event): string {
  return event.event_type?.color || '#6B7280';
}

export function getEventStatusName(event: Event): string {
  return event.event_status?.display_name || event.event_status?.name || 'Draft';
}

export function isEventPublished(event: Event): boolean {
  return event.event_status?.slug === 'event-status-published';
}

export function isEventDraft(event: Event): boolean {
  return !event.event_status || event.event_status.slug === 'event-status-draft';
}

export function getEventHostName(event: Event): string {
  if (event.organizer?.display_name) return event.organizer.display_name;
  if (event.organizer?.name) return event.organizer.name;
  if (event.creator?.display_name) return event.creator.display_name;
  if (event.creator?.name) return event.creator.name;
  return 'Host';
}

export function isHostInstitution(event: Event): boolean {
  return event.organizer?.type === 'institution';
}

// ============================================================
// FORMATTING
// ============================================================

export function formatPrice(price: number | null | undefined): string {
  if (price == null || price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
}

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

export function getEventDuration(event: Event): string {
  const sched = event.schedules?.[0];
  if (sched?.start_time && sched?.end_time) {
    const [sh, sm] = sched.start_time.split(':').map(Number);
    const [eh, em] = sched.end_time.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(eh)) {
      const minutes = eh * 60 + (em || 0) - (sh * 60 + (sm || 0));
      if (minutes > 0) return formatMinutes(minutes);
    }
  }
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

export function isEventUnavailable(event: Event): boolean {
  return isEventPast(event) || isEventFullyBooked(event);
}

export function isEventFeatured(event: Event): boolean {
  return event.is_featured === true;
}

export function isEventPublic(event: Event): boolean {
  return event.visibility === 'public';
}

// ============================================================
// SCHEDULE CONVENIENCE
// ============================================================

export function getFirstSchedule(event: Event): Schedule | null {
  return event.schedules?.[0] ?? null;
}

export function getScheduleCount(event: Event): number {
  return event.schedules?.length ?? 0;
}



/**
 * Long-form human date label for detail pages. Timezone-safe.
 *
 * Cases:
 *   - Single-day:              "Monday, January 4, 2027"
 *   - Multi-day (non-rec):     "Monday, January 4, 2027 – Monday, January 8, 2027"
 *   - Recurring short:         "Weekly on Mon & Thu, starting Monday, January 4, 2027"
 *   - Recurring long:          "Weekly on Mon & Thu · Monday, January 4, 2027 – Thursday, December 28, 2028"
 *   - No date:                 "To be announced"
 */
export function getEventLongDateLabel(event: Event): string {
  const first = event.schedules?.[0];
  const sessions = event.schedules?.length ?? 0;

  const startStr =
    first?.start_date ?? event.start_date?.split('T')[0] ?? '';
  const endStr =
    event.schedules?.[sessions - 1]?.start_date ??
    first?.end_date ??
    event.end_date?.split('T')[0] ??
    '';

  if (!startStr) return 'To be announced';

  const fmtLong = (iso: string) => {
    const d = new Date(`${iso}T12:00:00Z`);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const startLabel = fmtLong(startStr);
  const endLabel = endStr ? fmtLong(endStr) : '';

  // ---- Recurring ----
  if (event.is_recurring && event.recurrence) {
    const r = event.recurrence;
    const freq =
      r.frequency === 'daily' ? 'Daily'
      : r.frequency === 'monthly' ? 'Monthly'
      : 'Weekly';
    const cadence =
      freq === 'Weekly' && r.days_of_week?.length
        ? `Weekly on ${r.days_of_week
            .map((d) => capitalize(d.slice(0, 3)))
            .join(' & ')}`
        : freq;

    const spanDays =
      endStr && startStr
        ? Math.round(
            (new Date(`${endStr}T12:00:00Z`).getTime() -
              new Date(`${startStr}T12:00:00Z`).getTime()) /
              86_400_000,
          )
        : 0;

    if (endLabel && spanDays > 60) {
      return `${cadence} · ${startLabel} – ${endLabel}`;
    }
    return `${cadence}, starting ${startLabel}`;
  }

  // ---- Multi-day ----
  if (event.is_multi_day && startStr && endStr && startStr !== endStr) {
    return `${startLabel} – ${endLabel}`;
  }

  // ---- Single ----
  return startLabel;
}

/**
 * 12-hour time range for the first schedule.
 * Falls back to start-only when no end time is present.
 */
export function getEventTimeRange(event: Event): string {
  const first = event.schedules?.[0];
  const start = to12HourLocal(first?.start_time || event.time || '');
  const end = to12HourLocal(first?.end_time || '');
  if (start && end) return `${start} – ${end}`;
  return start || 'TBD';
}

function to12HourLocal(time: string | null | undefined): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (isNaN(h) || isNaN(m)) return '';
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}