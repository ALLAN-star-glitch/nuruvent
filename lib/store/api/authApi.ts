/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/store/api/authApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ============================================================
// BASE URL
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface AccountResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  account_type: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: TokenResponse & {
    account?: AccountResponse;
    institution?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      type: string;
    };
    email?: string;
    expires_at?: string;
    message?: string;
  };
}

export interface BaseResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ============================================================
// API SLICE
// ============================================================

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Auth'],
  endpoints: (builder) => ({
    // ============================================================
    // REGISTER
    // POST /api/v1/auth/register
    // ============================================================
    registerPersonal: builder.mutation<AuthResponse, RegisterPersonalRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    registerInstitution: builder.mutation<AuthResponse, RegisterInstitutionRequest>({
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
    verifyOTP: builder.mutation<AuthResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // RESEND OTP
    // POST /api/v1/auth/resend-otp
    // ============================================================
    resendOTP: builder.mutation<BaseResponse, ResendOTPRequest>({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // ============================================================
    // LOGIN
    // POST /api/v1/auth/login
    // ============================================================
    login: builder.mutation<BaseResponse, LoginRequest>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // ============================================================
    // VERIFY 2FA
    // POST /api/v1/auth/verify-2fa
    // ============================================================
    verifyTwoFactor: builder.mutation<AuthResponse, VerifyTwoFactorRequest>({
      query: (data) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // REFRESH TOKEN
    // POST /api/v1/auth/refresh
    // ============================================================
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    // ============================================================
    // LOGOUT
    // POST /api/v1/auth/logout
    // ============================================================
    logout: builder.mutation<BaseResponse, void>({
    query: () => ({
        url: '/auth/logout',
        method: 'POST',
        // No body needed - cookie handles the refresh token
    }),
    invalidatesTags: ['User', 'Auth'],
    }),

    // ============================================================
    // FORGOT PASSWORD
    // POST /api/v1/auth/forgot-password
    // ============================================================
    forgotPassword: builder.mutation<BaseResponse, ForgotPasswordRequest>({
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
    verifyResetOTP: builder.mutation<BaseResponse, VerifyResetOTPRequest>({
      query: (data) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
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