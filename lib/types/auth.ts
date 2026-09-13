// lib/types/auth.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 1. ENUMS / UNIONS
// ============================================================

/**
 * Account type — describes how the user's record was created.
 * Mirrors backend `types.AccountType`.
 *
 * - `personal`:    self-service individual signup
 * - `institution`: self-service institution signup (admin)
 * - `invited`:     joined via a team invitation (server-assigned only)
 */
export type AccountType =
  | 'account_type_personal'
  | 'account_type_institution'
  | 'account_type_invited';

/**
 * Professional type — describes what kind of professional a personal
 * user is. Mirrors backend `types.ProfessionalType`.
 *
 * Only applies to `account_type_personal` users. Institution accounts
 * and invited users do not have a professional type.
 */
export type ProfessionalType =
  | 'professional_type_trainer'
  | 'professional_type_consultant'
  | 'professional_type_educator'
  | 'professional_type_student'
  | 'professional_type_other'; // ← this one doesn't exist, apparently

/**
 * Institution type — describes what kind of institution an
 * `account_type_institution` account is. Mirrors backend
 * `types.InstitutionType`.
 *
 * Only applies to `account_type_institution` accounts.
 */
export type InstitutionType =
  | 'institution_type_company'
  | 'institution_type_institute'
  | 'institution_type_association'
  | 'institution_type_school'
  | 'institution_type_university';

/**
 * Account-level role. Mirrors the `role` values stored in
 * `account_members.role` and emitted in the JWT.
 */
export type AccountRole = 'account_admin' | 'trainer';

/**
 * Platform-level role. Only present for Nuruvent staff accounts.
 * `null` for ordinary users.
 */
export type PlatformRole = 'super_admin' | 'admin' | null;

/**
 * Team kind. Mirrors `teams.type`.
 */
export type TeamType = 'personal' | 'institution';

/**
 * Where we are in the login state machine.
 */
export type LoginStep =
  | 'idle'
  | 'password'
  | 'two_factor'
  | 'authenticated';

/**
 * Purpose values for the unified OTP endpoint.
 */
export type OTPPurpose =
  | 'registration'
  | 'two_factor'
  | 'password_reset'
  | 'email_change'
  | 'phone_change';

// ============================================================
// 2. WIRE TYPES — exact mirrors of backend request/response DTOs
// ============================================================

// ----- Requests ---------------------------------------------------

/** POST /api/v1/auth/register (personal) */
export interface RegisterPersonalRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  account_type: 'account_type_personal';
  professional_type: ProfessionalType;
}

/** POST /api/v1/auth/register (institution) */
export interface RegisterInstitutionRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  account_type: 'account_type_institution';
  institution_name: string;
  institution_email: string;
  institution_phone: string;
  institution_type: InstitutionType;
}

/**
 * POST /api/v1/auth/register-with-invitation
 */
export interface RegisterWithInvitationRequest {
  token: string;
  name: string;
  password: string;
  phone?: string;
}

/** POST /api/v1/auth/verify-otp */
export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

/** POST /api/v1/auth/resend-otp */
export interface ResendOTPRequest {
  email: string;
  purpose?: OTPPurpose;
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/v1/auth/verify-2fa */
export interface VerifyTwoFactorRequest {
  email: string;
  otp: string;
}

/** POST /api/v1/auth/forgot-password */
export interface ForgotPasswordRequest {
  email: string;
  new_password: string;
}

/** POST /api/v1/auth/verify-reset-otp */
export interface VerifyResetOTPRequest {
  email: string;
  otp: string;
}

// ----- Responses --------------------------------------------------

/** Token pair returned by login / verify-otp / verify-2fa / refresh. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // "Bearer"
  expires_in: number; // seconds
}

/** Mirrors backend `UserResponse`. */
export interface UserResponse {
  id: string;
  slug: string;
  name: string;
  display_name?: string;
  email: string;
  phone: string;
  account_type: AccountType;
  account_type_id: string;
  professional_type_id?: string;
  professional_type?: string;
  email_verified: boolean;
  identity_verified: boolean;
  is_active: boolean;
  created_at: string; // RFC3339
  updated_at: string; // RFC3339
  institution_id?: string;
}

/** Mirrors backend `InstitutionResponse`. */
export interface InstitutionResponse {
  id: string;
  slug: string;
  name: string;
  display_name?: string;
  email: string;
  phone: string;
  description?: string;
  logo?: string;
  website?: string;
  is_active: boolean;
}

/**
 * Mirrors backend `AuthResponse`. The full auth payload returned by
 * verify-otp, verify-2fa, and register-with-invitation.
 */
export interface AuthResponse {
  token: TokenResponse;
  user: UserResponse;
  institution?: InstitutionResponse;
}

/** Response for POST /auth/register (OTP sent, no tokens yet). */
export interface OTPResponse {
  email: string;
  expires_at: string; // RFC3339
  message: string;
}

/**
 * Response for POST /auth/login when 2FA is required.
 */
export interface TwoFactorResponse {
  requires_2fa: true;
  email: string;
  expires_in: number; // seconds
}

/** Response for POST /auth/forgot-password. */
export interface PasswordResetResponse {
  message: string;
  expires_in: number; // seconds
}

// ----- Generic envelope -------------------------------------------

/**
 * The standard `{ success, message, data }` envelope the backend wraps
 * every response in.
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// 3. REFERENCE DATA — fetched from the backend, not hardcoded
// ============================================================
//
// These interfaces mirror the shape of the *_types endpoints
// (GET /account-types, GET /professional-types, GET /institution-types).

/** Mirrors a row from GET /api/v1/account-types. */
export interface AccountTypeRef {
  id: string;
  slug: string;         // "account-type-personal"
  name: AccountType;    // "account_type_personal"
  display_name: string; // "Personal Account"
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  /** Only true for types a client may pick during self-service signup. */
  is_self_service: boolean;
}

/** Mirrors a row from GET /api/v1/professional-types. */
export interface ProfessionalTypeRef {
  id: string;
  slug: string;           // "professional-type-trainer"
  name: ProfessionalType; // "professional_type_trainer"
  display_name: string;   // "Trainer"
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

/** Mirrors a row from GET /api/v1/institution-types. */
export interface InstitutionTypeRef {
  id: string;
  slug: string;           // "institution-type-company"
  name: InstitutionType;  // "institution_type_company"
  display_name: string;   // "Company"
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

// ============================================================
// 4. INTERNAL TYPES — normalized shapes the app uses in Redux
// ============================================================

export interface AuthUser {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  email: string;
  phone: string;
  accountType: AccountType;
  professionalType?: ProfessionalType;
  emailVerified: boolean;
  identityVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  account: Account;
  role: AccountRole;
}

export interface Account {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  accountType: AccountType;
}

export interface Team {
  id: string;
  accountId: string;
  name: string;
  displayName: string;
  slug: string;
  type: TeamType;
  isActive: boolean;
}

export interface WorkspaceContext {
  accountId: string;
  teamId: string;
  role: AccountRole;
  teamType: TeamType;
}

// ============================================================
// 5. DISCRIMINATED RESPONSES
// ============================================================

export type LoginResponse =
  | BaseResponse<TwoFactorResponse>
  | BaseResponse<AuthResponse>;

export type AuthSuccessResponse = BaseResponse<AuthResponse>;
export type RegisterResponse = BaseResponse<OTPResponse>;
export type RegisterWithInvitationResponse = BaseResponse<AuthResponse>;
export type ResendOTPResponse = BaseResponse<OTPResponse>;
export type RefreshTokenResponse = BaseResponse<TokenResponse>;
export type LogoutResponse = BaseResponse<null>;
export type ForgotPasswordResponse = BaseResponse<PasswordResetResponse>;
export type VerifyResetOTPResponse = BaseResponse<null>;

// ============================================================
// 6. TYPE GUARDS
// ============================================================

export function isTwoFactorResponse(
  payload: unknown,
): payload is BaseResponse<TwoFactorResponse> {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as BaseResponse<any>;
  return (
    !!p.data &&
    typeof p.data === 'object' &&
    (p.data as any).requires_2fa === true
  );
}

export function isAuthResponse(
  payload: unknown,
): payload is BaseResponse<AuthResponse> {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as BaseResponse<any>;
  return (
    !!p.data &&
    typeof p.data === 'object' &&
    typeof (p.data as any).token === 'object' &&
    typeof (p.data as any).user === 'object'
  );
}