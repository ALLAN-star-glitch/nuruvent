// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/types.ts

import { CertificateTemplateDesign } from '@/lib/types/certificates';

export interface TemplateFormState {
  name: string;
  description: string;

  /**
   * The template's actual ID when editing, or a temporary client-side
   * UUID when creating a new template. Used to build upload paths so
   * files can be associated with the template before it's saved.
   */
  templateId: string;

  /**
   * ID of the chosen system-tier template. Determines the certificate
   * price.
   */
  tierTemplateId: string;

  /**
   * System slug of the chosen tier ('default' | 'professional' |
   * 'premium'), or '' when no tier is set.
   */
  tierSlug: string;

  /**
   * Snapshot of the chosen tier's price in minor units.
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
  templateId: '',
  tierTemplateId: '',
  tierSlug: '',
  priceMinor: 0,
  design: { ...EMPTY_DESIGN },
};