// app/(dashboard)/dashboard/[accountId]/teams/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Loader2,
  Plus,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { useGetAccountByIdQuery } from '@/lib/store/api/accountsApi';
import { cn } from '@/lib/utils';

export default function TeamsListPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const { data: account } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  const { data, isLoading, isError } = useGetUserTeamsQuery();

  // Backend ignores account_id param — filter client-side.
  const teams = (data?.teams ?? []).filter((t) => t.account_id === accountId);

  const accountIsPersonal = (account?.type ?? '').includes('personal');
  const AccountFallbackIcon = accountIsPersonal ? Home : Building2;
  const accountLogo = account?.logo_url ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={account.logo_url}
      alt={account.name}
      className="h-full w-full object-cover"
    />
  ) : (
    <AccountFallbackIcon className="h-3.5 w-3.5" />
  );

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-2 sm:gap-3">
        <Link
          href={`/dashboard/${accountId}`}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
          aria-label="Back to account"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:gap-2 sm:text-[11px]">
            {/* Account logo (falls back to icon) */}
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded',
                accountIsPersonal
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
              )}
            >
              {accountLogo}
            </span>
            <span className="truncate">
              {account?.display_name || account?.name || 'Account'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Teams
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            All teams in this account.
          </p>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/${accountId}/teams/new`)}
          className="cursor-pointer gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New team</span>
        </Button>
      </div>

      {/* LIST */}
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border/70 bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load teams. Please try again.
          </p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No teams yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a team to start organising events.
          </p>
          <Button
            onClick={() => router.push(`/dashboard/${accountId}/teams/new`)}
            className="mt-4 cursor-pointer gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New team
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const Icon = team.type === 'personal' ? Home : Building2;
            const isPersonal = team.type === 'personal';
            const teamHref = `/dashboard/${accountId}/${team.id}`;
            const settingsHref = `${teamHref}/settings`;

            return (
              <div
                key={team.id}
                className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5"
              >
                {/* Identity block */}
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                      isPersonal
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-lg font-semibold text-foreground sm:text-xl">
                        {team.display_name || team.name}
                      </p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 text-[10px]',
                          isPersonal
                            ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                            : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
                        )}
                      >
                        {isPersonal ? 'Personal' : 'Institution'}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {team.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    className="w-full cursor-pointer gap-1.5 sm:flex-1"
                  >
                    <Link href={teamHref}>
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full cursor-pointer gap-1.5 sm:w-auto"
                  >
                    <Link href={settingsHref}>
                      <Settings className="h-4 w-4" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}