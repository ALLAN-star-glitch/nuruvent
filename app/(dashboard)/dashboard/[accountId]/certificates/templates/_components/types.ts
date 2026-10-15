// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/types.ts

import { CertificateTemplateDesign } from "@/lib/types/certificates";



export interface TemplateFormState {
  name: string;
  description: string;
  priceKes: string; // user-entered KES, converted to minor on save
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
};

export const EMPTY_FORM: TemplateFormState = {
  name: '',
  description: '',
  priceKes: '20',
  design: { ...EMPTY_DESIGN },
};