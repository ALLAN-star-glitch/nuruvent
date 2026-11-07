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
  | 'no_show';

// ============================================================
// EVENT ATTENDANCE SUMMARY
// ============================================================

export interface SessionAttendanceSummary {
  session_id: string;
  title: string;
  provider: AttendanceProvider;
  scheduled_start: string;
  scheduled_end: string;
  registered_count: number;
  attended_count: number;
  avg_duration_seconds: number;
  has_attendance_data: boolean;
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
// ============================================================

/** Per-session status for the green/gray dots in the UI. */
export interface SessionBreakdown {
  session_id: string;
  status: AttendanceStatus;
}

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
  registered_at: string;
  last_activity_at: string;
  is_host: boolean;
  /** ADDED: Per-session statuses for UI dots. */
  session_breakdowns: SessionBreakdown[];
}

export interface EventAttendeesPayload {
  attendees: EventAttendeeRow[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListAttendeesParams {
  /** Filter by a specific session. */
  session_id?: string;
  search?: string;
  status?: string;
  sort_by?: 'name' | 'registered_at' | 'status' | 'duration';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface EventAttendeeSessionDetail {
  session_id: string;
  title: string;
  provider: AttendanceProvider;
  scheduled_start: string;
  scheduled_end: string;
  derived_status: AttendanceStatus;
  host_confirmed: boolean;
  total_duration_seconds: number;
  last_derived_at: string;
}

export interface EventAttendeeDetail extends EventAttendeeRow {
  sessions: EventAttendeeSessionDetail[];
}

// ============================================================
// CROSS-EVENT ATTENDEE DIRECTORY
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
  is_host?: boolean;
  /** ADDED: Per-session statuses for UI dots. */
  session_breakdowns: SessionBreakdown[];
}

export interface CrossEventAttendeesPayload {
  attendees: CrossEventAttendee[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListAllAttendeesParams {
  event_id?: string;
  team_id?: string;
  scope?: 'team' | 'personal';
  /** ADDED: Filter by a specific session. */
  session_id?: string;
  search?: string;
  status?: string;
  sort_by?: 'name' | 'event' | 'registered_at' | 'status' | 'duration';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface SessionLookupPayload {
  provider_session_id: string;
  attendance_session_id: string;
}