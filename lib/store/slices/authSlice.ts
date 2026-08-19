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
  account_type_id: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

// ✅ Account interface - from login response
export interface Account {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  account_type: string;
  account_type_id: string;
  email_verified: boolean;
  identity_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  account: Account | null;  // ✅ Added account object
  isAuthenticated: boolean;
  otpEmail: string | null;
  registrationData: any | null;
  twoFactorEmail: string | null;
  loginStep: 'idle' | 'password' | 'two_factor' | 'authenticated';
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
  account: null,  // ✅ Initialize account as null
  isAuthenticated: false,
  otpEmail: null,
  registrationData: null,
  twoFactorEmail: null,
  loginStep: 'idle',
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
      if (action.payload) {
        state.loginStep = 'two_factor';
      } else {
        state.loginStep = 'idle';
      }
    },
    setRegistrationData: (state, action: PayloadAction<any>) => {
      state.registrationData = action.payload;
    },
    setUser: (state, action: PayloadAction<{ user: User; account?: Account }>) => {
      state.user = action.payload.user;
      if (action.payload.account) {
        state.account = action.payload.account;
      }
      state.isAuthenticated = true;
      state.loginStep = 'authenticated';
    },
    setAccount: (state, action: PayloadAction<Account>) => {
      state.account = action.payload;
    },
    setLoginStep: (state, action: PayloadAction<AuthState['loginStep']>) => {
      state.loginStep = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.account = null;  // ✅ Clear account on logout
      state.isAuthenticated = false;
      state.otpEmail = null;
      state.twoFactorEmail = null;
      state.registrationData = null;
      state.loginStep = 'idle';
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
        state.loginStep = 'idle';
      })
      
      // ============================================================
      // REGISTER INSTITUTION
      // ============================================================
      .addMatcher(authApi.endpoints.registerInstitution.matchFulfilled, (state, { payload }) => {
        state.otpEmail = payload.data?.email || null;
        state.registrationData = payload.data;
        state.loginStep = 'idle';
      })
      
      // ============================================================
      // VERIFY OTP - Complete Registration
      // ============================================================
      .addMatcher(authApi.endpoints.verifyOTP.matchFulfilled, (state, { payload }) => {
        const account = payload.data?.account;
        if (account) {
          state.isAuthenticated = true;
          state.account = account;  // ✅ Store the account
          state.user = {
            id: account.id,
            email: account.email,
            name: account.name,
            phone: account.phone,
            account_type: account.account_type || '',
            account_type_id: account.account_type_id || '',
            email_verified: account.email_verified,
            is_active: account.is_active,
            created_at: account.created_at,
            updated_at: account.updated_at || account.created_at,
            role: (account as any).role || mapAccountTypeToRole(account.account_type),
          };
          state.otpEmail = null;
          state.registrationData = null;
          state.loginStep = 'authenticated';
        }
      })
      
      // ============================================================
      // LOGIN - Check if 2FA is required
      // ============================================================
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        const data = payload.data as any;
        
        // ✅ Check if account is in the response (direct login)
        if (data?.account) {
          state.isAuthenticated = true;
          state.account = data.account;  // ✅ Store the account
          state.user = {
            id: data.account.id,
            email: data.account.email,
            name: data.account.name,
            phone: data.account.phone,
            account_type: data.account.account_type || '',
            account_type_id: data.account.account_type_id || '',
            email_verified: data.account.email_verified,
            is_active: data.account.is_active,
            created_at: data.account.created_at,
            updated_at: data.account.updated_at || data.account.created_at,
            role: 'account_admin', // Default role for logged in user
          };
          state.loginStep = 'authenticated';
          state.twoFactorEmail = null;
        } 
        // ✅ Check if 2FA is required
        else if (data?.requires_2fa === true) {
          state.twoFactorEmail = data.email || null;
          state.loginStep = 'two_factor';
        } 
        // ✅ Fallback - check for token
        else if (data?.access_token) {
          state.isAuthenticated = true;
          state.loginStep = 'authenticated';
        } 
        // Neither 2FA nor token - something else
        else {
          state.loginStep = 'idle';
        }
      })
      
      // ============================================================
      // VERIFY 2FA - Complete Login
      // ============================================================
      .addMatcher(authApi.endpoints.verifyTwoFactor.matchFulfilled, (state, { payload }) => {
        const account = payload.data?.account;
        if (account) {
          state.isAuthenticated = true;
          state.account = account;  // ✅ Store the account
          state.user = {
            id: account.id,
            email: account.email,
            name: account.name,
            phone: account.phone,
            account_type: account.account_type || '',
            account_type_id: account.account_type_id || '',
            email_verified: account.email_verified,
            is_active: account.is_active,
            created_at: account.created_at,
            updated_at: account.updated_at || account.created_at,
            role: (account as any).role || mapAccountTypeToRole(account.account_type),
          };
          state.twoFactorEmail = null;
          state.loginStep = 'authenticated';
        }
      })
      
      // ============================================================
      // RESEND OTP - Keep state
      // ============================================================
      .addMatcher(authApi.endpoints.resendOTP.matchFulfilled, (state, { payload }) => {
        if (payload.data?.email) {
          state.otpEmail = payload.data.email;
        }
      })
      
      // ============================================================
      // LOGOUT
      // ============================================================
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.account = null;  // ✅ Clear account on logout
        state.isAuthenticated = false;
        state.otpEmail = null;
        state.twoFactorEmail = null;
        state.registrationData = null;
        state.loginStep = 'idle';
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
  setAccount,
  setLoginStep,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;