// lib/store/api/teamsApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './baseApi';
import type {
  Team,
  TeamsListResponse,
  TeamMember,
  TeamMemberListResponse,
  AddTeamMemberRequest,
  ListTeamMembersParams,
  UpdateTeamRequest,
} from '@/lib/types/team';
import type {
  Invitation,
  InvitationListResponse,
  InvitationValidationResponse,
  CreateInvitationRequest,
  ResendInvitationRequest,
  ListInvitationsParams,
  AcceptInvitationResponse,
} from '@/lib/types/invitation';

// ============================================================
// ENVELOPE
// ============================================================

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// ENDPOINTS
// ============================================================

export const teamsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------------------------------------
    // PUBLIC
    // ----------------------------------------------------------

    /** GET /teams/invitations/validate?token=... */
    validateInvitation: builder.query<InvitationValidationResponse, string>({
      query: (token) => ({
        url: '/teams/invitations/validate',
        params: { token },
      }),
      transformResponse: (
        response: Envelope<InvitationValidationResponse>,
      ) => response.data,
    }),

    // ----------------------------------------------------------
    // INVITATIONS — INVITEE SIDE
    // ----------------------------------------------------------

    /** POST /teams/invitations/accept?token=... */
    acceptInvitation: builder.mutation<AcceptInvitationResponse, string>({
      query: (token) => ({
        url: '/teams/invitations/accept',
        method: 'POST',
        params: { token },
      }),
      transformResponse: (response: Envelope<AcceptInvitationResponse>) =>
        response.data,
      invalidatesTags: ['Teams', 'Memberships', 'Invitations'],
    }),

    /** POST /teams/invitations/decline?token=... */
    declineInvitation: builder.mutation<void, string>({
      query: (token) => ({
        url: '/teams/invitations/decline',
        method: 'POST',
        params: { token },
      }),
      invalidatesTags: ['Invitations'],
    }),

    // ----------------------------------------------------------
    // TEAMS — CRUD
    // ----------------------------------------------------------

    /**
     * POST /teams — create a personal team under the given account.
     * Body: { name?, account_id }.
     * Backend wraps: data = { team: Team }.
     */
    createPersonalTeam: builder.mutation<
      Team,
      { accountId: string; data: { name?: string } }
    >({
      query: ({ accountId, data }) => ({
        url: '/teams/personal',
        method: 'POST',
        body: { ...data, account_id: accountId },
      }),
      transformResponse: (response: Envelope<{ team: Team }>) =>
        response.data.team,
      invalidatesTags: ['Teams'],
    }),

    /**
     * POST /teams — create an institution team under the given account.
     * Body: { name, display_name?, slug, account_id }.
     * Backend wraps: data = { team: Team }.
     */
   createInstitutionTeam: builder.mutation<
      Team,
      {
        accountId: string;
        data: { name: string; display_name?: string; slug: string };
      }
    >({
      query: ({ accountId, data }) => ({
        url: '/teams/institution',
        method: 'POST',
        body: { ...data, account_id: accountId },
      }),
      transformResponse: (response: Envelope<{ team: Team }>) =>
        response.data.team,
      invalidatesTags: ['Teams'],
    }),

    /** GET /teams — returns data = { teams, count } */
    getUserTeams: builder.query<
      TeamsListResponse,
      { accountId?: string } | void
    >({
      query: (arg) => {
        const accountId =
          arg && 'accountId' in arg ? arg.accountId : undefined;
        return {
          url: '/teams',
          params: accountId ? { account_id: accountId } : undefined,
        };
      },
      transformResponse: (response: Envelope<TeamsListResponse>) =>
        response.data,
      providesTags: (result) =>
        result?.teams
          ? [
              ...result.teams.map((t) => ({
                type: 'Teams' as const,
                id: t.id,
              })),
              { type: 'Teams' as const, id: 'LIST' },
            ]
          : [{ type: 'Teams' as const, id: 'LIST' }],
    }),

    /**
     * GET /teams/:id
     * Backend wraps: data = { team: Team }.
     */
    getTeam: builder.query<Team, string>({
      query: (teamId) => `/teams/${teamId}`,
      transformResponse: (response: Envelope<{ team: Team }>) =>
        response.data.team,
      providesTags: (_r, _e, teamId) => [{ type: 'Teams', id: teamId }],
    }),

    /**
     * PATCH /teams/:id
     * Backend wraps: data = { team: Team }.
     */
    updateTeam: builder.mutation<
      Team,
      { teamId: string; data: UpdateTeamRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: Envelope<{ team: Team }>) =>
        response.data.team,
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: 'Teams', id: teamId },
        { type: 'Teams', id: 'LIST' },
      ],
    }),

    /** DELETE /teams/:id */
    deleteTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/teams/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, teamId) => [
        { type: 'Teams', id: teamId },
        { type: 'Teams', id: 'LIST' },
      ],
    }),

    // ----------------------------------------------------------
    // TEAM MEMBERS
    // ----------------------------------------------------------

    /** GET /teams/:id/members — data = { members, total, limit, offset } */
    getTeamMembers: builder.query<
      TeamMemberListResponse,
      { teamId: string; params?: ListTeamMembersParams }
    >({
      query: ({ teamId, params }) => ({
        url: `/teams/${teamId}/members`,
        params: params
          ? {
              limit: params.limit,
              offset: params.offset,
              search: params.search,
            }
          : undefined,
      }),
      transformResponse: (response: Envelope<TeamMemberListResponse>) =>
        response.data,
      providesTags: (_r, _e, { teamId }) => [
        { type: 'Teams', id: `${teamId}:members` },
      ],
    }),

    /**
     * POST /teams/:id/members
     * Backend wraps: data = { member: TeamMember }.
     */
    addTeamMember: builder.mutation<
      TeamMember,
      { teamId: string; data: AddTeamMemberRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}/members`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Envelope<{ member: TeamMember }>) =>
        response.data.member,
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: 'Teams', id: `${teamId}:members` },
      ],
    }),

    /** DELETE /teams/:id/members/:userId */
    removeTeamMember: builder.mutation<
      void,
      { teamId: string; userId: string }
    >({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: 'Teams', id: `${teamId}:members` },
      ],
    }),

    /** POST /teams/:id/leave */
    leaveTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/teams/${teamId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Teams'],
    }),

    // ----------------------------------------------------------
    // TEAM INVITATIONS — ADMIN SIDE
    // ----------------------------------------------------------

    /**
     * POST /teams/:id/invitations
     * Backend wraps: data = { invitation: Invitation }.
     */
    inviteMember: builder.mutation<
      Invitation,
      { teamId: string; data: CreateInvitationRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}/invitations`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Envelope<{ invitation: Invitation }>) =>
        response.data.invitation,
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: 'Invitations', id: `${teamId}:list` },
      ],
    }),

    /**
     * GET /teams/:id/invitations
     * data = { invitations, total, limit, offset }
     */
    getTeamInvitations: builder.query<
      InvitationListResponse,
      { teamId: string; params?: ListInvitationsParams }
    >({
      query: ({ teamId, params }) => ({
        url: `/teams/${teamId}/invitations`,
        params: params
          ? {
              limit: params.limit,
              offset: params.offset,
              email: params.email,
              status: params.status,
            }
          : undefined,
      }),
      transformResponse: (response: Envelope<InvitationListResponse>) =>
        response.data,
      providesTags: (_r, _e, { teamId }) => [
        { type: 'Invitations', id: `${teamId}:list` },
      ],
    }),

    /**
     * POST /teams/:id/invitations/resend
     * Backend wraps: data = { invitation: Invitation }.
     */
    resendInvitation: builder.mutation<
      Invitation,
      { teamId: string; data: ResendInvitationRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}/invitations/resend`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Envelope<{ invitation: Invitation }>) =>
        response.data.invitation,
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: 'Invitations', id: `${teamId}:list` },
      ],
    }),
  }),
  overrideExisting: false,
});

// ============================================================
// HOOKS
// ============================================================

export const {
  // Public
  useValidateInvitationQuery,

  // Invitee side
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,

  // Teams
  useCreatePersonalTeamMutation,
  useCreateInstitutionTeamMutation,
  useGetUserTeamsQuery,
  useGetTeamQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,

  // Members
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useLeaveTeamMutation,

  // Invitations (admin)
  useInviteMemberMutation,
  useGetTeamInvitationsQuery,
  useResendInvitationMutation,
} = teamsApi;