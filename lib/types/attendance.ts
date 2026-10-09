// lib/types/attendance.ts

// ============================================================
// PROVIDERS / STATUSES
// ============================================================

export type AttendanceProvider =
  | 'zoom'
  | 'google_meet'
  | 'in_person'
  | string;

export type AttendanceStatus =
  | 'registered'
  | 'joined'
  | 'partial'
  | 'full'
  | 'confirmed'
  | 'no-show';

// ============================================================
// EVENT ATTENDANCE SUMMARY
// (mirrors Go EventAttendanceSummaryResponse)
// ============================================================

export interface SessionAttendanceSummary {
  session_id: string;
  title: string;
  provider: AttendanceProvider;
  scheduled_start: string; // ISO 8601
  scheduled_end: string;   // ISO 8601
  registered_count: number;
  attended_count: number;
  avg_duration_seconds: number;
  has_attendance_data: boolean;

  /**
   * Video meeting ID — required to call
   * POST /video/meetings/:id/fetch-attendance.
   *
   * Backend TODO: add to SessionAttendanceSummaryResponse so the
   * pane can offer "Fetch attendance" for Google Meet sessions.
   */
  video_meeting_id?: string;
}

export interface EventAttendanceTotals {
  total_sessions: number;
  sessions_with_attendance: number;
  unique_attendees: number;
  total_attendance_events: number;
}

export interface EventAttendanceSummary {
  sessions: SessionAttendanceSummary[];
  totals: EventAttendanceTotals;
}

// ============================================================
// SESSION ROSTER
// (mirrors Go SessionStatusResponse — extended with identity)
// ============================================================

export interface SessionRosterEntry {
  attendee_id: string;
  session_id: string;
  derived_status: AttendanceStatus;
  effective_status: AttendanceStatus;
  total_duration_seconds: number;
  host_confirmed: boolean;
  confirmed_status?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  confirm_reason?: string;
  cert_eligible: boolean;
  last_derived_at: string;
  display_name?: string;
  email?: string;
  phone?: string; 
  /** True when this row is the event host rather than a registered attendee. */
  is_host?: boolean;
}

export interface SessionRosterPayload {
  session_id: string;
  count: number;
  attendees: SessionRosterEntry[];
}

// ============================================================
// MY SESSION LINKS
// ============================================================

export interface SessionLink {
  session_id: string;
  session_title: string;
  scheduled_start: string;
  scheduled_end: string;
  platform: string;
  join_url: string;
  expires_at: string;
}

export interface SessionLinkGroup {
  registration_id: string;
  event_id: string;
  event_name: string;
  event_slug: string;
  event_date: string;
  links: SessionLink[];
}

export interface MySessionLinksResponse {
  groups: SessionLinkGroup[];
}

// ============================================================
// EVENT ATTENDEE DIRECTORY
// (mirrors Go EventAttendeeResponse + EventAttendeeDetailResponse)
// ============================================================

/**
 * One row in the event attendee list. Backed by
 * attendee_rollup_statuses — one per (attendee, event).
 *
 * `effective_status` uses the same vocabulary as AttendanceStatus.
 * The backend emits it as a derived value:
 *   confirmed > full > partial > joined > no-show > registered
 */
// lib/types/attendance.ts

export interface EventAttendeeRow {
  attendee_id: string;
  display_name: string;
  email: string;
  phone: string;
  effective_status: AttendanceStatus;
  sessions_total: number;
  sessions_attended: number;
  sessions_confirmed: number;
  total_duration_seconds: number;
  registered_at: string;    // ISO 8601
  last_activity_at: string; // ISO 8601
  is_host: boolean;      
}

/**
 * Response body of GET /events/:eventId/attendees.
 */
export interface EventAttendeesPayload {
  attendees: EventAttendeeRow[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Query params accepted by GET /events/:eventId/attendees.
 * All optional; the backend applies defaults.
 */
export interface ListAttendeesParams {
  /** Free-text search across display_name and email. */
  search?: string;
  /** Comma-separated AttendanceStatus values. */
  status?: string;
  /** Sort field. Defaults to "name". */
  sort_by?: 'name' | 'registered_at' | 'status' | 'duration';
  /** Sort direction. Defaults to "asc". */
  sort_order?: 'asc' | 'desc';
  /** 1-indexed page number. Defaults to 1. */
  page?: number;
  /** Rows per page. Defaults to 20, capped at 100. */
  page_size?: number;
}

/**
 * Per-session detail for one attendee, returned by
 * GET /events/:eventId/attendees/:attendeeId.
 */
export interface EventAttendeeSessionDetail {
  session_id: string;
  title: string;
  provider: AttendanceProvider;
  scheduled_start: string; // ISO 8601
  scheduled_end: string;   // ISO 8601
  derived_status: AttendanceStatus;
  host_confirmed: boolean;
  total_duration_seconds: number;
  last_derived_at: string;
}

/**
 * Full detail for one attendee in one event: rollup fields plus
 * the per-session breakdown.
 */
export interface EventAttendeeDetail extends EventAttendeeRow {
  sessions: EventAttendeeSessionDetail[];
}



// ============================================================
// CROSS-EVENT ATTENDEE DIRECTORY
// (mirrors Go CrossEventAttendeeResponse)
// ============================================================

export interface CrossEventAttendee {
  attendee_id: string;
  display_name: string;
  email: string;
  phone: string;
  event_id: string;
  event_name: string;
  event_slug: string;
  event_start_date: string;
  effective_status: AttendanceStatus;
  sessions_total: number;
  sessions_attended: number;
  sessions_confirmed: number;
  total_duration_seconds: number;
  registered_at: string;
  last_activity_at: string;

  /** True when the row represents the host of the event rather than a registered attendee. */
  is_host?: boolean;
}

export interface CrossEventAttendeesPayload {
  attendees: CrossEventAttendee[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListAllAttendeesParams {
  event_id?: string;
  team_id?: string;                    // ← NEW
  scope?: 'team' | 'personal';         // ← NEW
  search?: string;
  status?: string;
  sort_by?: 'name' | 'event' | 'registered_at' | 'status' | 'duration';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}