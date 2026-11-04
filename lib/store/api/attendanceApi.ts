// lib/store/api/attendanceApi.ts

import { api } from './baseApi';
import type { BaseResponse } from '@/lib/types/events';
import type {
  EventAttendeeDetail,
  EventAttendeesPayload,
  EventAttendanceSummary,
  ListAttendeesParams,
  MySessionLinksResponse,
  SessionRosterPayload,
  CrossEventAttendeesPayload,
  ListAllAttendeesParams,
  SessionLookupPayload,
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

    // ============================================================
    // MY SESSION LINKS
    // ============================================================

    getMySessionLinks: builder.query<
      BaseResponse<MySessionLinksResponse>,
      void
    >({
      query: () => ({
        url: '/me/session-links',
        method: 'GET',
      }),
      providesTags: [{ type: 'Attendance', id: 'MY-LINKS' }],
    }),

    // ============================================================
    // EVENT ATTENDEE DIRECTORY
    // ============================================================

    /**
     * GET /events/:eventId/attendees
     *
     * Paginated, filterable attendee list for one event. Backed by
     * attendee_rollup_statuses. Powers the attendees page.
     */
    getEventAttendees: builder.query<
      BaseResponse<EventAttendeesPayload>,
      { eventId: string; params?: ListAttendeesParams }
    >({
      query: ({ eventId, params }) => ({
        url: `/events/${eventId}/attendees`,
        method: 'GET',
        params,
      }),
      providesTags: (_r, _e, { eventId }) => [
        { type: 'Attendance' as const, id: `EVENT-ATTENDEES-${eventId}` },
      ],
    }),

    /**
     * GET /events/:eventId/attendees/:attendeeId
     *
     * One attendee's rollup plus their per-session breakdown for an
     * event. Powers the attendee detail dialog.
     */
    getEventAttendeeDetail: builder.query<
      BaseResponse<EventAttendeeDetail>,
      { eventId: string; attendeeId: string }
    >({
      query: ({ eventId, attendeeId }) => ({
        url: `/events/${eventId}/attendees/${attendeeId}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, { attendeeId }) => [
        { type: 'Attendance' as const, id: `ATTENDEE-${attendeeId}` },
      ],
    }),

    // ============================================================
    // SESSION LOOKUP (event_schedule_id → attendance_session_id)
    // ============================================================

    /**
     * GET /attendance/sessions/lookup?provider_session_id=...
     *
     * Resolves an event_schedules.id (the provider session ID) to
     * the corresponding attendance sessions.id. Used by the
     * attendee page's Session dropdown to send the correct ID to
     * the filter query.
     */
    lookupSessionByProviderID: builder.query<
      BaseResponse<SessionLookupPayload>,
      string
    >({
      query: (providerSessionID) => ({
        url: '/attendance/sessions/lookup',
        method: 'GET',
        params: { provider_session_id: providerSessionID },
      }),
      providesTags: (_r, _e, providerSessionID) => [
        {
          type: 'Attendance' as const,
          id: `LOOKUP-${providerSessionID}`,
        },
      ],
    }),

    // ============================================================
    // CROSS-EVENT ATTENDEE DIRECTORY
    // ============================================================

    /**
     * GET /attendees
     *
     * Cross-event attendee directory, scoped to the caller's
     * accounts. Backed by attendee_rollup_statuses.
     */
    getAttendees: builder.query<
      BaseResponse<CrossEventAttendeesPayload>,
      ListAllAttendeesParams | void
    >({
      query: (params) => ({
        url: '/attendees',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: (_r, _e, params) => [
        { type: 'Attendance' as const, id: 'ALL-ATTENDEES' },
        {
          type: 'Attendance' as const,
          id: `TEAM-ATTENDEES-${params?.team_id ?? 'all'}`,
        },
      ],
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
  useGetEventAttendeesQuery,
  useGetEventAttendeeDetailQuery,
  useGetAttendeesQuery,
  useLookupSessionByProviderIDQuery,
  useLazyLookupSessionByProviderIDQuery,
} = attendanceApi;