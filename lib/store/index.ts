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
import eventsReducer from './slices/eventsSlice';

// ✅ Auth persistence - user info only (tokens are in httpOnly cookies)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'account', 'isAuthenticated'], // ✅ Include account
};

// ✅ Events persistence - NONE (always fresh)
const eventsPersistConfig = {
  key: 'events',
  storage,
  whitelist: [], // ❌ Nothing persisted - always fresh events
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedEventsReducer = persistReducer(eventsPersistConfig, eventsReducer);

// ✅ Root reducer
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  events: persistedEventsReducer,
  [api.reducerPath]: api.reducer,
});

// ✅ Create store once
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

// ✅ Create persistor from the store
export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;