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
  registration_id: string;
  user_id?: string;
  guest_email?: string;
  currency: string;
  subtotal: number;       // minor units
  discount_total: number;
  total_amount: number;
  status: OrderStatus;
  expires_at: string;
  paid_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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