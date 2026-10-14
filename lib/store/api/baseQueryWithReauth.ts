// lib/store/api/baseQueryWithReauth.ts
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type BaseQueryApi,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { arg }) => {
    // Skip Content-Type for FormData so the browser can set the
    // multipart boundary itself.
    const isFormData =
      typeof arg === 'object' &&
      arg !== null &&
      'body' in arg &&
      (arg as { body?: unknown }).body instanceof FormData;

    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/refresh',
  '/auth/logout',
];

function isAuthEndpoint(url: string): boolean {
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    return NO_REFRESH_PATHS.some((p) => path.includes(p));
  } catch {
    return false;
  }
}

// Shared in-flight refresh promise. Concurrent 401s all await the
// same refresh call instead of firing N parallel refresh requests.
let refreshPromise: Promise<boolean> | null = null;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type RtkExtraOptions = {};

/**
 * Attempts POST /auth/refresh. Returns true when the refresh succeeded
 * (a fresh access_token cookie is now set), false otherwise.
 *
 * Deduplicates concurrent calls via refreshPromise. Additionally
 * retries once after a short delay to tolerate transient network
 * failures — a single blip should not log the user out.
 */
async function runRefresh(
  api: BaseQueryApi,
  extraOptions: RtkExtraOptions,
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        // First attempt.
        const first = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        if (!('error' in first)) return true;

        // Only retry on network-level errors (status FETCH_ERROR /
        // TIMEOUT_ERROR), never on 4xx. A 4xx means the refresh token
        // is genuinely invalid — retrying wastes a round trip.
        const status = first.error?.status;
        if (status !== 'FETCH_ERROR' && status !== 'TIMEOUT_ERROR') {
          return false;
        }

        // Wait briefly so we don't hammer a flapping server.
        await new Promise((r) => setTimeout(r, 400));

        const second = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        return !('error' in second);
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;

  let result = await rawBaseQuery(args, api, extraOptions);

  if (!('error' in result)) {
    return result;
  }

  const status = result.error?.status;

  if (status !== 401) {
    return result;
  }

  if (isAuthEndpoint(url)) {
    return result;
  }

  const refreshed = await runRefresh(api, extraOptions);
  if (!refreshed) {
    api.dispatch({ type: 'auth/sessionExpired' });
    return result;
  }

  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};