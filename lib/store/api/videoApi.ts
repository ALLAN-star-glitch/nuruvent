// lib/store/api/videoApi.ts

import { api } from './baseApi';
import type {
  BaseResponse,
  ListConnectionsResponse,
  VideoConnectResponse,
  VideoPlatform,
} from '@/lib/types/events';

export const videoApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // CONNECTIONS
    // ============================================================

    /**
     * GET /video/connections — the caller's connections on all video
     * platforms (active and revoked).
     */
    listConnections: builder.query<
      BaseResponse<ListConnectionsResponse>,
      void
    >({
      query: () => ({
        url: '/video/connections',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data?.connections?.length
          ? [
              ...result.data.connections.map(({ platform }) => ({
                type: 'VideoConnections' as const,
                id: platform,
              })),
              { type: 'VideoConnections', id: 'LIST' },
            ]
          : [{ type: 'VideoConnections', id: 'LIST' }],
    }),

    /**
     * GET /video/oauth/:platform/connect — returns the platform's
     * authorize URL when the request sends `Accept: application/json`.
     *
     * IMPORTANT: The frontend must open the returned `authorize_url`
     * in a browser (popup or same-tab) to complete the OAuth flow. It
     * is not a redirect-following endpoint.
     *
     * Pass `return_url` to tell the backend where to send the user
     * after the flow completes.
     */
    beginConnect: builder.query<
      BaseResponse<VideoConnectResponse>,
      { platform: VideoPlatform; returnUrl?: string }
    >({
      query: ({ platform, returnUrl }) => ({
        url: `/video/oauth/${platform}/connect`,
        method: 'GET',
        params: returnUrl ? { return_url: returnUrl } : undefined,
        // The backend picks the response shape based on Accept header.
        // We always want JSON here.
        headers: { Accept: 'application/json' },
      }),
    }),

    /**
     * POST /video/connections/:platform/disconnect — revoke the
     * caller's active connection on the given platform. Idempotent:
     * returns success even if no active connection exists.
     */
    disconnect: builder.mutation<
      BaseResponse<void>,
      { platform: VideoPlatform }
    >({
      query: ({ platform }) => ({
        url: `/video/connections/${platform}/disconnect`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { platform }) => [
        { type: 'VideoConnections', id: platform },
        { type: 'VideoConnections', id: 'LIST' },
      ],
    }),
  }),
});

// ============================================================
// HOOKS
// ============================================================

export const {
  useListConnectionsQuery,
  useLazyBeginConnectQuery,
  useDisconnectMutation,
} = videoApi;