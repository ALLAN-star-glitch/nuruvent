/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/store/api/baseApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Helper to check if action is a hydrate action
function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: any;
  err: unknown;
} {
  return action.type === REHYDRATE;
}

// Base query with credentials
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Create API with rehydration support
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      // When persisting the root reducer, return the API slice
      if (action.payload && action.payload[reducerPath]) {
        return action.payload[reducerPath];
      }
      // When persisting just the API reducer
      if (action.key === 'api') {
        return action.payload;
      }
    }
    return undefined;
  },
  tagTypes: ['User', 'Auth', 'Events'],
  endpoints: () => ({}),
});