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
 * Note: roles are NOT on team members — they inherit from the
 * account membership (see backend doc comments).
 */
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  is_active: boolean;

  // Denormalized user shape returned by the backend.
  // VERIFY field names against your team MemberResponse DTO.
  user?: {
    id: string;
    name: string;
    display_name: string;
    email: string;
    avatar_url: string;
  };

  joined_at: string;
  created_at: string;
  updated_at: string;
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