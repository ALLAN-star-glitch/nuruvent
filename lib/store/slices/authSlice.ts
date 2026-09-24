// lib/store/slices/authSlice.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import {
  isTwoFactorResponse,
  isAuthResponse,
  type AuthUser,
  type Membership,
  type AccountRole,
  type UserResponse,
  type AuthResponse,
  type ProfessionalType,
} from '@/lib/types/auth';


// ============================================================
// STATE
// ============================================================

export interface AuthState {
  /** The authenticated user, or null if not logged in. */
  user: AuthUser | null;

  /** All accounts the user belongs to, with their role in each. */
  memberships: Membership[];

  /** Which membership is currently active. Falls back to first on login. */
  activeAccountId: string | null;

  /** True once the user is fully authenticated. */
  isAuthenticated: boolean;

  // ---- Flow state (mid-flight) ----

  /** Where we are in the login/registration state machine. */
  loginStep:
    | 'idle'
    | 'registering'
    | 'verifying_registration'
    | 'password'
    | 'two_factor'
    | 'authenticated';

  /** Email awaiting OTP verification during self-service registration. */
  otpEmail: string | null;

  /** Email awaiting 2FA verification during login. */
  twoFactorEmail: string | null;

  /** True once redux-persist has rehydrated. */
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  memberships: [],
  activeAccountId: null,
  isAuthenticated: false,
  loginStep: 'idle',
  otpEmail: null,
  twoFactorEmail: null,
  isHydrated: false,
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Side-effect: mark the browser session as "just started" so the welcome
 * modal shows once. Called on successful login/registration.
 */
function setNewSessionFlag() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('new_session', 'true');
  }
}

/**
 * Map a wire `UserResponse` to the internal `AuthUser`.
 *
 * Kept next to the slice because it is a storage concern: the slice owns
 * the shape it stores. If the storage shape changes, only this function
 * changes — the API layer and types file are untouched.
 */
function toAuthUser(u: UserResponse): AuthUser {
  return {
    id: u.id,
    slug: u.slug,
    name: u.name,
    displayName: u.display_name || u.name,
    email: u.email,
    phone: u.phone,
    accountType: u.account_type,
    professionalType: (u.professional_type as ProfessionalType) || undefined,
    emailVerified: u.email_verified,
    identityVerified: u.identity_verified,
    isActive: u.is_active,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

/**
 * Populate the slice from an AuthResponse.
 *
 * Called from verifyOTP, verifyTwoFactor, and registerWithInvitation —
 * all three return the same shape.
 */
function applyAuthResponse(state: AuthState, data: AuthResponse) {
  state.user = toAuthUser(data.user);
  state.isAuthenticated = true;
  state.loginStep = 'authenticated';
  state.otpEmail = null;
  state.twoFactorEmail = null;

  // Memberships are not part of the current AuthResponse shape.
  // They'll be populated by a follow-up fetch (GET /users/me/accounts)
  // in a separate matcher, or inlined here if the backend adds them.
  //
  // For now: leave memberships as-is so the persist layer retains
  // whatever was fetched on the previous session, and let the
  // membership query refresh it.
  if (state.activeAccountId === null && state.memberships.length > 0) {
    state.activeAccountId = state.memberships[0].account.id;
  }

  setNewSessionFlag();
}

/**
 * Clear all auth state. Shared by logout, and by any 401 handler that
 * decides to force a re-login.
 */
function resetAuthState(state: AuthState) {
  state.user = null;
  state.memberships = [];
  state.activeAccountId = null;
  state.isAuthenticated = false;
  state.loginStep = 'idle';
  state.otpEmail = null;
  state.twoFactorEmail = null;
  // Note: isHydrated is intentionally NOT reset — the app is still
  // hydrated after a logout.
}

// ============================================================
// SLICE
// ============================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ---- Flow control ----

    setOtpEmail(state, action: PayloadAction<string | null>) {
      state.otpEmail = action.payload;
    },

    setTwoFactorEmail(state, action: PayloadAction<string | null>) {
      state.twoFactorEmail = action.payload;
      state.loginStep = action.payload ? 'two_factor' : 'idle';
    },

    setLoginStep(state, action: PayloadAction<AuthState['loginStep']>) {
      state.loginStep = action.payload;
    },

    // ---- Session ----

    /**
     * Replace the current user. Useful after a profile update.
     * Does not touch memberships.
     */
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loginStep = 'authenticated';
    },

    /** Replace the full memberships list (e.g. after a refetch). */
    setMemberships(state, action: PayloadAction<Membership[]>) {
      state.memberships = action.payload;
      // If the currently active account disappeared from the list
      // (e.g. the user left it), fall back to the first available.
      if (
        state.activeAccountId &&
        !action.payload.some((m) => m.account.id === state.activeAccountId)
      ) {
        state.activeAccountId = action.payload[0]?.account.id ?? null;
      } else if (!state.activeAccountId && action.payload.length > 0) {
        state.activeAccountId = action.payload[0].account.id;
      }
    },

    /** Switch the active account. No-op if the account isn't a membership. */
    switchAccount(state, action: PayloadAction<string>) {
      const exists = state.memberships.some(
        (m) => m.account.id === action.payload,
      );
      if (exists) {
        state.activeAccountId = action.payload;
      }
    },

    // ---- Lifecycle ----

    /** Called after redux-persist finishes rehydrating. */
    hydrateAuth(state) {
      state.isHydrated = true;
    },

    /** Force-clear all auth state. Used by logout and 401 handlers. */
    clearAuth(state) {
      resetAuthState(state);
    },
  },

  extraReducers: (builder) => {
    builder
      // ============================================================
      // SELF-SERVICE REGISTRATION
      // ============================================================

      // POST /auth/register (personal or institution — same endpoint)
      .addMatcher(
        authApi.endpoints.registerPersonal.matchFulfilled,
        (state, { payload }) => {
          state.otpEmail = payload.data?.email ?? null;
          state.loginStep = 'verifying_registration';
        },
      )
      .addMatcher(
        authApi.endpoints.registerInstitution.matchFulfilled,
        (state, { payload }) => {
          state.otpEmail = payload.data?.email ?? null;
          state.loginStep = 'verifying_registration';
        },
      )

      // POST /auth/verify-otp — completes self-service registration
      .addMatcher(
        authApi.endpoints.verifyOTP.matchFulfilled,
        (state, { payload }) => {
          if (!isAuthResponse(payload)) return;
          applyAuthResponse(state, payload.data);
        },
      )

      // POST /auth/resend-otp — refresh the pending email
      .addMatcher(
        authApi.endpoints.resendOTP.matchFulfilled,
        (state, { payload }) => {
          if (payload.data?.email) {
            state.otpEmail = payload.data.email;
          }
        },
      )

      // ============================================================
      // INVITATION REGISTRATION (no OTP)
      // ============================================================

      // POST /auth/register-with-invitation
      .addMatcher(
        authApi.endpoints.registerWithInvitation.matchFulfilled,
        (state, { payload }) => {
          if (!isAuthResponse(payload)) return;
          applyAuthResponse(state, payload.data);
        },
      )

      // ============================================================
      // LOGIN
      // ============================================================

      // POST /auth/login — either 2FA-required or (future) full auth
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          if (isTwoFactorResponse(payload)) {
            state.twoFactorEmail = payload.data.email;
            state.loginStep = 'two_factor';
            return;
          }
          if (isAuthResponse(payload)) {
            applyAuthResponse(state, payload.data);
            return;
          }
          // Unknown shape — stay idle. Should not happen.
          state.loginStep = 'idle';
        },
      )

      // POST /auth/verify-2fa — completes login
      .addMatcher(
        authApi.endpoints.verifyTwoFactor.matchFulfilled,
        (state, { payload }) => {
          if (!isAuthResponse(payload)) return;
          applyAuthResponse(state, payload.data);
        },
      )

      // ============================================================
      // LOGOUT
      // ============================================================

      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        resetAuthState(state);
      })

      // If the logout call fails (network, expired token), still clear
      // the local state — the user pressed "log out", honor it.
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        resetAuthState(state);
      });
  },
});

// ============================================================
// EXPORTS
// ============================================================

export const {
  setOtpEmail,
  setTwoFactorEmail,
  setLoginStep,
  setUser,
  setMemberships,
  switchAccount,
  hydrateAuth,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;

// ============================================================
// SELECTORS
// ============================================================

import type { RootState } from '../index';

export const selectUser = (state: RootState) => state.auth.user;
export const selectMemberships = (state: RootState) => state.auth.memberships;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectLoginStep = (state: RootState) => state.auth.loginStep;
export const selectOtpEmail = (state: RootState) => state.auth.otpEmail;
export const selectTwoFactorEmail = (state: RootState) => state.auth.twoFactorEmail;
export const selectIsHydrated = (state: RootState) => state.auth.isHydrated;

/** The currently active membership, or null. */
export const selectActiveMembership = (state: RootState): Membership | null => {
  const { activeAccountId, memberships } = state.auth;
  if (!activeAccountId) return null;
  return memberships.find((m) => m.account.id === activeAccountId) ?? null;
};

/** The role the user holds in the active account, or null. */
export const selectActiveRole = (state: RootState): AccountRole | null => {
  return selectActiveMembership(state)?.role ?? null;
};

/** The active account, or null. */
export const selectActiveAccount = (state: RootState) =>
  selectActiveMembership(state)?.account ?? null;