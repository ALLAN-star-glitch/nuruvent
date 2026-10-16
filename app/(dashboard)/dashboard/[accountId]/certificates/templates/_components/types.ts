// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/types.ts

import { CertificateTemplateDesign } from '@/lib/types/certificates';

export interface TemplateFormState {
  name: string;
  description: string;

  /**
   * ID of the chosen system-tier template. Determines the certificate
   * price. The organizer picks from Nuruvent's tiers — they cannot
   * enter a custom price.
   */
  tierTemplateId: string;

  /**
   * System slug of the chosen tier ('default' | 'professional' |
   * 'premium'), or '' when no tier is set. Drives UI gating: fields
   * not permitted by the tier are disabled in the editor. The backend
   * enforces the same rules on save.
   */
  tierSlug: string;

  /**
   * Snapshot of the chosen tier's price in minor units, taken at the
   * moment the organizer selects the tier. Sent to the API as
   * price_minor. Snapshotting (rather than referencing the tier
   * template) means a later tier-price change doesn't retroactively
   * alter what an existing template costs.
   */
  priceMinor: number;

  design: CertificateTemplateDesign;
}

export const EMPTY_DESIGN: CertificateTemplateDesign = {
  background_color: '#FFFFFF',
  text_color: '#1A1A1A',
  accent_color: '#0A6EBD',
  font_family: 'Georgia',

  logo_url: '',
  seal_url: '',
  signature_url: '',
  background_url: '',

  signatory_name: '',
  signatory_title: '',

  title_text: 'Certificate of Completion',
  subtitle_text: 'This certifies that',
  body_text:
    'has successfully completed {{context_title}} on {{context_date}}.',
  footer_text: 'Verify at nuruvent.com/verify',

  qr_position: 'bottom-right',

  // ---- Border ----
  border_style: 'none',
  border_color: '',

  // ---- Signature block ----
  signature_line: false,

  // ---- Premium-only ----
  watermark_text: '',
  verify_badge: false,
};

export const EMPTY_FORM: TemplateFormState = {
  name: '',
  description: '',
  tierTemplateId: '',
  tierSlug: '',
  priceMinor: 0,
  design: { ...EMPTY_DESIGN },
};