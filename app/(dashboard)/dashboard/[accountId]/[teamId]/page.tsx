// app/(dashboard)/dashboard/[accountId]/[teamId]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useGetMyMembershipQuery } from '@/lib/store/api/accountsApi';
import DashboardLoading from './loading';
import { LearnerDashboard } from './_components/LearnerDashboard';
import { OrganizerDashboard } from './_components/OrganizerDashboard';

export default function DashboardPage() {
  const params = useParams<{ accountId: string; teamId: string }>();
  const accountId = params.accountId;
  const teamId = params.teamId;

  const { data: myMembership, isLoading } = useGetMyMembershipQuery(
    accountId ?? '',
    { skip: !accountId },
  );

  if (isLoading || !myMembership) {
    return <DashboardLoading />;
  }

  if (myMembership.role === 'learner') {
    return <LearnerDashboard accountId={accountId} teamId={teamId} />;
  }

  return (
    <OrganizerDashboard
      accountId={accountId}
      teamId={teamId}
      isAdmin={myMembership.role === 'account_admin'}
    />
  );
}