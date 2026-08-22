/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/store/api/authApi.ts

import { api } from './baseApi';

// ============================================================
// REQUEST TYPES
// ============================================================

export interface RegisterPersonalRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  account_type: 'personal' | 'institution';
}

export interface RegisterInstitutionRequest extends RegisterPersonalRequest {
  institution_name: string;
  institution_email: string;
  institution_phone: string;
  institution_type: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyTwoFactorRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
  new_password: string;
}

export interface VerifyResetOTPRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
  purpose?: 'registration' | 'two_factor' | 'password_reset' | 'email_change' | 'phone_change';
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface AccountResponse {
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

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface OTPResponse {
  email: string;
  expires_at: string;
  message: string;
}

export interface TwoFactorResponse {
  requires_2fa: boolean;
  email: string;
  expires_in: number;
}

export interface PasswordResetResponse {
  message: string;
  expires_in: number;
}

export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginData {
  token: TokenResponse;
  account: AccountResponse;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData | TwoFactorResponse;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: TokenResponse & {
    account: AccountResponse;
    institution?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      type: string;
    };
  };
}

export interface VerifyTwoFactorResponse {
  success: boolean;
  message: string;
  data: TokenResponse & {
    account: AccountResponse;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expires_at: string;
    message: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: TokenResponse;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expires_at: string;
    message: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    expires_in: number;
  };
}

export interface VerifyResetOTPResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isTwoFactorResponse(data: any): data is TwoFactorResponse {
  return data && typeof data === 'object' && 'requires_2fa' in data && data.requires_2fa === true;
}

export function isLoginData(data: any): data is LoginData {
  return data && typeof data === 'object' && 'token' in data && 'account' in data;
}

export function isTokenResponse(data: LoginData | TwoFactorResponse): data is LoginData {
  return data && typeof data === 'object' && 'token' in data && 'account' in data;
}

// ============================================================
// ✅ NO localStorage - Tokens are handled by HTTP-only cookies
// ============================================================

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================================
    // REGISTER
    // POST /api/v1/auth/register
    // ============================================================
    registerPersonal: builder.mutation<RegisterResponse, RegisterPersonalRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    registerInstitution: builder.mutation<RegisterResponse, RegisterInstitutionRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // ============================================================
    // VERIFY OTP
    // POST /api/v1/auth/verify-otp
    // ============================================================
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      // ✅ Cookies are set automatically by backend
      // ✅ No localStorage needed
      invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // RESEND OTP
    // ============================================================
    resendOTP: builder.mutation<ResendOTPResponse, ResendOTPRequest>({
      query: (data) => {
        const payload = {
          email: data.email,
          purpose: data.purpose || 'registration',
        };
        return {
          url: '/auth/resend-otp',
          method: 'POST',
          body: payload,
        };
      },
    }),

    // ============================================================
    // LOGIN
    // POST /api/v1/auth/login
    // ============================================================
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      // ✅ Cookies are set automatically by backend
      invalidatesTags: ['Auth'],
    }),

    // ============================================================
    // VERIFY 2FA
    // POST /api/v1/auth/verify-2fa
    // ============================================================
    verifyTwoFactor: builder.mutation<VerifyTwoFactorResponse, VerifyTwoFactorRequest>({
      query: (data) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: data,
      }),
      // ✅ Cookies are set automatically by backend
      invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // REFRESH TOKEN
    // POST /api/v1/auth/refresh
    // ============================================================
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
      // ✅ Cookies are refreshed automatically
    }),

    // ============================================================
    // LOGOUT
    // POST /api/v1/auth/logout
    // ============================================================
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      // ✅ Cookies are cleared by backend
      invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // FORGOT PASSWORD
    // POST /api/v1/auth/forgot-password
    // ============================================================
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // ============================================================
    // VERIFY RESET OTP
    // POST /api/v1/auth/verify-reset-otp
    // ============================================================
    verifyResetOTP: builder.mutation<VerifyResetOTPResponse, VerifyResetOTPRequest>({
      query: (data) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

// ============================================================
// EXPORT HOOKS
// ============================================================

export const {
  useRegisterPersonalMutation,
  useRegisterInstitutionMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetOTPMutation,
} = authApi;