// lib/store/api/certificatesApi.ts

import { IssueCertificatesResponse, IssueCertificatesRequest, CertificateListResponse, ListCertificatesParams, VerifyCertificateResponse, CertificateTemplateListResponse, CreateCertificateTemplateRequest, UpdateCertificateTemplateRequest } from '@/lib/types/certificates';
import { api } from './baseApi';
import type { BaseResponse, CertificateTemplate } from '@/lib/types/events';


export const certificatesApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // CERTIFICATE BATCH ISSUANCE (events module endpoint)
    // ============================================================

    /**
     * POST /events/:id/certificates/issue
     *
     * Starts a certificate batch for an event.
     *
     * Response has two shapes:
     *   - { type: "free", issued, reused, failed, attendee_count }
     *   - { type: "paid", order_id, amount_minor, currency, attendee_count }
     */
    issueCertificates: builder.mutation<
      BaseResponse<IssueCertificatesResponse>,
      { eventId: string; body: IssueCertificatesRequest }
    >({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}/certificates/issue`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'Certificates', id: `EVENT_${eventId}` },
        { type: 'Certificates', id: 'LIST' },
        { type: 'Orders', id: 'LIST' },
      ],
    }),

    // ============================================================
    // CERTIFICATE LISTING
    // ============================================================

    /** GET /me/certificates */
    getMyCertificates: builder.query<
      BaseResponse<CertificateListResponse>,
      ListCertificatesParams | void
    >({
      query: (params) => ({
        url: '/me/certificates',
        method: 'GET',
        params: {
          context_type: params?.context_type,
          context_id: params?.context_id,
          status: params?.status,
          from: params?.from,
          to: params?.to,
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
        },
      }),
      providesTags: (result) => {
        const base: { type: 'Certificates'; id: string }[] = [
          { type: 'Certificates', id: 'ME' },
        ];
        if (result?.data?.certificates) {
          return [
            ...base,
            ...result.data.certificates.map((c) => ({
              type: 'Certificates' as const,
              id: c.id,
            })),
          ];
        }
        return base;
      },
    }),

    /** GET /accounts/:id/certificates */
    listAccountCertificates: builder.query<
      BaseResponse<CertificateListResponse>,
      { accountId: string; params?: ListCertificatesParams }
    >({
      query: ({ accountId, params }) => ({
        url: `/accounts/${accountId}/certificates`,
        method: 'GET',
        params: {
          context_type: params?.context_type,
          context_id: params?.context_id,
          status: params?.status,
          from: params?.from,
          to: params?.to,
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
        },
      }),
      providesTags: (result, _e, { accountId }) => {
        const base: { type: 'Certificates'; id: string }[] = [
          { type: 'Certificates', id: `ACCOUNT_${accountId}` },
        ];
        if (result?.data?.certificates) {
          return [
            ...base,
            ...result.data.certificates.map((c) => ({
              type: 'Certificates' as const,
              id: c.id,
            })),
          ];
        }
        return base;
      },
    }),

    // ============================================================
    // VERIFICATION (public)
    // ============================================================

    /** GET /certificates/verify/:code */
    verifyCertificate: builder.query<
      BaseResponse<VerifyCertificateResponse>,
      string
    >({
      query: (code) => ({
        url: `/certificates/verify/${code}`,
        method: 'GET',
      }),
    }),

    // ============================================================
    // ACTIONS
    // ============================================================

    /**
     * POST /certificates/:id/send
     *
     * Re-sends the certificate email. Authorized for the recipient
     * and account admins.
     */
    sendCertificate: builder.mutation<BaseResponse<void>, string>({
      query: (certificateId) => ({
        url: `/certificates/${certificateId}/send`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Certificates', id }],
    }),

    /** POST /certificates/:id/revoke */
    revokeCertificate: builder.mutation<
      BaseResponse<void>,
      { certificateId: string; reason?: string }
    >({
      query: ({ certificateId, reason }) => ({
        url: `/certificates/${certificateId}/revoke`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { certificateId }) => [
        { type: 'Certificates', id: certificateId },
        { type: 'Certificates', id: 'LIST' },
      ],
    }),

    // ============================================================
    // TEMPLATES
    // ============================================================

    /** GET /certificate-templates?account_id=... */
    listCertificateTemplates: builder.query<
      BaseResponse<CertificateTemplateListResponse>,
      string
    >({
      query: (accountId) => ({
        url: '/certificate-templates',
        method: 'GET',
        params: { account_id: accountId },
      }),
      providesTags: (result, _e, accountId) => {
        const base: { type: 'CertificateTemplates'; id: string }[] = [
          { type: 'CertificateTemplates', id: `ACCOUNT_${accountId}` },
        ];
        if (result?.data?.templates) {
          return [
            ...base,
            ...result.data.templates.map((t) => ({
              type: 'CertificateTemplates' as const,
              id: t.id,
            })),
          ];
        }
        return base;
      },
    }),

    /** POST /certificate-templates */
    createCertificateTemplate: builder.mutation<
      BaseResponse<CertificateTemplate>,
      CreateCertificateTemplateRequest
    >({
      query: (body) => ({
        url: '/certificate-templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { account_id }) => [
        { type: 'CertificateTemplates', id: `ACCOUNT_${account_id}` },
      ],
    }),

    /** PUT /certificate-templates/:id */
    updateCertificateTemplate: builder.mutation<
      BaseResponse<CertificateTemplate>,
      { templateId: string; body: UpdateCertificateTemplateRequest }
    >({
      query: ({ templateId, body }) => ({
        url: `/certificate-templates/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { templateId }) => [
        { type: 'CertificateTemplates', id: templateId },
      ],
    }),

    /** DELETE /certificate-templates/:id */
    deleteCertificateTemplate: builder.mutation<
      BaseResponse<void>,
      string
    >({
      query: (templateId) => ({
        url: `/certificate-templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, templateId) => [
        { type: 'CertificateTemplates', id: templateId },
      ],
    }),

    /** POST /certificate-templates/:id/default */
    setDefaultCertificateTemplate: builder.mutation<
      BaseResponse<void>,
      string
    >({
      query: (templateId) => ({
        url: `/certificate-templates/${templateId}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['CertificateTemplates'],
    }),
  }),
});

// ============================================================
// HOOKS
// ============================================================

export const {
  // Batch issuance
  useIssueCertificatesMutation,

  // Listing
  useGetMyCertificatesQuery,
  useListAccountCertificatesQuery,
  useLazyGetMyCertificatesQuery,
  useLazyListAccountCertificatesQuery,

  // Verification
  useVerifyCertificateQuery,
  useLazyVerifyCertificateQuery,

  // Actions
  useSendCertificateMutation,
  useRevokeCertificateMutation,

  // Templates
  useListCertificateTemplatesQuery,
  useCreateCertificateTemplateMutation,
  useUpdateCertificateTemplateMutation,
  useDeleteCertificateTemplateMutation,
  useSetDefaultCertificateTemplateMutation,
} = certificatesApi;