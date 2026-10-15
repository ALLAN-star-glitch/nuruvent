// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/types.ts

import type { EventAttendeeRow } from '@/lib/types/attendance';
import { Certificate } from '@/lib/types/certificates';

export type ViewMode = 'table' | 'grid';
export type SortField =
  | 'recipient_name'
  | 'issued_at'
  | 'status'
  | 'verification_code';
export type SortDirection = 'asc' | 'desc';

export type CertificateRow = Certificate;

export interface SelectedRecipient {
  attendee_id: string;
  name: string;
  email: string;
  completed_at: string;
  is_host: boolean;
  is_auto: boolean;
}

export type { EventAttendeeRow };