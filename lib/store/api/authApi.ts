// lib/store/api/authApi.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './baseApi';
import type {
  // Requests
  RegisterPersonalRequest,
  RegisterInstitutionRequest,
  RegisterWithInvitationRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  LoginRequest,
  VerifyTwoFactorRequest,
  ForgotPasswordRequest,
  VerifyResetOTPRequest,
  // Responses
  RegisterResponse,
  RegisterWithInvitationResponse,
  AuthSuccessResponse,
  ResendOTPResponse,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ForgotPasswordResponse,
  VerifyResetOTPResponse,
} from '@/lib/types/auth';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================================
    // SELF-SERVICE REGISTRATION (OTP-based)
    // ============================================================

    /**
     * POST /api/v1/auth/register
     *
     * Starts a personal signup. The backend stores the pending
     * registration, sends an OTP, and returns the OTP metadata.
     * Complete the signup via `verifyOTP`.
     */
    registerPersonal: builder.mutation<
      RegisterResponse,
      RegisterPersonalRequest
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * POST /api/v1/auth/register
     *
     * Same endpoint as registerPersonal, different body — the backend
     * branches on `account_type`.
     */
    registerInstitution: builder.mutation<
      RegisterResponse,
      RegisterInstitutionRequest
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * POST /api/v1/auth/verify-otp
     *
     * Completes self-service registration. On success the backend sets
     * HTTP-only cookies and returns the full auth payload.
     */
    verifyOTP: builder.mutation<AuthSuccessResponse, VerifyOTPRequest>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth', 'Memberships'],
    }),

    /**
     * POST /api/v1/auth/resend-otp
     *
     * Resends an OTP for any purpose (registration, 2FA, password reset,
     * email change, phone change). `purpose` defaults to "registration"
     * on the backend if omitted.
     */
    resendOTP: builder.mutation<ResendOTPResponse, ResendOTPRequest>({
      query: (body) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: {
          email: body.email,
          purpose: body.purpose ?? 'registration',
        },
      }),
    }),

    // ============================================================
    // INVITATION REGISTRATION (no OTP)
    // ============================================================

    /**
     * POST /api/v1/auth/register-with-invitation
     *
     * Creates a user from an invitation token, accepts the invitation,
     * and issues auth tokens — all in one request. No OTP is sent.
     *
     * The invitee's email is read from the invitation record, not sent
     * by the client.
     */
    registerWithInvitation: builder.mutation<
      RegisterWithInvitationResponse,
      RegisterWithInvitationRequest
    >({
      query: (body) => ({
        url: '/auth/register-with-invitation',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth', 'Memberships', 'Teams', 'Invitations'],
    }),

    // ============================================================
    // LOGIN
    // ============================================================

    /**
     * POST /api/v1/auth/login
     *
     * Verifies credentials. Returns either a TwoFactorResponse (when 2FA
     * is enabled — the current default) or a full AuthResponse (if 2FA is
     * disabled in the future). Use `isTwoFactorResponse` / `isAuthResponse`
     * to narrow.
     *
     * On success with 2FA, no cookies are set yet — complete login via
     * `verifyTwoFactor`.
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * POST /api/v1/auth/verify-2fa
     *
     * Completes login. On success the backend sets HTTP-only cookies and
     * returns the full auth payload.
     */
    verifyTwoFactor: builder.mutation<AuthSuccessResponse, VerifyTwoFactorRequest>({
      query: (body) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth', 'Memberships'],
    }),

    // ============================================================
    // SESSION MANAGEMENT
    // ============================================================

    /**
     * POST /api/v1/auth/refresh
     *
     * Refreshes the access token using the refresh token cookie. The
     * backend reads the refresh token from the HTTP-only cookie; the
     * request body is empty.
     */
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    /**
     * POST /api/v1/auth/logout
     *
     * Revokes the refresh token and clears auth cookies.
     */
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Auth', 'Memberships', 'Teams', 'Invitations'],
    }),

    // ============================================================
    // PASSWORD RESET
    // ============================================================

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Initiates a password reset. The new password is validated and
     * stored server-side; an OTP is sent to the user's email to confirm
     * the reset via `verifyResetOTP`.
     */
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * POST /api/v1/auth/verify-reset-otp
     *
     * Verifies the reset OTP and applies the new password.
     */
    verifyResetOTP: builder.mutation<VerifyResetOTPResponse, VerifyResetOTPRequest>({
      query: (body) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body,
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
  useRegisterWithInvitationMutation,
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetOTPMutation,
} = authApi;