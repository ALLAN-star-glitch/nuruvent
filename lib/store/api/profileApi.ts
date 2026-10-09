// lib/store/api/profileApi.ts
import { api } from './baseApi';
import type {
  Profile,
  UpdateProfileRequest,
  PublicProfile,
  UserInfo,
} from '@/lib/types/profile';

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

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------------------------------------
    // SELF
    // ----------------------------------------------------------

    /** GET /users/me/profile */
    getMyProfile: builder.query<Profile, void>({
      query: () => '/users/me/profile',
      transformResponse: (response: Envelope<Profile>) => response.data,
      providesTags: ['Profile'],
    }),

    /** PUT /users/me/profile */
    updateMyProfile: builder.mutation<Profile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/me/profile',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Envelope<Profile>) => response.data,
      invalidatesTags: ['Profile'],
    }),

    // ----------------------------------------------------------
    // PUBLIC
    // ----------------------------------------------------------

    /** GET /users/:id/profile */
    getPublicProfile: builder.query<PublicProfile, string>({
      query: (userId) => `/users/${userId}/profile`,
      transformResponse: (response: Envelope<PublicProfile>) => response.data,
    }),

    /** GET /users/slug/:slug/profile */
    getPublicProfileBySlug: builder.query<PublicProfile, string>({
      query: (slug) => `/users/slug/${slug}/profile`,
      transformResponse: (response: Envelope<PublicProfile>) => response.data,
    }),

    // ----------------------------------------------------------
    // AVATAR
    // ----------------------------------------------------------

    /**
     * POST /users/me/avatar
     * multipart/form-data, field "avatar".
     * Response payload is UserInfo (wrapped in envelope).
     */
    uploadMyAvatar: builder.mutation<UserInfo, File>({
      query: (file) => {
        const form = new FormData();
        form.append('avatar', file);
        return {
          url: '/users/me/avatar',
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (response: Envelope<UserInfo>) => response.data,
      invalidatesTags: ['Profile', 'User'],
    }),

    /** DELETE /users/me/avatar */
    deleteMyAvatar: builder.mutation<void, void>({
      query: () => ({
        url: '/users/me/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
  }),
  overrideExisting: false,
});

// ============================================================
// HOOKS
// ============================================================

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetPublicProfileQuery,
  useGetPublicProfileBySlugQuery,
  useUploadMyAvatarMutation,
  useDeleteMyAvatarMutation,
} = profileApi;