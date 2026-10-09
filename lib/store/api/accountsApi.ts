// lib/store/api/accountsApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Account,
  AccountType,
  AccountMember,
  AccountLogoResponse,
  CreatePersonalAccountRequest,
  CreateInstitutionAccountRequest,
  UpdateAccountRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
} from '@/lib/types/account';
import { api } from './baseApi';


// ============================================================
// ENVELOPE
//
// Every account endpoint returns { success, message, data }.
// transformResponse unwraps it so hooks hand back the payload
// directly.
// ============================================================

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// ENDPOINTS
// ============================================================

export const accountsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------------------------------------
    // ACCOUNT TYPES (public catalog)
    // ----------------------------------------------------------

    /** GET /account-types */
    getAccountTypes: builder.query<AccountType[], void>({
      query: () => '/account-types',
      transformResponse: (response: Envelope<AccountType[]>) => response.data,
    }),

    /** GET /account-types/:id */
    getAccountTypeById: builder.query<AccountType, string>({
      query: (id) => `/account-types/${id}`,
      transformResponse: (response: Envelope<AccountType>) => response.data,
    }),

    /** GET /account-types/slug/:slug */
    getAccountTypeBySlug: builder.query<AccountType, string>({
      query: (slug) => `/account-types/slug/${slug}`,
      transformResponse: (response: Envelope<AccountType>) => response.data,
    }),

    // ----------------------------------------------------------
    // ACCOUNTS
    // ----------------------------------------------------------

    /** GET /accounts — accounts the caller belongs to */
    getMyAccounts: builder.query<Account[], void>({
      query: () => '/users/me/accounts',
      transformResponse: (response: Envelope<Account[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({
                type: 'Memberships' as const,
                id: a.id,
              })),
              { type: 'Memberships' as const, id: 'LIST' },
            ]
          : [{ type: 'Memberships' as const, id: 'LIST' }],
    }),

    /** GET /accounts/:id */
    getAccountById: builder.query<Account, string>({
      query: (id) => `/accounts/${id}`,
      transformResponse: (response: Envelope<Account>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Memberships', id }],
    }),

    /** GET /accounts/slug/:slug */
    getAccountBySlug: builder.query<Account, string>({
      query: (slug) => `/accounts/slug/${slug}`,
      transformResponse: (response: Envelope<Account>) => response.data,
      providesTags: (_r, _e, slug) => [
        { type: 'Memberships', id: `slug:${slug}` },
      ],
    }),

    /** POST /accounts/personal */
    createPersonalAccount: builder.mutation<
      Account,
      CreatePersonalAccountRequest
    >({
      query: (body) => ({
        url: '/accounts/personal',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Envelope<Account>) => response.data,
      invalidatesTags: [{ type: 'Memberships', id: 'LIST' }],
    }),

    /** POST /accounts/institution */
    createInstitutionAccount: builder.mutation<
      Account,
      CreateInstitutionAccountRequest
    >({
      query: (body) => ({
        url: '/accounts/institution',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Envelope<Account>) => response.data,
      invalidatesTags: [{ type: 'Memberships', id: 'LIST' }],
    }),

    /** PUT /accounts/:id */
    updateAccount: builder.mutation<
      Account,
      { id: string; data: UpdateAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: Envelope<Account>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Memberships', id },
        { type: 'Memberships', id: 'LIST' },
      ],
    }),

    /** DELETE /accounts/:id */
    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Memberships', id },
        { type: 'Memberships', id: 'LIST' },
      ],
    }),

    // ----------------------------------------------------------
    // ACCOUNT LOGO
    // ----------------------------------------------------------

    /**
     * POST /accounts/:id/logo
     * multipart/form-data, field name "logo".
     * Returns the updated Account (with new logo_url).
     */
    uploadAccountLogo: builder.mutation<
      AccountLogoResponse,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const form = new FormData();
        form.append('logo', file);
        return {
          url: `/accounts/${id}/logo`,
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (response: Envelope<AccountLogoResponse>) =>
        response.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Memberships', id }],
    }),

    /** DELETE /accounts/:id/logo */
    deleteAccountLogo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounts/${id}/logo`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Memberships', id }],
    }),

    // ----------------------------------------------------------
    // ACCOUNT MEMBERS
    // ----------------------------------------------------------

    /** GET /accounts/:id/members */
    getAccountMembers: builder.query<AccountMember[], string>({
      query: (accountId) => `/accounts/${accountId}/members`,
      transformResponse: (response: Envelope<AccountMember[]>) =>
        response.data,
      providesTags: (_r, _e, accountId) => [
        { type: 'Memberships', id: `${accountId}:members` },
      ],
    }),

    /** POST /accounts/:id/members */
    addAccountMember: builder.mutation<
      AccountMember,
      { accountId: string; data: AddMemberRequest }
    >({
      query: ({ accountId, data }) => ({
        url: `/accounts/${accountId}/members`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Envelope<AccountMember>) => response.data,
      invalidatesTags: (_r, _e, { accountId }) => [
        { type: 'Memberships', id: `${accountId}:members` },
      ],
    }),

    /** PUT /accounts/:id/members/:userId/role */
    updateAccountMemberRole: builder.mutation<
      AccountMember,
      { accountId: string; userId: string; data: UpdateMemberRoleRequest }
    >({
      query: ({ accountId, userId, data }) => ({
        url: `/accounts/${accountId}/members/${userId}/role`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: Envelope<AccountMember>) => response.data,
      invalidatesTags: (_r, _e, { accountId }) => [
        { type: 'Memberships', id: `${accountId}:members` },
      ],
    }),

    /** DELETE /accounts/:id/members/:userId */
    removeAccountMember: builder.mutation<
      void,
      { accountId: string; userId: string }
    >({
      query: ({ accountId, userId }) => ({
        url: `/accounts/${accountId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { accountId }) => [
        { type: 'Memberships', id: `${accountId}:members` },
      ],
    }),

    /** POST /accounts/:id/leave */
    leaveAccount: builder.mutation<void, string>({
      query: (accountId) => ({
        url: `/accounts/${accountId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, accountId) => [
        { type: 'Memberships', id: accountId },
        { type: 'Memberships', id: 'LIST' },
      ],
    }),

    // ----------------------------------------------------------
    // USER'S OWN ACCOUNTS (alias)
    // ----------------------------------------------------------

    /** GET /users/me/accounts */
    getMyAccountsViaUsers: builder.query<Account[], void>({
      query: () => '/users/me/accounts',
      transformResponse: (response: Envelope<Account[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({
                type: 'Memberships' as const,
                id: a.id,
              })),
              { type: 'Memberships' as const, id: 'LIST' },
            ]
          : [{ type: 'Memberships' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

// ============================================================
// HOOKS
// ============================================================

export const {
  // Account types
  useGetAccountTypesQuery,
  useGetAccountTypeByIdQuery,
  useGetAccountTypeBySlugQuery,

  // Accounts
  useGetMyAccountsQuery,
  useGetAccountByIdQuery,
  useGetAccountBySlugQuery,
  useCreatePersonalAccountMutation,
  useCreateInstitutionAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,

  // Logo
  useUploadAccountLogoMutation,
  useDeleteAccountLogoMutation,

  // Members
  useGetAccountMembersQuery,
  useAddAccountMemberMutation,
  useUpdateAccountMemberRoleMutation,
  useRemoveAccountMemberMutation,
  useLeaveAccountMutation,

  // User's own accounts (alias)
  useGetMyAccountsViaUsersQuery,
} = accountsApi;