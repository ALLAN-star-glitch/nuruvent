// lib/types/account.ts

// ============================================================
// ACCOUNT
// ============================================================

export type AccountStatus = 'active' | 'suspended' | 'inactive';
export type AccountTypeSlug = 'personal' | 'institution';
export type KYCStatus =
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'not_required'
  | '';

/**
 * Mirrors backend AccountResponse exactly.
 *
 * Field notes:
 *   - `type` is the account category ("personal" | "institution").
 *   - `account_type_id` does NOT exist on the response — the backend
 *     returns `type` (slug-like string) instead. If you need the
 *     account type's UUID, fetch the catalog via /account-types.
 *   - `logo_url`, `phone`, `website`, etc. are omitempty — they may be
 *     missing from the JSON when empty. Type them as `string` and read
 *     with `?? ''` when needed.
 */
export interface Account {
  id: string;
  name: string;
  display_name: string;
  slug: string;
  type: AccountTypeSlug | string;   // backend sends "personal" or "institution"
  email: string;

  // omitempty — may be absent
  phone?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  country?: string;
  kyc_status?: KYCStatus;

  status: AccountStatus | string;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Compact shape for the header switcher.
 */
export type AccountSummary = Pick<
  Account,
  'id' | 'name' | 'display_name' | 'slug' | 'type' | 'logo_url' | 'is_active'
>;

// ============================================================
// REQUESTS
// ============================================================

export interface CreatePersonalAccountRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateInstitutionAccountRequest {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
}

export type AccountLogoResponse = Account;

// ============================================================
// ACCOUNT TYPE (catalog)
// ============================================================

/**
 * Mirrors backend AccountTypeResponse exactly.
 */
export interface AccountType {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
}

// ============================================================
// ACCOUNT MEMBER
// ============================================================

export type AccountRole = 'account_admin' | 'trainer' | 'learner';

/**
 * Mirrors backend MemberResponse exactly.
 *
 * Note: there is NO nested `user` object on this response. The
 * backend returns only IDs. If the UI needs names/emails for the
 * member list, either:
 *   (a) add fields to the backend response, or
 *   (b) resolve users client-side via a separate users endpoint.
 */
export interface AccountMember {
  id: string;
  account_id: string;
  user_id: string;
  role: AccountRole | string;
  is_active: boolean;
  joined_at: string;

  // Identity fields — populated by GET /accounts/:id/members.
  // May be absent on mutation responses (AddMember, UpdateMemberRole).
  name?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface AddMemberRequest {
  user_id: string;
  role: AccountRole;
}

export interface UpdateMemberRoleRequest {
  role: AccountRole;
}