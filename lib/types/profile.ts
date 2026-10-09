// lib/types/profile.ts

// ============================================================
// USER INFO
// ============================================================

/**
 * The reduced identity shape returned when a user is embedded
 * inside another resource (e.g. inside an AccountMember).
 *
 * Consumed by GET /api/v1/users/me/accounts etc.
 */
export interface UserInfo {
  id: string;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

// ============================================================
// FULL PROFILE (self)
// ============================================================

/**
 * Consumed by:
 *   - GET /api/v1/users/me/profile
 *   - PUT /api/v1/users/me/profile
 *   - POST /api/v1/users/me/avatar (returns updated profile)
 *   - DELETE /api/v1/users/me/avatar
 *
 * Mirrors backend ProfileResponse exactly.
 */
export interface Profile {
  id: string;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  social_links: Record<string, string>;
}

/**
 * Partial update. Every field is optional; nil/undefined means
 * "leave unchanged". Mirrors backend UpdateProfileRequest.
 */
export interface UpdateProfileRequest {
  display_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
}

// ============================================================
// PUBLIC PROFILE (someone else's)
// ============================================================

/**
 * Reduced profile shown to other users.
 * Consumed by:
 *   - GET /api/v1/users/:id/profile
 *   - GET /api/v1/users/slug/:slug/profile
 */
export interface PublicProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  social_links: Record<string, string>;
}

// ============================================================
// AVATAR UPLOAD
// ============================================================

/**
 * POST /api/v1/users/me/avatar — multipart/form-data
 * Field name: "avatar"
 * Response: updated UserInfo
 */
export interface UploadAvatarResult {
  user: UserInfo;
}