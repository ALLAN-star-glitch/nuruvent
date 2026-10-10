'use client';

import { useParams } from 'next/navigation';
import { PaymentsLedger } from '@/components/payments/PaymentsLedger';

export default function PaymentsPage() {
  const params = useParams<{ accountId: string; teamId: string }>();
  const teamId = params.teamId;

  return <PaymentsLedger key={teamId} teamId={teamId} />;
}