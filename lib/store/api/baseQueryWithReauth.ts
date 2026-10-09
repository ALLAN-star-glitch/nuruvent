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

let refreshPromise: Promise<boolean> | null = null;

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