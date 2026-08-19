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

// ✅ Auth persistence - ONLY user info (token is in httpOnly cookie)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // No token needed - it's in cookies!
};

// ✅ Events persistence - NONE
// Events data should always be fresh. Only UI preferences like page and page size
// are not persisted to ensure users always see the latest events.
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