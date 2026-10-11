// lib/types/team.ts

// ============================================================
// TEAM
// ============================================================

export type TeamType = 'personal' | 'institution';

/**
 * Consumed by:
 *   - POST   /api/v1/teams
 *   - GET    /api/v1/teams
 *   - GET    /api/v1/teams/:id
 *   - PATCH  /api/v1/teams/:id
 *   - DELETE /api/v1/teams/:id
 *   - POST   /api/v1/teams/:id/leave
 */
export interface Team {
  id: string;
  account_id: string;
  name: string;
  display_name?: string;
  slug: string;
  type: TeamType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * GET /api/v1/teams — returns { teams, count } per the handler.
 */
export interface TeamsListResponse {
  teams: Team[];
  count: number;
}

/**
 * GET /api/v1/teams/:id — returns { team }.
 */
export interface TeamDetailResponse {
  team: Team;
}

/**
 * PATCH /api/v1/teams/:id — partial update.
 */
export interface UpdateTeamRequest {
  name?: string;
  display_name?: string;
}

// ============================================================
// TEAM MEMBERS
// ============================================================

/**
 * Consumed by:
 *   - GET    /api/v1/teams/:id/members
 *   - POST   /api/v1/teams/:id/members
 *   - DELETE /api/v1/teams/:id/members/:userId
 *   - POST   /api/v1/teams/:id/leave
 *
 * Identity fields (name, display_name, email, avatar_url) and the
 * account-level `role` are populated only by the enriched read path —
 * GET /teams/:id/members. Mutation responses (add member, accept
 * invitation) omit them.
 *
 * Roles are NOT team-scoped. The `role` here is the member's role in
 * the team's parent account.
 */
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;

  // ---- Enriched identity (read path only) ----
  name?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;

  // ---- Account-level role of this member (read path only) ----
  role?: string;

  /**
   * Legacy nested user shape.
   *
   * The backend does not currently return this; the enriched fields
   * above are the canonical source. This is retained so any code that
   * still reads `member.user` compiles during the transition. New
   * code should use the flat fields above.
   *
   * @deprecated Use the flat fields (name, display_name, email,
   * avatar_url) instead.
   */
  user?: {
    id: string;
    name: string;
    display_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
  limit: number;
  offset: number;
}

export interface AddTeamMemberRequest {
  user_id: string;
}

export interface ListTeamMembersParams {
  limit?: number;
  offset?: number;
  search?: string;
}