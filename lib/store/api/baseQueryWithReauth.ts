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

// ---------------------------------------------------------------------------
// Raw base query — one HTTP call, no refresh logic.
// ---------------------------------------------------------------------------
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include', // cookies travel automatically
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// ---------------------------------------------------------------------------
// Auth endpoints that must NEVER trigger a refresh-on-401 cycle.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Single-flight refresh: concurrent 401s share one /auth/refresh call.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<boolean> | null = null;

// RTK Query declares `extraOptions` as `{}` in BaseQueryFn's 4th generic.
// We mirror that here so the value can be passed straight through to
// rawBaseQuery without a cast.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type RtkExtraOptions = {};

async function runRefresh(
  api: BaseQueryApi,
  extraOptions: RtkExtraOptions,
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const result = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        return !('error' in result);
      } finally {
        // Allow the next 401 to trigger a fresh refresh.
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Reactive wrapper: on 401, refresh once and retry the original request.
// ---------------------------------------------------------------------------
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;

  // First attempt.
  let result = await rawBaseQuery(args, api, extraOptions);

  // Happy path.
  if (!('error' in result)) {
    return result;
  }

  const status = result.error?.status;

  // Only 401 triggers a refresh. 403 = authenticated but not allowed;
  // refreshing won't help.
  if (status !== 401) {
    return result;
  }

  // Don't refresh on auth endpoints — that's how you get infinite loops.
  if (isAuthEndpoint(url)) {
    return result;
  }

  // Attempt refresh (single-flight). If it fails, cookies are dead —
  // emit a signal so the auth slice can clear state. Navigation is the
  // router layer's job, not the base query's.
  const refreshed = await runRefresh(api, extraOptions);
  if (!refreshed) {
    api.dispatch({ type: 'auth/sessionExpired' });
    return result;
  }

  // Retry the original request exactly once with the fresh cookie.
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};