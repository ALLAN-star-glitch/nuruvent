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

  /**
   * Backend TODO: add to SessionStatusResponse by joining `attendees`
   * in ListSessionAttendance. Without these, the roster dialog shows
   * "Unknown attendee".
   */
  display_name?: string;
  email?: string;
}

export interface SessionRosterPayload {
  session_id: string;
  count: number;
  attendees: SessionRosterEntry[];
}


// lib/types/attendance.ts

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