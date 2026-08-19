// lib/store/api/baseApi.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: any;
  err: unknown;
} {
  return action.type === REHYDRATE;
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      if (action.payload && action.payload[reducerPath]) {
        return action.payload[reducerPath];
      }
      if (action.key === 'api') {
        return action.payload;
      }
    }
    return undefined;
  },
  tagTypes: ['User', 'Auth', 'Events', 'EventTypes', 'EventStatuses'],
  endpoints: () => ({}),
});