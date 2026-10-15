// app/verify/[code]/_components/types.ts

export type VerifyState =
  | { kind: 'loading' }
  | { kind: 'verified'; data: VerifiedCertificate }
  | { kind: 'not-found' }
  | { kind: 'invalid'; message: string }
  | { kind: 'error'; message: string };

export interface VerifiedCertificate {
  verification_code: string;
  recipient_name: string;
  context_type: string;
  context_id: string;
  metadata?: Record<string, string>;
  completed_at: string;
  issued_at: string;
  status: 'active' | 'revoked';
}