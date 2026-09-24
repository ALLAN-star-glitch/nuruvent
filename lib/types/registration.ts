// lib/types/registration.ts

// ============================================================
// REQUESTS
// ============================================================

export interface TicketSelectionRequest {
  ticket_type_id: string;
  quantity: number;
}

export interface GuestRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface RegisterRequest {
  selections: TicketSelectionRequest[];
  guest?: GuestRequest;
}

export interface JoinWaitlistRequest {
  ticket_type_id?: string;
  guest?: GuestRequest;
}

export interface CancelRequest {
  reason?: string;
}

// ============================================================
// RESPONSES
// ============================================================

export interface RegistrationStatus {
  slug: string;
  name: string;
  display_name: string;
  color?: string;
  icon?: string;
}

export interface GuestResponse {
  name: string;
  email: string;
  phone?: string;
}

export interface TicketSelectionResponse {
  ticket_type_id: string;
  quantity: number;
  unit_price: number;  // minor units
  discount: number;
  line_total: number;
}

export interface RegistrationPricing {
  currency: string;
  subtotal: number;       // minor units
  discount_total: number; // minor units
  total: number;          // minor units
}

export interface Registration {
  id: string;
  registration_number: string;
  status: RegistrationStatus;
  user_id?: string;
  guest?: GuestResponse;
  event_id: string;
  selections: TicketSelectionResponse[];
  pricing: RegistrationPricing;
  created_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface WaitlistEntry {
  id: string;
  event_id: string;
  position: number;
  created_at: string;
}

export interface RegistrationList {
  data: Registration[];
  total: number;
  page: number;
  page_size: number;
}