// lib/store/api/eventsApi.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { mapEventResponse, mapEventStatus, mapEventType, mapPaginatedEvents } from '@/lib/utils/eventMapper';
import { api } from './baseApi';

// ============================================================
// REQUEST TYPES
// ============================================================

// ✅ CreateDraftRequest - All fields optional for drafts (multipart/form-data)
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
  is_featured?: boolean;
  is_private?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

// ✅ CreateEventRequest - All fields required for published events (multipart/form-data)
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
  is_featured?: boolean;
  is_private?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

// ✅ UpdateEventRequest - All fields optional for updates (application/json)
export interface UpdateEventRequest {
  name?: string;
  display_name?: string;
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
  is_featured?: boolean;
  is_private?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: number;
}

// ✅ ListEventsParams - For listing events with filters
export interface ListEventsParams {
  account_id?: string;
  event_type_id?: string;
  event_status_id?: string;
  include_deleted?: boolean;
  only_deleted?: boolean;
  limit?: number;
  offset?: number;
}

// ✅ NEW: GetTrashedEventsParams - dedicated trash query
export interface GetTrashedEventsParams {
  account_id?: string;
  page?: number;
  page_size?: number;
}

// ✅ SearchEventsParams - For searching events
export interface SearchEventsParams {
  q?: string;
  account_id?: string;
  event_type_id?: string;
  include_deleted?: boolean;
  only_deleted?: boolean;
  page?: number;
  page_size?: number;
}

// ✅ GetEventsByTypeParams
export interface GetEventsByTypeParams {
  type: string;
  page?: number;
  page_size?: number;
}

// ✅ GetEventsByAccountParams
export interface GetEventsByAccountParams {
  accountId: string;
  page?: number;
  page_size?: number;
  include_deleted?: boolean;
}

// ✅ GetUpcomingEventsParams
export interface GetUpcomingEventsParams {
  limit?: number;
}

// ✅ GetPastEventsParams
export interface GetPastEventsParams {
  limit?: number;
}

// ✅ BulkIDsRequest - For bulk operations
export interface BulkIDsRequest {
  ids: string[];
}

// ✅ DuplicateEventRequest
export interface DuplicateEventRequest {
  name?: string;
  date?: string;
  is_draft?: boolean;
}

// ✅ BulkDuplicateRequest
export interface BulkDuplicateRequest {
  ids: string[];
  name_prefix?: string;
  date_offset_days?: number;
  is_draft?: boolean;
}

// ============================================================
// RESPONSE TYPES - ALL LOWERCASE
// ============================================================

// ✅ NEW: Creator information from accounts
export interface CreatorInfo {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  phone?: string;
  account_type: string;
  institution_name?: string;
}

export interface EventResponse {
  id: string;
  slug: string;
  name: string;
  display_name?: string;
  description?: string;
  event_type_id: string;
  event_status_id: string;
  image_url?: string;
  thumbnail_url?: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  certificate_price: number;
  location?: string;
  is_virtual: boolean;
  is_featured?: boolean;
  is_private?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees: number;
  current_attendees: number;
  account_id: string;
  created_by: string;
  is_active: boolean;
  deleted_at?: string | null;
  deleted_by?: string;
  restored_at?: string | null;
  restored_by?: string;
  created_at: string;
  updated_at: string;

   // ✅ NEW: Creator information (replaces raw created_by)
  creator: CreatorInfo;
}

export interface EventTypeResponse {
  id: string;
  name: string;
  display_name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface EventStatusResponse {
  id: string;
  name: string;
  display_name: string;
  slug: string;
  color?: string;
}

export interface MediaInfoResponse {
  id: string;
  url: string;
  media_type: string;
  entity_id: string;
  uploaded_by: string;
  created_at: string;
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

// ✅ Bulk operation results
export interface BulkDeleteResult {
  deleted_count: number;
  failed_ids?: string[];
  errors?: string[];
}

export interface BulkRestoreResult {
  restored_count: number;
  failed_ids?: string[];
  errors?: string[];
}

export interface BulkStatusResult {
  processed_count: number;
  failed_ids?: string[];
  errors?: string[];
}

export interface BulkDuplicateResult {
  duplicated_count: number;
  created_events: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  failed_ids?: string[];
  errors?: string[];
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
        params: {
          ...params,
          // ✅ Ensure only_deleted is passed as boolean
          only_deleted: params.only_deleted || undefined,
        },
      }),
      transformResponse: (response: any) => {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return {
            data: response.data.data.map(mapEventResponse),
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
            ...result.data.map(({ id }) => ({ type: 'Events' as const, id })),
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
        // ✅ Use the mapper
        const data = response?.data || response;
        return mapEventResponse(data);
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
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      providesTags: (result, error, slug) => [{ type: 'Events', id: `slug_${slug}` }],
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
          return response.data.map(mapEventResponse);
        }
        if (Array.isArray(response)) {
          return response.map(mapEventResponse);
        }
        return [];
      },
      providesTags: (result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          return [
            ...result.map(({ id }) => ({ type: 'Events' as const, id })),
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
          return response.data.map(mapEventResponse);
        }
        if (Array.isArray(response)) {
          return response.map(mapEventResponse);
        }
        return [];
      },
      providesTags: (result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          return [
            ...result.map(({ id }) => ({ type: 'Events' as const, id })),
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
          return response.data.map(mapEventType);
        }
        if (Array.isArray(response)) {
          return response.map(mapEventType);
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
          return response.data.map(mapEventStatus);
        }
        if (Array.isArray(response)) {
          return response.map(mapEventStatus);
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
        const mapped = mapPaginatedEvents(response);
        return {
          ...mapped,
          // Ensure the response format matches PaginatedEventsResponse
        };
      },
      providesTags: (result, error, { type }) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Events' as const, id })),
            { type: 'Events', id: `TYPE_${type}` },
          ];
        }
        return [{ type: 'Events', id: `TYPE_${type}` }];
      },
    }),

    // ✅ NEW: GET /api/v1/events?only_deleted=true - Get ONLY trashed events
   getTrashedEvents: builder.query<PaginatedEventsResponse, GetTrashedEventsParams>({
  query: ({ account_id, page = 1, page_size = 20 }) => ({
    url: '/events',
    method: 'GET',
    params: {
      account_id,
      only_deleted: true,
      limit: page_size,
      offset: (page - 1) * page_size,
    },
  }),
  transformResponse: (response: any) => {
    console.log('🔄 getTrashedEvents response:', response);
    return mapPaginatedEvents(response);
  },
  providesTags: (result) => {
    console.log('🏷️ getTrashedEvents providesTags:', result);
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      return [
        ...result.data.map(({ id }) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'TRASH' },
        'TrashCount',
      ];
    }
    return [{ type: 'Events', id: 'TRASH' }, 'TrashCount'];
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
        params: {
          ...params,
          only_deleted: params.only_deleted || undefined,
        },
      }),
      transformResponse: (response: any) => {
        return mapPaginatedEvents(response);
      },
      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Events' as const, id })),
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
      query: ({ accountId, page = 1, page_size = 20, include_deleted = false}) => ({
        url: `/accounts/${accountId}/events`,
        method: 'GET',
        params: { 
          page, 
          page_size,
          include_deleted,
        },
      }),
      transformResponse: (response: any) => {
        return mapPaginatedEvents(response);
      },
      providesTags: (result, error, { accountId }) => {
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Events' as const, id })),
            { type: 'Events', id: `ACCOUNT_${accountId}` },
          ];
        }
        return [{ type: 'Events', id: `ACCOUNT_${accountId}` }];
      },
    }),

    // ============================================================
    // PROTECTED ENDPOINTS - MUTATIONS
    // ============================================================

    // ✅ POST /api/v1/accounts/{accountId}/events/draft - Create draft
    createDraft: builder.mutation<EventResponse, { accountId: string; data: FormData }>({
      query: ({ accountId, data }) => ({
        url: `/accounts/${accountId}/events/draft`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
    // ✅ Use the mapper to convert uppercase fields to lowercase
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: `ACCOUNT_${accountId}` },
      ],
    }),

    // ✅ POST /api/v1/accounts/{accountId}/events - Create published event
    createEvent: builder.mutation<EventResponse, { accountId: string; data: FormData }>({
      query: ({ accountId, data }) => ({
        url: `/accounts/${accountId}/events`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: `ACCOUNT_${accountId}` },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ✅ PUT /api/v1/events/{id} - Update event
    updateEvent: builder.mutation<EventResponse, { id: string; data: UpdateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ✅ DELETE /api/v1/events/{id} - Soft delete event
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
        'TrashCount', 
      ],
    }),

    // ✅ NEW: DELETE /api/v1/events/{id}/permanent - Permanently delete event
    permanentlyDeleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
        'TrashCount', 
      ],
    }),

    // ✅ NEW: POST /api/v1/events/{id}/restore - Restore soft-deleted event
    restoreEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      // ✅ Important: Invalidate trash cache
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'TRASH' },  // ✅ This is the key!
        'TrashCount',
      ],
    }),

    // ✅ POST /api/v1/events/{id}/publish - Publish event
    publishEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, id) => [
      { type: 'Events', id },
      { type: 'Events', id: 'LIST' },
      { type: 'Events', id: 'UPCOMING' },
      { type: 'Events', id: 'PAST' },
      { type: 'Events', id: 'TRASH' },
      'TrashCount',
    ],
    }),

    // ✅ POST /api/v1/events/{id}/cancel - Cancel event
    cancelEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ✅ POST /api/v1/events/{id}/complete - Complete event
    completeEvent: builder.mutation<EventResponse, string>({
      query: (id) => ({
        url: `/events/${id}/complete`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    // ✅ NEW: POST /api/v1/events/{id}/duplicate - Duplicate single event
    duplicateEvent: builder.mutation<EventResponse, { id: string; data?: DuplicateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/${id}/duplicate`,
        method: 'POST',
        body: data || {},
      }),
      transformResponse: (response: any) => {
        const data = response?.data || response;
        return mapEventResponse(data);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: `ACCOUNT_${result?.account_id}` },
      ],
    }),

    // ✅ NEW: POST /api/v1/accounts/{accountId}/events/{eventId}/image - Upload event image
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
        // ✅ Use the mapper if the response contains event data
        const data = response?.data || response;
        // If it's a MediaInfoResponse, it might have different fields
        // Check if it has ID or id field
        if (data.ID || data.id) {
          return {
            id: data.id || data.ID || '',
            url: data.url || data.URL || '',
            media_type: data.media_type || data.MediaType || '',
            entity_id: data.entity_id || data.EntityID || '',
            uploaded_by: data.uploaded_by || data.UploadedBy || '',
            created_at: data.created_at || data.CreatedAt || '',
          };
        }
        return data;
  },
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),

    // ✅ NEW: POST /api/v1/accounts/{accountId}/events/{eventId}/certificate - Upload certificate
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

    // ✅ NEW: DELETE /api/v1/accounts/{accountId}/events/{eventId}/image - Delete event image
    deleteEventImage: builder.mutation<void, { accountId: string; eventId: string }>({
      query: ({ accountId, eventId }) => ({
        url: `/accounts/${accountId}/events/${eventId}/image`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),

    // ✅ NEW: DELETE /api/v1/accounts/{accountId}/events/{eventId}/certificate - Delete certificate
    deleteEventCertificate: builder.mutation<void, { accountId: string; eventId: string }>({
      query: ({ accountId, eventId }) => ({
        url: `/accounts/${accountId}/events/${eventId}/certificate`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),

    // ✅ NEW: DELETE /api/v1/accounts/{accountId}/events/{eventId}/media - Delete all media
    deleteAllEventMedia: builder.mutation<void, { accountId: string; eventId: string }>({
      query: ({ accountId, eventId }) => ({
        url: `/accounts/${accountId}/events/${eventId}/media`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }],
    }),

    // ✅ NEW: DELETE /api/v1/accounts/{accountId}/events/bulk/media - Bulk delete media
    bulkDeleteEventMedia: builder.mutation<
      BulkDeleteResult,
      { accountId: string; ids: string[] }
    >({
      query: ({ accountId, ids }) => ({
        url: `/accounts/${accountId}/events/bulk/media`,
        method: 'DELETE',
        body: { ids },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' }, 'TrashCount', 
      ],
    }),

    // ============================================================
    // BULK OPERATIONS - Events
    // ============================================================

    // ✅ FIXED: DELETE /api/v1/events/bulk - Bulk soft delete
    bulkDeleteEvents: builder.mutation<BulkDeleteResult, { ids: string[] }>({
        query: ({ ids }) => ({
          url: '/events/bulk',  // ✅ This is correct - should be /events/bulk
          method: 'DELETE',
          body: { ids },        // ✅ The body should be { ids: string[] }
        }),
        transformResponse: (response: any) => {
          if (response?.data) {
            return response.data;
          }
          return response;
        },
        invalidatesTags: (result, error, { ids }) => [
          ...ids.map((id) => ({ type: 'Events' as const, id })),
          { type: 'Events', id: 'LIST' },
          { type: 'Events', id: 'UPCOMING' },
          { type: 'Events', id: 'PAST' },
        ],
      }),

    // ✅ NEW: DELETE /api/v1/events/bulk/permanent - Bulk permanent delete
    bulkPermanentlyDeleteEvents: builder.mutation<BulkDeleteResult, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/events/bulk/permanent',
        method: 'DELETE',
        body: { ids },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    // ✅ NEW: POST /api/v1/events/bulk/restore - Bulk restore
   bulkRestoreEvents: builder.mutation<BulkRestoreResult, { ids: string[] }>({
    query: ({ ids }) => ({
      url: '/events/bulk/restore',
      method: 'POST',
      body: { ids },
    }),
    transformResponse: (response: any) => {
      // ✅ Fix: Map backend response (capitalized) to frontend types
      if (response?.data) {
        return {
          restored_count: response.data.RestoredCount || 0,
          failed_ids: response.data.FailedIDs || [],
          errors: response.data.Errors || [],
        };
      }
      return {
        restored_count: 0,
        failed_ids: [],
        errors: [],
      };
    },
      // ✅ Important: Invalidate trash cache
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'TRASH' },  // ✅ This is the key!
        'TrashCount',
      ],
    }),

    // ✅ NEW: POST /api/v1/events/bulk/publish - Bulk publish
    bulkPublishEvents: builder.mutation<BulkStatusResult, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/events/bulk/publish',
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ✅ NEW: POST /api/v1/events/bulk/cancel - Bulk cancel
    bulkCancelEvents: builder.mutation<BulkStatusResult, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/events/bulk/cancel',
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'UPCOMING' },
      ],
    }),

    // ✅ NEW: GET /api/v1/events?only_deleted=true&limit=1 - Get count of trashed events
      getTrashedEventsCount: builder.query<{ count: number }, { account_id: string }>({
        query: ({ account_id }) => ({
          url: '/events',
          method: 'GET',
          params: {
            account_id,
            only_deleted: true,
            limit: 1,
            offset: 0,
          },
        }),
        transformResponse: (response: any) => {
          console.log('🔍 Trash count response:', response);
          // The response structure is: { success: true, message: "...", data: { data: [], total: 24, ... } }
          return { count: response?.data?.total || 0 };
        },
        providesTags: ['TrashCount'],
      }),

    // ✅ NEW: POST /api/v1/events/bulk/complete - Bulk complete
    bulkCompleteEvents: builder.mutation<BulkStatusResult, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/events/bulk/complete',
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        ...ids.map((id) => ({ type: 'Events' as const, id })),
        { type: 'Events', id: 'LIST' },
        { type: 'Events', id: 'PAST' },
      ],
    }),

    // ✅ NEW: POST /api/v1/events/bulk/duplicate - Bulk duplicate
    bulkDuplicateEvents: builder.mutation<
      BulkDuplicateResult,
      { ids: string[]; name_prefix?: string; date_offset_days?: number; is_draft?: boolean }
    >({
      query: ({ ids, name_prefix, date_offset_days, is_draft }) => ({
        url: '/events/bulk/duplicate',
        method: 'POST',
        body: { ids, name_prefix, date_offset_days, is_draft },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { ids }) => [
        { type: 'Events', id: 'LIST' },
        ...(result?.created_events?.map((e: any) => ({ type: 'Events' as const, id: e.id })) || []),
      ],
    }),
  }),
});

// ============================================================
// EXPORT HOOKS - Queries
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

// ============================================================
// EXPORT HOOKS - Mutations
// ============================================================

// Protected endpoints - Mutations
export const {
  useCreateDraftMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePermanentlyDeleteEventMutation,
  useRestoreEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useCompleteEventMutation,
  useDuplicateEventMutation,
  useUploadEventImageMutation,
  useUploadCertificateTemplateMutation,
  useDeleteEventImageMutation,
  useDeleteEventCertificateMutation,
  useDeleteAllEventMediaMutation,
  useBulkDeleteEventMediaMutation,
  useBulkDeleteEventsMutation,
  useBulkPermanentlyDeleteEventsMutation,
  useBulkRestoreEventsMutation,
  useBulkPublishEventsMutation,
  useBulkCancelEventsMutation,
  useBulkCompleteEventsMutation,
  useGetTrashedEventsQuery,
  useGetTrashedEventsCountQuery,
  useBulkDuplicateEventsMutation,
} = eventsApi;