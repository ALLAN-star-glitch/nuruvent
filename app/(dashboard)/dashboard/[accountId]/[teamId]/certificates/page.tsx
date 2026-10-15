// app/(dashboard)/dashboard/[accountId]/[teamId]/certificates/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * The team-scoped certificates route redirects to the account-level
 * certificates page. The sidebar keeps a team-scoped "Certificates"
 * link so it works uniformly with team switching, but the actual
 * certificates view is account-wide.
 */
export default function TeamCertificatesRedirect() {
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const accountId = params.accountId;

  useEffect(() => {
    if (accountId) {
      router.replace(`/dashboard/${accountId}/certificates`);
    }
  }, [accountId, router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}