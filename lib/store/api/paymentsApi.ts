// lib/store/api/paymentsApi.ts

import {
  CreateOrderRequest,
  InitiatePaymentRequest,
  Order,
  Payment,
  RefundRequest,
  PaymentListResponse,
  ListPaymentsParams,
  PaymentStats,
} from '@/lib/types/payments';
import { api } from './baseApi';
import type { BaseResponse } from '@/lib/types/events';

export const paymentsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================================
    // ORDERS
    // ============================================================

    /** POST /orders */
    createOrder: builder.mutation<
      BaseResponse<Order>,
      CreateOrderRequest
    >({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { registration_id }) => [
        { type: 'Orders', id: `REG_${registration_id}` },
      ],
    }),

    /** GET /orders/:id */
    getOrder: builder.query<BaseResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),

    // ============================================================
    // PAYMENTS
    // ============================================================

    /** POST /payments/initiate */
    initiatePayment: builder.mutation<
      BaseResponse<Payment>,
      InitiatePaymentRequest
    >({
      query: (body) => ({
        url: '/payments/initiate',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { order_id }) => [
        { type: 'Payments', id: `ORDER_${order_id}` },
      ],
    }),

    /** GET /payments/:id */
    getPayment: builder.query<BaseResponse<Payment>, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: 'Payments', id }],
    }),

    /** POST /payments/:id/refund */
    refundPayment: builder.mutation<
      BaseResponse<void>,
      { paymentId: string; body: RefundRequest }
    >({
      query: ({ paymentId, body }) => ({
        url: `/payments/${paymentId}/refund`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { paymentId }) => [
        { type: 'Payments', id: paymentId },
      ],
    }),

    // ============================================================
    // LEDGER — cross-event payment list for the active account
    // ============================================================

    /**
     * GET /payments
     *
     * Returns a paginated ledger of payments scoped to the caller's
     * active account (JWT's active_account_id). Every fee amount is
     * computed on the backend using the rates snapshotted at order
     * creation (platform) and payment initiation (processing).
     */
    listPayments: builder.query<
      BaseResponse<PaymentListResponse>,
      ListPaymentsParams | void
    >({
      query: (params) => ({
        url: '/payments',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
          search: params?.search,
          status: params?.status,
          method: params?.method,
          event_id: params?.event_id,
          sort_by: params?.sort_by,
          sort_order: params?.sort_order,
          date_from: params?.date_from,
          date_to: params?.date_to,
        },
      }),
      providesTags: (result) =>
        result?.data?.payments
          ? [
              ...result.data.payments.map((p) => ({
                type: 'Payments' as const,
                id: p.id,
              })),
              { type: 'Payments' as const, id: 'LIST' },
            ]
          : [{ type: 'Payments' as const, id: 'LIST' }],
    }),

    /**
     * GET /payments/stats
     *
     * Aggregate summary for the caller's active account. Same filters
     * as listPayments minus pagination and search. Returns gross
     * revenue, platform fee total, processing fee total, and net.
     */
    getPaymentStats: builder.query<
      BaseResponse<PaymentStats>,
      { event_id?: string; date_from?: string; date_to?: string } | void
    >({
      query: (params) => ({
        url: '/payments/stats',
        method: 'GET',
        params: {
          event_id: params?.event_id,
          date_from: params?.date_from,
          date_to: params?.date_to,
        },
      }),
      providesTags: [{ type: 'Payments', id: 'STATS' }],
    }),
  }),
});

// ============================================================
// HOOKS
// ============================================================

export const {
  // Orders
  useCreateOrderMutation,
  useGetOrderQuery,

  // Payments — single
  useInitiatePaymentMutation,
  useGetPaymentQuery,
  useRefundPaymentMutation,

  // Payments — ledger
  useListPaymentsQuery,
  useGetPaymentStatsQuery,
} = paymentsApi;