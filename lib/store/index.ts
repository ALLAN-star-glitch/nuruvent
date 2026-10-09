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
import workspaceReducer from './slices/workspaceSlice';

// ============================================================
// SIDE-EFFECT IMPORTS
//
// These register each module's endpoints with the shared `api`
// instance. Without these lines the corresponding hooks throw
// at runtime ("useXQuery is not a function").
// ============================================================
import './api/authApi';
import './api/accountsApi';
import './api/teamsApi';
import './api/profileApi';
import './api/eventsApi';
import './api/attendanceApi';  
import './api/registrationsApi';
import './api/paymentsApi';
import './api/videoApi';
// Add any remaining API modules you have in lib/store/api/.

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
// WORKSPACE PERSISTENCE
//
// The workspace slice holds the "last used" account + team so the
// /dashboard stub can route a returning user straight into their
// real dashboard.
// ============================================================

const workspacePersistConfig = {
  key: 'workspace',
  storage,
  whitelist: ['activeAccountId', 'activeTeamId'],
};

const persistedWorkspaceReducer = persistReducer(
  workspacePersistConfig,
  workspaceReducer,
);

// ============================================================
// ROOT REDUCER
// ============================================================

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  theme: themeReducer,
  workspace: persistedWorkspaceReducer,
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