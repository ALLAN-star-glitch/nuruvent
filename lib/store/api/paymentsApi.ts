// lib/store/api/paymentsApi.ts

import { CreateOrderRequest, InitiatePaymentRequest, Order, Payment, RefundRequest } from '@/lib/types/payments';
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
  }),
});

// ============================================================
// HOOKS
// ============================================================

export const {
  useCreateOrderMutation,
  useGetOrderQuery,
  useInitiatePaymentMutation,
  useGetPaymentQuery,
  useRefundPaymentMutation,
} = paymentsApi;