// app/(dashboard)/dashboard/[accountId]/page.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Home,
  Plus,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useGetAccountByIdQuery,
  useGetMyAccountsQuery,
} from '@/lib/store/api/accountsApi';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { useAppDispatch } from '@/lib/store/hooks';
import { setActiveAccount } from '@/lib/store/slices/workspaceSlice';
import { accountLabel } from '@/lib/utils/account-label';
import { cn } from '@/lib/utils';

import AccountOverviewLoading from './loading';

// ============================================================
// TYPES
// ============================================================

interface PickerTeam {
  id: string;
  account_id: string;
  name: string;
  display_name?: string;
  type: string;
}

interface PickerAccount {
  id: string;
  name: string;
  display_name: string;
  type: string;
  logo_url?: string;
}

// ============================================================
// OUTER — resolves route params before rendering the inner page
// ============================================================

export default function TeamPickerPage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params?.accountId;

  if (!accountId) {
    return <AccountOverviewLoading />;
  }

  return <TeamPicker accountId={accountId} />;
}

// ============================================================
// INNER
// ============================================================

function TeamPicker({ accountId }: { accountId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useGetAccountByIdQuery(accountId);

  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useGetUserTeamsQuery({ accountId });

  const { data: accounts } = useGetMyAccountsQuery();

  const teams = useMemo(
    () => (teamsResponse?.teams ?? []).filter((t) => t.account_id === accountId),
    [teamsResponse, accountId],
  );

  const accountById = useMemo(() => {
    const map = new Map<string, PickerAccount>();
    accounts?.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Keep the active account in sync for downstream pages.
  useEffect(() => {
    dispatch(setActiveAccount(accountId));
  }, [accountId, dispatch]);

  const isLoading =
    (accountLoading && !account) || (teamsLoading && !teamsResponse);

  // A single-team account has nothing to pick — send the user straight in.
  useEffect(() => {
    if (isLoading || !account) return;
    if (teams.length === 1) {
      router.replace(`/dashboard/${accountId}/${teams[0].id}`);
    }
  }, [isLoading, account, teams, accountId, router]);

  // ---- Loading --------------------------------------------------
  if (isLoading) return <AccountOverviewLoading />;

  // ---- Account fetch failed ------------------------------------
  if (accountError) {
    return (
      <ErrorState
        title="Could not load account"
        description={
          (accountError as { data?: { message?: string } })?.data?.message ??
          'Please try again.'
        }
        onAction={() => router.push('/accounts')}
        actionLabel="Go to Accounts"
      />
    );
  }

  // ---- Account missing -----------------------------------------
  if (!account) {
    return (
      <ErrorState
        title="Account not found"
        description="The account you're looking for doesn't exist or you don't have access to it."
        onAction={() => router.push('/accounts')}
        actionLabel="Go to Accounts"
      />
    );
  }

  // ---- Single-team redirect in flight --------------------------
  if (teams.length === 1) return <AccountOverviewLoading />;

  // ---- Loaded ---------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-3 pb-20 pt-2 sm:px-4 sm:space-y-8 sm:pt-4">
      {teamsError ? (
        <Card className="border-destructive/30">
          <CardContent className="py-10 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">
              Could not load teams
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <CreateFirstTeam accountId={accountId} />
      ) : (
        <TeamPickerGrid
          accountId={accountId}
          teams={teams}
          accountById={accountById}
        />
      )}
    </div>
  );
}

// ============================================================
// ERROR / NOT-FOUND STATE
// ============================================================

function ErrorState({
  title,
  description,
  onAction,
  actionLabel,
}: {
  title: string;
  description: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button onClick={onAction} className="mt-6 cursor-pointer">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE — account has no teams yet
// ============================================================

function CreateFirstTeam({ accountId }: { accountId: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-primary/70" />
          <Home className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Create your first team
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Teams are where you create events, manage attendees, and track
          everything in one place.
        </p>

        <Button asChild className="mt-6 cursor-pointer gap-2">
          <Link href={`/dashboard/${accountId}/teams/new`}>
            <Plus className="h-4 w-4" />
            Create your first team
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// TEAM GRID — account has 2+ teams
// ============================================================

function TeamPickerGrid({
  accountId,
  teams,
  accountById,
}: {
  accountId: string;
  teams: PickerTeam[];
  accountById: Map<string, PickerAccount>;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pick a team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Choose a team to continue.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="w-full shrink-0 cursor-pointer gap-2 sm:w-auto"
        >
          <Link href={`/dashboard/${accountId}/teams/new`}>
            <Plus className="h-4 w-4" />
            New team
          </Link>
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            accountId={accountId}
            team={team}
            account={accountById.get(team.account_id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TEAM CARD
// ============================================================

function TeamCard({
  accountId,
  team,
  account,
}: {
  accountId: string;
  team: PickerTeam;
  account?: PickerAccount;
}) {
  const isPersonal = team.type === 'personal';
  const TypeIcon = isPersonal ? Home : Building2;
  const accountName = account ? accountLabel(account) : 'Unknown Account';

  return (
    <Link
      href={`/dashboard/${accountId}/${team.id}`}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'sm:p-5',
      )}
    >
      {/* Soft accent glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Top row: account identity + team-type badge */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
              account?.type?.includes('personal')
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
            )}
          >
            {account?.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={account.logo_url}
                alt={account.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {accountName}
          </span>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'shrink-0 gap-1 text-[10px]',
            isPersonal
              ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
              : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {isPersonal ? 'Personal' : 'Institution'}
        </Badge>
      </div>

      {/* Team name — the primary thing the user picks */}
      <div className="relative flex min-w-0 items-center justify-between gap-3">
        <p className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {team.display_name || team.name}
        </p>
        <ArrowRight
          className={cn(
            'h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all',
            'group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100',
          )}
          aria-hidden
        />
      </div>
    </Link>
  );
}