// lib/types/invitation.ts

import { TeamMember } from "./team";

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired';

/**
 * Full invitation record.
 * Consumed by:
 *   - POST /api/v1/teams/:id/invitations      (create)
 *   - GET  /api/v1/teams/:id/invitations      (list)
 *   - POST /api/v1/teams/:id/invitations/resend
 */
export interface Invitation {
  id: string;
  token: string;
  email: string;
  team_id: string;
  account_id: string;
  role: string;              // 'account_admin' | 'trainer'
  status: InvitationStatus;
  expires_at: string;
  invited_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationListResponse {
  invitations: Invitation[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateInvitationRequest {
  email: string;
  role: string;
}

export interface ResendInvitationRequest {
  invitation_id: string;
}

export interface ListInvitationsParams {
  limit?: number;
  offset?: number;
  email?: string;
  status?: InvitationStatus;
}

// ============================================================
// PUBLIC VALIDATION (no auth)
// ============================================================

/**
 * GET /api/v1/teams/invitations/validate?token=...
 * Public endpoint — no auth.
 */
export interface InvitationValidationResponse {
  valid: boolean;
  email: string;
  expires_at: string;
  invitation_id: string;
}

// ============================================================
// ACCEPT / DECLINE (auth required, invitee-side)
// ============================================================

/**
 * POST /api/v1/teams/invitations/accept?token=...
 * POST /api/v1/teams/invitations/decline?token=...
 * The token is passed as a query param, not a body.
 */
export interface AcceptInvitationResponse {
  member: TeamMember;
}