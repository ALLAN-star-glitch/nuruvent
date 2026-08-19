// lib/store/api/eventsApi.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './baseApi';

// ============================================================
// REQUEST TYPES
// ============================================================

// ✅ CreateDraftRequest - All fields optional for drafts
export interface CreateDraftRequest {
  name?: string;
  description?: string;
  event_type_id?: string;
  date?: string;
  time?: string;
  duration?: number;
  price?: number;
  certificate_price?: number;
  location?: string;
  is_virtual?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

// ✅ CreateEventRequest - All fields required for published events
export interface CreateEventRequest {
  name: string;
  description?: string;
  event_type_id: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
  certificate_price?: number;
  location?: string;
  is_virtual?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  event_type_id?: string;
  event_status_id?: string;
  date?: string;
  time?: string;
  duration?: number;
  price?: number;
  certificate_price?: number;
  location?: string;
  is_virtual?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

export interface ListEventsParams {
  account_id?: string;
  event_type_id?: string;
  event_status_id?: string;
  limit?: number;
  offset?: number;
}

export interface SearchEventsParams {
  q?: string;
  account_id?: string;
  event_type_id?: string;
  page?: number;
  page_size?: number;
}

export interface GetEventsByTypeParams {
  type: string;
  page?: number;
  page_size?: number;
}

export interface GetEventsByAccountParams {
  accountId: string;
  page?: number;
  page_size?: number;
}

export interface GetUpcomingEventsParams {
  limit?: number;
}

export interface GetPastEventsParams {
  limit?: number;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface EventResponse {
  ID: string;
  Slug: string;
  Name: string;
  DisplayName: string;
  Description?: string;
  EventTypeID: string;
  EventStatusID: string;
  ImageURL?: string;
  ThumbnailURL?: string;
  Date: string;
  Time: string;
  Duration: number;
  Price: number;
  CertificatePrice: number;
  Location: string;
  IsVirtual: boolean;
  ZoomLink?: string;
  MeetLink?: string;
  MaxAttendees: number;
  CurrentAttendees: number;
  AccountID: string;
  CreatedBy: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export interface EventTypeResponse {
  ID: string;
  Name: string;
  Slug: string;
  Description?: string;
  Icon?: string;
  Color?: string;
}

export interface EventStatusResponse {
  ID: string;
  Name: string;
  Slug: string;
  Color?: string;
}

export interface MediaInfoResponse {
  ID: string;
  URL: string;
  Type: string;
}

export interface PaginatedEventsResponse {
  data: EventResponse[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ListEventsResponse {
  data: EventResponse[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================
// API SLICE
// ============================================================

export const eventsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // PUBLIC ENDPOINTS - QUERIES
    // ============================================================

    // GET /api/v1/events - List all events with filters
    listEvents: builder.query<ListEventsResponse, ListEventsParams>({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return {
            data: response.data.data,
            total: response.data.total || response.data.data.length,
            limit: response.data.limit || 20,
            offset: response.data.offset || 0,
          };
        }
        if (response?.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            total: response.total || response.data.length,
            limit: response.limit || 20,
            offset: response.offset || 0,
          };
        }
        return {
          data: [],
          total: 0,
          limit: 20,
          offset: 0,
        };
      },
      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: 'LIST' },
          ];
        }
        return [{ type: 'Events', id: 'LIST' }];
      },
    }),

    // GET /api/v1/events/{id} - Get event by ID
    getEventById: builder.query<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),

    // GET /api/v1/events/slug/{slug} - Get event by slug
    getEventBySlug: builder.query<EventResponse, string>({
      query: (slug) => ({
        url: `/events/slug/${slug}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, slug) => [{ type: 'Events', id: slug }],
    }),

    // GET /api/v1/events/upcoming - Get upcoming events
    getUpcomingEvents: builder.query<EventResponse[], GetUpcomingEventsParams>({
      query: ({ limit = 10 }) => ({
        url: '/events/upcoming',
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: (result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          return [
            ...result.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: 'UPCOMING' },
          ];
        }
        return [{ type: 'Events', id: 'UPCOMING' }];
      },
    }),

    // GET /api/v1/events/past - Get past events
    getPastEvents: builder.query<EventResponse[], GetPastEventsParams>({
      query: ({ limit = 10 }) => ({
        url: '/events/past',
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: (result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          return [
            ...result.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: 'PAST' },
          ];
        }
        return [{ type: 'Events', id: 'PAST' }];
      },
    }),

    // GET /api/v1/events/types - Get all event types
    getEventTypes: builder.query<EventTypeResponse[], void>({
      query: () => ({
        url: '/events/types',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: ['EventTypes'],
    }),

    // GET /api/v1/events/statuses - Get all event statuses
    getEventStatuses: builder.query<EventStatusResponse[], void>({
      query: () => ({
        url: '/events/statuses',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: ['EventStatuses'],
    }),

    // GET /api/v1/events/type/{type} - Get events by type
    getEventsByType: builder.query<
      PaginatedEventsResponse,
      GetEventsByTypeParams
    >({
      query: ({ type, page = 1, page_size = 20 }) => ({
        url: `/events/type/${type}`,
        method: 'GET',
        params: { page, page_size },
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return response.data;
        }
        if (response?.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            total: response.total || response.data.length,
            page: response.page || 1,
            page_size: response.page_size || 20,
            total_pages: response.total_pages || 1,
          };
        }
        return {
          data: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        };
      },
      providesTags: (result, error, { type }) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: `TYPE_${type}` },
          ];
        }
        return [{ type: 'Events', id: `TYPE_${type}` }];
      },
    }),

    // GET /api/v1/events/search - Search events
    searchEvents: builder.query<
      PaginatedEventsResponse,
      SearchEventsParams
    >({
      query: (params) => ({
        url: '/events/search',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return response.data;
        }
        if (response?.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            total: response.total || response.data.length,
            page: response.page || 1,
            page_size: response.page_size || 20,
            total_pages: response.total_pages || 1,
          };
        }
        return {
          data: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        };
      },
      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: 'SEARCH' },
          ];
        }
        return [{ type: 'Events', id: 'SEARCH' }];
      },
    }),

    // ============================================================
    // PROTECTED ENDPOINTS - QUERIES
    // ============================================================

    // GET /api/v1/accounts/{accountId}/events - Get events by account
    getEventsByAccount: builder.query<
      PaginatedEventsResponse,
      GetEventsByAccountParams
    >({
      query: ({ accountId, page = 1, page_size = 20 }) => ({
        url: `/accounts/${accountId}/events`,
        method: 'GET',
        params: { page, page_size },
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return {
            data: response.data.data,
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            total_pages: response.data.total_pages || 0,
          };
        }
        return {
          data: [],
          page: 1,
          page_size: 20,
          total: 0,
          total_pages: 0,
        };
      },
      providesTags: (result, error, { accountId }) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ ID }) => ({ type: 'Events' as const, id: ID })),
            { type: 'Events', id: `ACCOUNT_${accountId}` },
          ];
        }
        return [{ type: 'Events', id: `ACCOUNT_${accountId}` }];
      },
    }),

    // ============================================================
    // PROTECTED ENDPOINTS - MUTATIONS
    // ============================================================

    // ✅ POST /api/v1/accounts/{accountId}/events/draft - Create draft (minimal validation)
    createDraft: builder.mutation<EventResponse, { accountId: string; data: FormData }>({
      query: ({ accountId, data }) => ({
        url: `/accounts/${accountId}/events/draft`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: `ACCOUNT_${accountId}` },
      ],
    }),

    // ✅ POST /api/v1/accounts/{accountId}/events - Create published event (strict validation)
    createEvent: builder.mutation<EventResponse, { accountId: string; data: FormData }>({
      query: ({ accountId, data }) => ({
        url: `/accounts/${accountId}/events`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: `ACCOUNT_${accountId}` },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ❌ REMOVED: createEventWithImage - No longer needed as both endpoints handle images

    // PUT /api/v1/events/{id} - Update event
    updateEvent: builder.mutation<EventResponse, { id: string; data: UpdateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // DELETE /api/v1/events/{id} - Delete event
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    // POST /api/v1/events/{id}/publish - Publish event
   publishEvent: builder.mutation<EventResponse, { id: string; accountId: string }>({
    query: ({ id }) => ({
        url: `/events/${id}/publish`,
        method: 'POST',
    }),
    transformResponse: (response: any) => {
        if (response?.data) {
        return response.data;
        }
        return response;
    },
    invalidatesTags: (result, error, { id, accountId }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: `ACCOUNT_${accountId}` }, // Invalidate account-specific cache
    ],
    }),

    // POST /api/v1/events/{id}/cancel - Cancel event
    cancelEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // POST /api/v1/events/{id}/complete - Complete event
    completeEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/complete`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    // POST /api/v1/accounts/{accountId}/events/{eventId}/image - Upload event image
    uploadEventImage: builder.mutation<
      MediaInfoResponse,
      { accountId: string; eventId: string; image: File }
    >({
      query: ({ accountId, eventId, image }) => {
        const formData = new FormData();
        formData.append('image', image);
        return {
          url: `/accounts/${accountId}/events/${eventId}/image`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),

    // POST /api/v1/accounts/{accountId}/events/{eventId}/certificate - Upload certificate template
    uploadCertificateTemplate: builder.mutation<
      MediaInfoResponse,
      { accountId: string; eventId: string; certificate: File }
    >({
      query: ({ accountId, eventId, certificate }) => {
        const formData = new FormData();
        formData.append('certificate', certificate);
        return {
          url: `/accounts/${accountId}/events/${eventId}/certificate`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),
  }),
});

// ============================================================
// EXPORT HOOKS
// ============================================================

// Public endpoints - Queries
export const {
  useListEventsQuery,
  useGetEventByIdQuery,
  useGetEventBySlugQuery,
  useGetUpcomingEventsQuery,
  useGetPastEventsQuery,
  useGetEventTypesQuery,
  useGetEventStatusesQuery,
  useGetEventsByTypeQuery,
  useSearchEventsQuery,
} = eventsApi;

// Protected endpoints - Queries
export const {
  useGetEventsByAccountQuery,
} = eventsApi;

// Protected endpoints - Mutations
export const {
  useCreateDraftMutation,        // ✅ NEW - for auto-save drafts
  useCreateEventMutation,        // ✅ Updated - for published events
  // ❌ REMOVED: useCreateEventWithImageMutation
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useCompleteEventMutation,
  useUploadEventImageMutation,
  useUploadCertificateTemplateMutation,
} = eventsApi;