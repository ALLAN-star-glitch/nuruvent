export type Role = 'attendee' | 'host';
export type Step = 'role' | 'personal' | 'business' | 'verify' | 'complete';

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessType: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessDescription: string;
}