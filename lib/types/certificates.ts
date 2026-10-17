// lib/types/certificate.ts

import type { BaseResponse } from './events';

// ============================================================
// CERTIFICATE
// ============================================================

export type CertificateStatus = 'active' | 'revoked';

export type CertificateContextType = 'event' | 'course' | 'workshop';

export interface Certificate {
  id: string;
  account_id: string;
  template_id: string;
  verification_code: string;
  recipient_name: string;
  recipient_email: string;
  recipient_user_id?: string;
  context_type: CertificateContextType;
  context_id: string;
  metadata?: Record<string, string>;
  completed_at: string;
  issued_at: string;
  status: CertificateStatus;
  revoked_at?: string;
  revocation_reason?: string;
  pdf_url?: string;
  verify_url?: string;
}

export interface CertificateListResponse {
  count: number;
  certificates: Certificate[];
}

// ============================================================
// VERIFICATION (public)
// ============================================================

export interface VerifyCertificateResponse {
  verification_code: string;
  recipient_name: string;
  context_type: CertificateContextType;
  context_id: string;
  metadata?: Record<string, string>;
  completed_at: string;
  issued_at: string;
  status: CertificateStatus;
}

// ============================================================
// TEMPLATES
// ============================================================

export interface CertificateTemplateDesign {
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  font_family?: string;

  logo_url?: string;
  seal_url?: string;
  signature_url?: string;
  background_url?: string;

  signatory_name?: string;
  signatory_title?: string;

  title_text?: string;
  subtitle_text?: string;
  body_text?: string;
  footer_text?: string;

  qr_position?: string;

  border_style?: string;
  border_color?: string;
  signature_line?: boolean;
  watermark_text?: string;
  verify_badge?: boolean;
}

export interface CertificateTemplate {
  id: string;
  account_id?: string;
  name: string;
  description?: string;
  design: CertificateTemplateDesign;
  price_minor?: number | null;
  system_slug?: string;
  is_default: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplateListResponse {
  count: number;
  templates: CertificateTemplate[];
}

/**
 * Create certificate template request (account-scoped).
 *
 * `tier_template_id` links this template to a system tier. When set,
 * the backend snapshots the tier's price into `price_minor` and
 * restricts the design fields accordingly.
 */
export interface CreateCertificateTemplateRequest {
  account_id: string;
  name: string;
  description?: string;
  design: CertificateTemplateDesign;
  price_minor?: number;
  tier_template_id?: string;
}

/**
 * Update certificate template request.
 *
 * Same fields as Create, but all optional. `tier_template_id` can be
 * re-sent to re-resolve the tier on update.
 */
export interface UpdateCertificateTemplateRequest {
  name?: string;
  description?: string;
  design?: CertificateTemplateDesign;
  price_minor?: number;
  tier_template_id?: string;
}

// ============================================================
// BATCH ISSUANCE (organizer-pays)
// ============================================================

export interface CertificateBatchRecipientInput {
  user_id?: string;
  name: string;
  email: string;
  completed_at: string; // RFC3339
}

export type IssueCertificatesMode = 'add' | 'replace';

export interface IssueCertificatesRequest {
  mode?: IssueCertificatesMode;
  template_id?: string;
  event_title?: string;
  event_date: string; // RFC3339
  event_duration?: string;
  issuer_name?: string;
  account_id: string;
  recipients?: CertificateBatchRecipientInput[];
}

export interface IssueCertificatesFreeResponse {
  type: 'free';
  issued: number;
  reused: number;
  failed: number;
  attendee_count: number;
}

export interface IssueCertificatesPaidResponse {
  type: 'paid';
  order_id: string;
  amount_minor: number;
  currency: string;
  attendee_count: number;
}

export type IssueCertificatesResponse =
  | IssueCertificatesFreeResponse
  | IssueCertificatesPaidResponse;

// ============================================================
// FILTERS
// ============================================================

export interface ListCertificatesParams {
  context_type?: CertificateContextType;
  context_id?: string;
  status?: CertificateStatus;
  from?: string; // RFC3339
  to?: string;   // RFC3339
  limit?: number;
  offset?: number;
}

// ============================================================
// CONVENIENCE RE-EXPORT
// ============================================================

export type CertificateEnvelope<T> = BaseResponse<T>;