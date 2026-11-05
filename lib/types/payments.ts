// lib/types/payment.ts

// ============================================================
// ENUMS / UNIONS
// ============================================================

export type PaymentMethod = 'mpesa' | 'card';

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired';

// ============================================================
// ORDER
// ============================================================

export interface OrderItem {
  ticket_type_id: string;
  quantity: number;
  unit_price: number;   // minor units
  discount: number;
  line_total: number;
}

export interface Order {
  id: string;
  kind: 'registration' | 'certificate_batch';
  registration_id?: string;
  user_id?: string;
  guest_email?: string;
  currency: string;
  subtotal: number;       // minor units
  discount_total: number;
  total_amount: number;
  status: OrderStatus;
  
  /** 
   * Latest payment status, hydrated by the backend.
   * Used by guests polling GET /orders/:id to detect success.
   */
  payment_status?: PaymentStatus;
  
  expires_at: string;
  paid_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];

  // Certificate batch fields
  batch_attendee_count?: number;
  batch_context?: {
    event_id: string;
    account_id: string;
    template_id: string;
    price_per_cert_minor: number;
    event_title: string;
    event_date?: string;
    event_duration?: string;
    issuer_name?: string;
    attendee_count: number;
  };
}

// ============================================================
// PAYMENT
// ============================================================

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  method: PaymentMethod;
  amount: number;          // minor units
  currency: string;
  status: PaymentStatus;
  provider_reference?: string;
  redirect_url?: string;   // present for card only
  failure_reason?: string;
  initiated_at: string;
  expires_at: string;
  access_code?: string;
  completed_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// REQUESTS
// ============================================================

export interface CreateOrderRequest {
  registration_id: string;
  guest_email?: string;
}

export interface InitiatePaymentRequest {
  order_id: string;
  method: PaymentMethod;
  payer_phone?: string;
  payer_email?: string;
  idempotency_key: string;
  return_url?: string;
  description?: string;
}

export interface RefundRequest {
  amount: number;         // minor units
  reason?: string;
  idempotency_key?: string;
}

// ============================================================
// LEDGER — payment list row + stats
// ============================================================

export type LedgerPaymentStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'expired';

export type LedgerPaymentMethod = 'mpesa' | 'card';

export interface PaymentListItem {
  id: string;
  order_id: string;
  registration_id: string;
  registration_number?: string;

  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;

  event_id: string;
  event_title: string;
  event_start_date?: string;
  event_image_url?: string;

  amount: number;
  currency: string;
  platform_fee: number;
  processing_fee: number;
  net_to_organizer: number;
  platform_fee_rate: number;
  processing_fee_rate: number;

  status: LedgerPaymentStatus;
  status_label: string;
  provider: string;
  method: LedgerPaymentMethod;
  method_label: string;
  transaction_id?: string;

  initiated_at: string;
  completed_at?: string;
  created_at: string;
}

export interface PaymentListResponse {
  payments: PaymentListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListPaymentsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  method?: string;
  event_id?: string;
  sort_by?: 'created_at' | 'amount' | 'completed_at';
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
  team_id?: string;
  scope?: 'team';
}

export interface PaymentStats {
  total_revenue: number;
  total_platform_fees: number;
  total_processing_fees: number;
  total_net: number;
  transaction_count: number;
  currency: string;
  by_status: Record<string, number>;
}