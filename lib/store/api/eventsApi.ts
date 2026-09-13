// lib/store/api/eventsApi.ts

import { api } from './baseApi';
import type {
  // Response shapes
  Event,
  EventType,
  EventStatus,
  Category,
  EventFormat,
  TicketType,
  CertificateTemplate,
  CertificateType,
  RecurrencePatternRef,
  PaginatedEvents,
  OffsetEvents,
  MediaInfo,
  BaseResponse,
  BulkDeleteResult,
  BulkRestoreResult,
  BulkStatusResult,
  BulkDuplicateResult,
  // Request shapes
  CreateDraftRequest,
  CreateEventRequest,
  UpdateEventRequest,
  DuplicateEventRequest,
  BulkDuplicateRequest,
  // Query params
  ListEventsParams,
  SearchEventsParams,
  GetEventsByTypeParams,
  GetUpcomingEventsParams,
  GetPastEventsParams,
  BulkIDsRequest,
  GenerateEventDraftResult,
  GenerateEventDraftRequest,
} from '@/lib/types/events';

// ============================================================
// ADDITIONAL QUERY PARAMS (not in types file — small enough)
// ============================================================

/** Params for GET /events/me/search (authenticated, permission-scoped). */
interface SearchMyEventsParams extends SearchEventsParams {
  team_id?: string;
  team_type?: 'personal' | 'institution';
}

/** Params for GET /events/categories (public reference data). */
type GetCategoriesParams = void;

/** Params for GET /events/ticket-types (public reference data). */
type GetTicketTypesParams = void;

// ============================================================
// API SLICE
// ============================================================

export const eventsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // PUBLIC QUERIES — reference data
    // ============================================================

    /** GET /events/types */
    getEventTypes: builder.query<BaseResponse<EventType[]>, void>({
      query: () => ({
        url: '/events/types',
        method: 'GET',
      }),
      providesTags: ['EventTypes'],
    }),

    /** GET /events/statuses */
    getEventStatuses: builder.query<BaseResponse<EventStatus[]>, void>({
      query: () => ({
        url: '/events/statuses',
        method: 'GET',
      }),
      providesTags: ['EventStatuses'],
    }),

    /** GET /events/categories */
    getCategories: builder.query<BaseResponse<Category[]>, GetCategoriesParams>({
      query: () => ({
        url: '/events/categories',
        method: 'GET',
      }),
      providesTags: ['EventCategories'],
    }),

    /** GET /events/ticket-types */
    getTicketTypes: builder.query<BaseResponse<TicketType[]>, GetTicketTypesParams>({
      query: () => ({
        url: '/events/ticket-types',
        method: 'GET',
      }),
      providesTags: ['TicketTypes'],
    }),

    // ============================================================
    // PUBLIC QUERIES — events
    // ============================================================

    /** GET /events — public list with filters (offset-based). */
    listEvents: builder.query<BaseResponse<OffsetEvents>, ListEventsParams>({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.data?.length
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),

    /** GET /events/{id} */
    getEventById: builder.query<BaseResponse<Event>, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Events', id }],
    }),

    /** GET /events/slug/{slug} */
    getEventBySlug: builder.query<BaseResponse<Event>, string>({
      query: (slug) => ({
        url: `/events/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, slug) => [
        { type: 'Events', id: `slug_${slug}` },
      ],
    }),

    /** GET /events/upcoming */
    getUpcomingEvents: builder.query<
      BaseResponse<Event[]>,
      GetUpcomingEventsParams | void
    >({
      query: (params) => ({
        url: '/events/upcoming',
        method: 'GET',
        params: { limit: params?.limit ?? 10 },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'UPCOMING' },
            ]
          : [{ type: 'Events', id: 'UPCOMING' }],
    }),

    /** GET /events/past */
    getPastEvents: builder.query<
      BaseResponse<Event[]>,
      GetPastEventsParams | void
    >({
      query: (params) => ({
        url: '/events/past',
        method: 'GET',
        params: { limit: params?.limit ?? 10 },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'PAST' },
            ]
          : [{ type: 'Events', id: 'PAST' }],
    }),

    /** GET /events/type/{type} — events filtered by type slug. */
    getEventsByType: builder.query<
      BaseResponse<PaginatedEvents>,
      GetEventsByTypeParams
    >({
      query: ({ type, page = 1, page_size = 20 }) => ({
        url: `/events/type/${type}`,
        method: 'GET',
        params: { page, page_size },
      }),
      providesTags: (result, _error, { type }) =>
        result?.data?.data?.length
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: `TYPE_${type}` },
            ]
          : [{ type: 'Events', id: `TYPE_${type}` }],
    }),

    /** GET /events/search — public search (public events only). */
    searchEvents: builder.query<
      BaseResponse<PaginatedEvents>,
      SearchEventsParams
    >({
      query: (params) => ({
        url: '/events/search',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.data?.length
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'SEARCH' },
            ]
          : [{ type: 'Events', id: 'SEARCH' }],
    }),

    // ============================================================
    // PROTECTED QUERIES
    // ============================================================

    /**
     * GET /events/me — authenticated list, scoped by token.
     *
     * Distinct from the public `listEvents` (which uses GET /events).
     * The backend mounts these at different paths so the public and
     * protected list flows never overlap.
     */
    listMyEvents: builder.query<BaseResponse<PaginatedEvents>, ListEventsParams>(
      {
        query: (params) => ({
          url: '/events/me',
          method: 'GET',
          params,
        }),
        providesTags: (result) =>
          result?.data?.data?.length
            ? [
                ...result.data.data.map(({ id }) => ({
                  type: 'Events' as const,
                  id,
                })),
                { type: 'Events', id: 'MINE' },
              ]
            : [{ type: 'Events', id: 'MINE' }],
      },
    ),

    /** GET /events/me/search — authenticated, permission-scoped search. */
    searchMyEvents: builder.query<
      BaseResponse<PaginatedEvents>,
      SearchMyEventsParams
    >({
      query: (params) => ({
        url: '/events/me/search',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.data?.length
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'MINE_SEARCH' },
            ]
          : [{ type: 'Events', id: 'MINE_SEARCH' }],
    }),

    /**
     * GET /events/me?only_deleted=true — trashed events for the
     * authenticated user. Returns the paginated envelope.
     */
    getTrashedEvents: builder.query<
      BaseResponse<PaginatedEvents>,
      { page?: number; page_size?: number }
    >({
      query: ({ page = 1, page_size = 20 }) => ({
        url: '/events/me',
        method: 'GET',
        params: {
          only_deleted: true,
          page,
          page_size,
        },
      }),
      providesTags: (result) =>
        result?.data?.data?.length
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Events' as const,
                id,
              })),
              { type: 'Events', id: 'TRASH' },
              'TrashCount',
            ]
          : [{ type: 'Events', id: 'TRASH' }, 'TrashCount'],
    }),

    /**
     * GET /events/me?only_deleted=true&page_size=1 — count of trashed
     * events. Reads `total` off the paginated envelope.
     */
    getTrashedEventsCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: '/events/me',
        method: 'GET',
        params: {
          only_deleted: true,
          page: 1,
          page_size: 1,
        },
      }),
      transformResponse: (response: BaseResponse<PaginatedEvents>) => ({
        count: response?.data?.total ?? 0,
      }),
      providesTags: ['TrashCount'],
    }),

    // ============================================================
    // PROTECTED MUTATIONS — create
    // ============================================================

    /**
     * POST /events/draft — create a draft event.
     *
     * Scope is resolved by the backend from the JWT. Do NOT send
     * team_id or account_id in the body.
     */
    createDraft: builder.mutation<BaseResponse<Event>, CreateDraftRequest>({
      query: (data) => ({
        url: '/events/draft',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        'TrashCount',
      ],
    }),

    /** POST /events — create and publish an event. */
    createEvent: builder.mutation<BaseResponse<Event>, CreateEventRequest>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ============================================================
    // PROTECTED MUTATIONS — update & delete
    // ============================================================

    /** PUT /events/{id} — update an event. */
    updateEvent: builder.mutation<
      BaseResponse<Event>,
      { id: string; data: UpdateEventRequest }
    >({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    /** DELETE /events/{id} — soft delete (move to trash). */
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** DELETE /events/{id}/permanent — hard delete. */
    permanentlyDeleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** POST /events/{id}/restore — restore a soft-deleted event. */
    restoreEvent: builder.mutation<BaseResponse<Event>, string>({
      query: (id) => ({
        url: `/events/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    // ============================================================
    // PROTECTED MUTATIONS — status
    // ============================================================

    /** POST /events/{id}/publish */
    publishEvent: builder.mutation<BaseResponse<Event>, string>({
      query: (id) => ({
        url: `/events/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** POST /events/{id}/cancel */
    cancelEvent: builder.mutation<BaseResponse<Event>, string>({
      query: (id) => ({
        url: `/events/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    /** POST /events/{id}/complete */
    completeEvent: builder.mutation<BaseResponse<Event>, string>({
      query: (id) => ({
        url: `/events/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    /** POST /events/{id}/duplicate */
    duplicateEvent: builder.mutation<
      BaseResponse<Event>,
      { id: string; data?: DuplicateEventRequest }
    >({
      query: ({ id, data }) => ({
        url: `/events/${id}/duplicate`,
        method: 'POST',
        body: data ?? {},
      }),
      invalidatesTags: [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
      ],
    }),

    /**
     * POST /events/ai/generate-draft
     *
     * Calls the AI provider to generate a fully-formed event draft
     * (name, description, schedule, tickets, venue) from a natural-language
     * prompt. The draft is NOT persisted — the caller reviews it and
     * submits it to `createDraft` or `createEvent` when ready.
     *
     * Scope (team, account) is resolved from the JWT by the backend.
     * Only the AI-specific fields are sent in the body.
     */
    generateEventDraft: builder.mutation<
      BaseResponse<GenerateEventDraftResult>,
      GenerateEventDraftRequest
    >({
      query: (body) => ({
        url: '/events/ai/generate-draft',
        method: 'POST',
        body,
      }),
      // No cache invalidation — pure computation on the backend.
    }),

    // ============================================================
    // PROTECTED MUTATIONS — media
    // ============================================================

    /** POST /events/{id}/image — multipart upload. */
    uploadEventImage: builder.mutation<
      BaseResponse<MediaInfo>,
      { eventId: string; image: File }
    >({
      query: ({ eventId, image }) => {
        const formData = new FormData();
        formData.append('image', image);
        return {
          url: `/events/${eventId}/image`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Events', id: eventId },
      ],
    }),

    /** POST /events/{id}/certificate — multipart upload. */
    uploadCertificateTemplate: builder.mutation<
      BaseResponse<MediaInfo>,
      { eventId: string; certificate: File }
    >({
      query: ({ eventId, certificate }) => {
        const formData = new FormData();
        formData.append('certificate', certificate);
        return {
          url: `/events/${eventId}/certificate`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Events', id: eventId },
      ],
    }),

    /** DELETE /events/{id}/image */
    deleteEventImage: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/image`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Events', id: eventId },
      ],
    }),

    /** DELETE /events/{id}/certificate */
    deleteEventCertificate: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/certificate`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Events', id: eventId },
      ],
    }),

    /** DELETE /events/{id}/media — delete image + certificate. */
    deleteAllEventMedia: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/media`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Events', id: eventId },
      ],
    }),

    // ============================================================
    // PROTECTED MUTATIONS — bulk
    // ============================================================

    /** DELETE /events/bulk — soft delete many. */
    bulkDeleteEvents: builder.mutation<BaseResponse<BulkDeleteResult>, BulkIDsRequest>({
      query: (body) => ({
        url: '/events/bulk',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** DELETE /events/bulk/permanent — hard delete many. */
    bulkPermanentlyDeleteEvents: builder.mutation<
      BaseResponse<BulkDeleteResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/permanent',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** POST /events/bulk/restore */
    bulkRestoreEvents: builder.mutation<
      BaseResponse<BulkRestoreResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/restore',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ],
    }),

    /** POST /events/bulk/publish */
    bulkPublishEvents: builder.mutation<
      BaseResponse<BulkStatusResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/publish',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    /** POST /events/bulk/cancel */
    bulkCancelEvents: builder.mutation<
      BaseResponse<BulkStatusResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/cancel',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    /** POST /events/bulk/complete */
    bulkCompleteEvents: builder.mutation<
      BaseResponse<BulkStatusResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/complete',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    /** POST /events/bulk/duplicate */
    bulkDuplicateEvents: builder.mutation<
      BaseResponse<BulkDuplicateResult>,
      BulkDuplicateRequest
    >({
      query: (body) => ({
        url: '/events/bulk/duplicate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
      ],
    }),

    /** DELETE /events/bulk/media — delete media for many events. */
    bulkDeleteEventMedia: builder.mutation<
      BaseResponse<BulkDeleteResult>,
      BulkIDsRequest
    >({
      query: (body) => ({
        url: '/events/bulk/media',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: (result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'MINE' },
      ],
    }),
  }),
});

// ============================================================
// EXPORT HOOKS
// ============================================================

// ---- Public queries ----
export const {
  useGetEventTypesQuery,
  useGetEventStatusesQuery,
  useGetCategoriesQuery,
  useGetTicketTypesQuery,
  useListEventsQuery,
  useGetEventByIdQuery,
  useGetEventBySlugQuery,
  useGetUpcomingEventsQuery,
  useGetPastEventsQuery,
  useGetEventsByTypeQuery,
  useSearchEventsQuery,
} = eventsApi;

// ---- Protected queries ----
export const {
  useListMyEventsQuery,
  useSearchMyEventsQuery,
  useGetTrashedEventsQuery,
  useGetTrashedEventsCountQuery,
} = eventsApi;

// ---- Protected mutations — create ----
export const {
  useCreateDraftMutation,
  useCreateEventMutation,
} = eventsApi;

// ---- Protected mutations — update & delete ----
export const {
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePermanentlyDeleteEventMutation,
  useRestoreEventMutation,
} = eventsApi;

// ---- Protected mutations — status ----
export const {
  usePublishEventMutation,
  useCancelEventMutation,
  useCompleteEventMutation,
  useDuplicateEventMutation,
} = eventsApi;

// ---- Protected mutations — AI ----
export const {
  useGenerateEventDraftMutation,
} = eventsApi;

// ---- Protected mutations — media ----
export const {
  useUploadEventImageMutation,
  useUploadCertificateTemplateMutation,
  useDeleteEventImageMutation,
  useDeleteEventCertificateMutation,
  useDeleteAllEventMediaMutation,
} = eventsApi;

// ---- Protected mutations — bulk ----
export const {
  useBulkDeleteEventsMutation,
  useBulkPermanentlyDeleteEventsMutation,
  useBulkRestoreEventsMutation,
  useBulkPublishEventsMutation,
  useBulkCancelEventsMutation,
  useBulkCompleteEventsMutation,
  useBulkDuplicateEventsMutation,
  useBulkDeleteEventMediaMutation,
} = eventsApi;

// ============================================================
// CONVENIENCE RE-EXPORTS
// ============================================================

export type {
  Event,
  EventType,
  EventStatus,
  Category,
  EventFormat,
  TicketType,
  CertificateTemplate,
  CertificateType,
  RecurrencePatternRef,
  PaginatedEvents,
  OffsetEvents,
  MediaInfo,
  BaseResponse,
  BulkDeleteResult,
  BulkRestoreResult,
  BulkStatusResult,
  BulkDuplicateResult,
  CreateDraftRequest,
  CreateEventRequest,
  UpdateEventRequest,
  DuplicateEventRequest,
  BulkDuplicateRequest,
  ListEventsParams,
  SearchEventsParams,
  GetEventsByTypeParams,
  GetUpcomingEventsParams,
  GetPastEventsParams,
  BulkIDsRequest,
} from '@/lib/types/events';