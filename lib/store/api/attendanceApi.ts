// lib/store/api/attendanceApi.ts

import { api } from './baseApi';
import type { BaseResponse } from '@/lib/types/events';
import type {
  EventAttendanceSummary,
  MySessionLinksResponse,
  SessionRosterPayload,
} from '@/lib/types/attendance';

export const attendanceApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // EVENT ATTENDANCE SUMMARY
    // ============================================================

    /**
     * GET /events/:eventId/summary
     *
     * Per-session and total attendance for every session under an
     * event. Powers the Attendance pane on the event detail page.
     */
    getEventAttendanceSummary: builder.query<
      BaseResponse<EventAttendanceSummary>,
      string
    >({
      query: (eventId) => ({
        url: `/events/${eventId}/summary`,
        method: 'GET',
      }),
      providesTags: (result, _err, eventId) => {
        const base = [
          { type: 'Attendance' as const, id: `EVENT-${eventId}` },
        ];
        const sessions = result?.data?.sessions ?? [];
        return [
          ...base,
          ...sessions.map((s) => ({
            type: 'Attendance' as const,
            id: `SESSION-${s.session_id}`,
          })),
        ];
      },
    }),

    // ============================================================
    // SESSION ROSTER
    // ============================================================

    /**
     * GET /sessions/:id/attendance
     *
     * Roster + per-attendee status for one session. Used by the
     * "View roster" dialog.
     */
   getSessionRoster: builder.query<
  BaseResponse<SessionRosterPayload>,
  string
>({
  query: (sessionId) => ({
    url: `/sessions/${sessionId}/attendance`,
    method: 'GET',
  }),
  providesTags: (_r, _e, sessionId) => [
    { type: 'Attendance' as const, id: `SESSION-${sessionId}` },
    { type: 'SessionRoster' as const, id: sessionId },
  ],
}),

    // lib/store/api/attendanceApi.ts

getMySessionLinks: builder.query<BaseResponse<MySessionLinksResponse>, void>({
  query: () => ({
    url: '/me/session-links',
    method: 'GET',
  }),
  providesTags: [{ type: 'Attendance', id: 'MY-LINKS' }],
}),

    // ============================================================
    // EXPORT
    // ============================================================

    /**
     * GET /sessions/:id/attendance/export
     *
     * Returns a CSV blob. Not cached — the caller triggers a
     * download and discards the result.
     */
    exportSessionAttendance: builder.query<Blob, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/attendance/export`,
        method: 'GET',
        responseHandler: (res) => res.blob(),
        cache: 'no-cache',
      }),
    }),
  }),
});




// ============================================================
// HOOKS
// ============================================================

export const {
  useGetEventAttendanceSummaryQuery,
  useGetSessionRosterQuery,
  useLazyExportSessionAttendanceQuery,
  useGetMySessionLinksQuery,
} = attendanceApi;