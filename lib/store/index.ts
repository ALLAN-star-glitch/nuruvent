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
import themeReducer from './slices/themeSlice';

// ============================================================
// AUTH PERSISTENCE
// ============================================================

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'memberships', 'activeAccountId', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// ============================================================
// ROOT REDUCER
// ============================================================

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  theme: themeReducer,
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