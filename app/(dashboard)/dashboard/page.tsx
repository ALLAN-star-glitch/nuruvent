'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAppSelector } from '@/lib/store/hooks';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';

export default function DashboardRedirect() {
  const router = useRouter();
  const activeAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const activeTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  // Always fetch accounts (no skip) so the fallback always works.
  const { data: accounts, isLoading: accountsLoading } = useGetMyAccountsQuery();

  useEffect(() => {
    console.log('[stub] effect', {
    activeAccountId,
    activeTeamId,
    accountsLoading,
    accountsCount: accounts?.length,
  });
    // 1. Full context — jump straight to the team dashboard.
    if (activeAccountId && activeTeamId) {
      router.replace(`/dashboard/${activeAccountId}/${activeTeamId}`);
      return;
    }

    // 2. Account but no team — go to the account overview.
    if (activeAccountId) {
      router.replace(`/dashboard/${activeAccountId}`);
      return;
    }

    // 3. No context yet — wait for the accounts query. Do NOT
    //    navigate to /accounts while we don't know how many
    //    accounts there are.
    if (accountsLoading) return;

    // 4. Query resolved. Decide based on the count.
    if (!accounts) return;

    if (accounts.length === 1) {
      router.replace(`/dashboard/${accounts[0].id}`);
      return;
    }

    // 5. Multiple or zero accounts — the picker.
    router.replace('/accounts');
  }, [
    activeAccountId,
    activeTeamId,
    accounts,
    accountsLoading,
    router,
  ]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}