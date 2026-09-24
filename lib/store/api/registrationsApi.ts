// lib/store/api/registrationsApi.ts

import { api } from './baseApi';
import type { BaseResponse } from '@/lib/types/events';
import type {
  RegisterRequest,
  Registration,
  RegistrationList,
  JoinWaitlistRequest,
  WaitlistEntry,
} from '@/lib/types/registration';

export const registrationsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // PUBLIC / OPTIONAL AUTH
    // ============================================================

    /** POST /events/:id/register */
    registerForEvent: builder.mutation<
      BaseResponse<Registration>,
      { eventId: string; body: RegisterRequest }
    >({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}/register`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'Events', id: eventId },
        { type: 'Registrations', id: 'MINE' },
        { type: 'Registrations', id: 'LIST' },
      ],
    }),

    /** POST /events/:id/waitlist */
    joinWaitlist: builder.mutation<
      BaseResponse<WaitlistEntry>,
      { eventId: string; body: JoinWaitlistRequest }
    >({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}/waitlist`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'Events', id: eventId },
        { type: 'Waitlist', id: 'MINE' },
      ],
    }),

    // ============================================================
    // AUTHENTICATED
    // ============================================================

    /** GET /events/:id/registrations — organizer view */
    listEventRegistrations: builder.query<
      BaseResponse<RegistrationList>,
      { eventId: string; page?: number; page_size?: number }
    >({
      query: ({ eventId, page = 1, page_size = 20 }) => ({
        url: `/events/${eventId}/registrations`,
        method: 'GET',
        params: { page, page_size },
      }),
      providesTags: (_r, _e, { eventId }) => [
        { type: 'Registrations', id: `EVENT_${eventId}` },
      ],
    }),

    /** GET /me/registrations */
    listMyRegistrations: builder.query<
      BaseResponse<RegistrationList>,
      { page?: number; page_size?: number } | void
    >({
      query: (params) => ({
        url: '/me/registrations',
        method: 'GET',
        params: { page: params?.page ?? 1, page_size: params?.page_size ?? 20 },
      }),
      providesTags: [{ type: 'Registrations', id: 'MINE' }],
    }),

    /** GET /registrations/:id
     *
     *  Guests must supply the email they registered with so the backend
     *  can authorize access without a JWT.
     */
    getRegistration: builder.query<
    BaseResponse<Registration>,
    { id: string; guestEmail?: string }
    >({
    query: ({ id, guestEmail }) => ({
        url: `/registrations/${id}`,
        method: 'GET',
        params: guestEmail ? { email: guestEmail } : undefined,
    }),
    providesTags: (_r, _e, { id }) => [{ type: 'Registrations', id }],
    }),

    /** DELETE /registrations/:id */
    cancelRegistration: builder.mutation<
      BaseResponse<void>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/registrations/${id}`,
        method: 'DELETE',
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Registrations', id },
        { type: 'Registrations', id: 'MINE' },
        { type: 'Registrations', id: 'LIST' },
      ],
    }),
  }),
});

// ============================================================
// HOOKS
// ============================================================

export const {
  useRegisterForEventMutation,
  useJoinWaitlistMutation,
  useListEventRegistrationsQuery,
  useListMyRegistrationsQuery,
  useGetRegistrationQuery,
  useCancelRegistrationMutation,
} = registrationsApi;