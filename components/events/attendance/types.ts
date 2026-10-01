// components/events/attendance/types.ts

export interface SessionAttendanceSummary {
  session_id: string;
  title: string;
  provider: string; // 'zoom' | 'google_meet' | 'in_person' | ...
  scheduled_start: string; // ISO
  scheduled_end: string;   // ISO
  registered_count: number;
  attended_count: number;
  avg_duration_seconds: number;
  has_attendance_data: boolean;

  /**
   * Video meeting ID for platforms that support polling (Google Meet).
   * Needed to call POST /video/meetings/:id/fetch-attendance.
   *
   * Backend TODO: add to SessionAttendanceSummaryResponse so the
   * pane can offer "Fetch attendance" for Meet sessions.
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

export interface SessionRosterEntry {
  attendee_id: string;
  display_name: string;
  email: string;
  effective_status: string;
  total_duration_seconds: number;
  host_confirmed: boolean;
}