// lib/store/index.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { api } from './api/baseApi';
import authReducer from './slices/authSlice';

// ============================================================
// AUTH PERSISTENCE
// ============================================================
//
// Only user identity is persisted. Tokens live in HTTP-only cookies
// managed by the backend, so there is nothing sensitive in
// localStorage. The auth slice is small and its state is meaningful
// across page reloads (user info, memberships, active account).
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'memberships', 'activeAccountId', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// ============================================================
// ROOT REDUCER
// ============================================================
//
// Note: there is no `events` slice. All events state lives in
// RTK Query's cache (registered below as `api`). Event types,
// statuses, categories, ticket types, and event records are all
// queried and cached there. If you ever need a genuinely global
// events concept (e.g. "current event ID" shared across routes),
// add a tiny slice back rather than resurrecting the old one.
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  [api.reducerPath]: api.reducer,
});

// ============================================================
// STORE
// ============================================================

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// ============================================================
// TYPES
// ============================================================

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;