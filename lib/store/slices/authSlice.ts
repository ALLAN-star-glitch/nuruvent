// lib/store/slices/authSlice.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

// ============================================================
// TYPES
// ============================================================

export type UserRole = 
  | 'super_admin'     // Full platform access
  | 'admin'           // Platform management
  | 'account_admin'   // Full account management
  | 'event_manager'   // Manage events, certificates, attendees
  | 'team_member'     // View-only access
  | 'trainer'         // Individual trainer
  | 'guest';          // Unregistered user

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  account_type: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  otpEmail: string | null;
  registrationData: any | null;
  twoFactorEmail: string | null;
}

// ============================================================
// HELPERS
// ============================================================

const mapAccountTypeToRole = (accountType: string): UserRole => {
  switch (accountType) {
    case 'institution':
    case 'business':
      return 'account_admin';
    case 'personal':
      return 'guest';
    case 'admin':
      return 'admin';
    case 'trainer':
    case 'professional':
      return 'trainer';
    default:
      return 'guest';
  }
};

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  otpEmail: null,
  registrationData: null,
  twoFactorEmail: null,
};

// ============================================================
// SLICE
// ============================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOtpEmail: (state, action: PayloadAction<string>) => {
      state.otpEmail = action.payload;
    },
    setTwoFactorEmail: (state, action: PayloadAction<string | null>) => {
      state.twoFactorEmail = action.payload;
    },
    setRegistrationData: (state, action: PayloadAction<any>) => {
      state.registrationData = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpEmail = null;
      state.twoFactorEmail = null;
      state.registrationData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // REGISTER PERSONAL
      // ============================================================
      .addMatcher(authApi.endpoints.registerPersonal.matchFulfilled, (state, { payload }) => {
        state.otpEmail = payload.data?.email || null;
        state.registrationData = payload.data;
      })
      
      // ============================================================
      // REGISTER INSTITUTION
      // ============================================================
      .addMatcher(authApi.endpoints.registerInstitution.matchFulfilled, (state, { payload }) => {
        state.otpEmail = payload.data?.email || null;
        state.registrationData = payload.data;
      })
      
      // ============================================================
      // VERIFY OTP
      // ============================================================
      .addMatcher(authApi.endpoints.verifyOTP.matchFulfilled, (state, { payload }) => {
        const account = payload.data?.account;
        if (account) {
          state.isAuthenticated = true;
          state.user = {
            id: account.id,
            email: account.email,
            name: account.name,
            phone: account.phone,
            account_type: account.account_type,
            email_verified: account.email_verified,
            is_active: account.is_active,
            created_at: account.created_at,
            role: (account as any).role || mapAccountTypeToRole(account.account_type),
          };
          state.otpEmail = null;
          state.registrationData = null;
        }
      })
      
      // ============================================================
      // LOGIN
      // ============================================================
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.twoFactorEmail = payload.data?.email || null;
      })
      
      // ============================================================
      // VERIFY 2FA
      // ============================================================
      .addMatcher(authApi.endpoints.verifyTwoFactor.matchFulfilled, (state, { payload }) => {
        const account = payload.data?.account;
        if (account) {
          state.isAuthenticated = true;
          state.user = {
            id: account.id,
            email: account.email,
            name: account.name,
            phone: account.phone,
            account_type: account.account_type,
            email_verified: account.email_verified,
            is_active: account.is_active,
            created_at: account.created_at,
            role: (account as any).role || mapAccountTypeToRole(account.account_type),
          };
          state.twoFactorEmail = null;
        }
      })
      
      // ============================================================
      // LOGOUT
      // ============================================================
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.otpEmail = null;
        state.twoFactorEmail = null;
        state.registrationData = null;
      });
  },
});

// ============================================================
// EXPORTS
// ============================================================

export const { 
  setOtpEmail, 
  setTwoFactorEmail, 
  setRegistrationData, 
  setUser,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;