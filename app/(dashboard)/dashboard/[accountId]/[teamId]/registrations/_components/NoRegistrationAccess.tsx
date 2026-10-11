'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Home,
  Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import { accountLabel } from '@/lib/utils/account-label';
import { cn } from '@/lib/utils';

interface NoRegistrationAccessProps {
  /** The team whose registrations the caller tried to view. */
  teamId: string;
}

/**
 * Rendered when the registrations list endpoint returns 403.
 *
 * A learner (or any non-organizer) has no access to the team's
 * registration ledger. Rather than show a raw error, offer them two
 * things:
 *
 *   1. The registrations they *can* see — their own.
 *   2. If they hold organizer access in another account, a link to
 *      that account (which is where they'd find a registrations view
 *      they're allowed to use).
 */
export function NoRegistrationAccess({ teamId }: NoRegistrationAccessProps) {
  const router = useRouter();
  const params = useParams<{ accountId: string; teamId: string }>();
  const accountId = params.accountId;

  const { data: accounts } = useGetMyAccountsQuery();

  // Find another account that isn't the current one. We can't know
  // here whether the user holds organizer rights there without an
  // extra permission call per account — but the offer is still useful:
  // "you have other accounts; one of them might be the right place."
  const otherAccounts = useMemo(
    () => (accounts ?? []).filter((a) => a.id !== accountId),
    [accounts, accountId],
  );

  const primaryAccount = otherAccounts[0];

  const goToMyRegistrations = () => {
    router.push(`/dashboard/${accountId}/${teamId}/my-registrations`);
  };

  const goToOtherAccount = () => {
    if (!primaryAccount) return;
    router.push(`/dashboard/${primaryAccount.id}`);
  };

  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>

        <div className="max-w-md space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">
            You don&apos;t have access to this team&apos;s registrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Only the team&apos;s organizers can view this list.
            {primaryAccount
              ? ' You can view your own registrations here, or head to one of your other accounts.'
              : ' You can still view the registrations you’ve made.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            onClick={goToMyRegistrations}
            className="cursor-pointer gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            See my registrations
          </Button>

          {primaryAccount && (
            <Button
              variant="outline"
              onClick={goToOtherAccount}
              className="cursor-pointer gap-2"
            >
              <Building2 className="h-4 w-4" />
              Go to {accountLabel(primaryAccount)}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Optional: list all other accounts if there are more than one */}
        {otherAccounts.length > 1 && (
          <div className="w-full max-w-md border-t border-border pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Your other accounts
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {otherAccounts.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/${a.id}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground',
                    'transition-colors hover:border-primary/40 hover:text-primary',
                  )}
                >
                  {a.type === 'personal' ? (
                    <Home className="h-3 w-3" />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                  {accountLabel(a)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}