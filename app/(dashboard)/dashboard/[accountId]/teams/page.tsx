// app/(dashboard)/dashboard/[accountId]/teams/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
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

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <Link
          href={`/dashboard/${accountId}`}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to account"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="truncate">
              {account?.display_name || account?.name || 'Account'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Teams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
                className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <Link
                  href={teamHref}
                  className="flex flex-col gap-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        isPersonal
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        isPersonal
                          ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                          : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
                      )}
                    >
                      {isPersonal ? 'Personal' : 'Institution'}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                      {team.display_name || team.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {team.slug}
                    </p>
                  </div>
                </Link>

                <div className="mt-1 flex items-center justify-between border-t border-border/70 pt-3">
                  <Link
                    href={teamHref}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Open →
                  </Link>
                  <Link
                    href={settingsHref}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}