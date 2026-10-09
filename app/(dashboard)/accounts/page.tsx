// app/(dashboard)/accounts/page.tsx

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Home,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import type { Account } from '@/lib/types/account';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/lib/store/hooks';
import { setActiveAccount } from '@/lib/store/slices/workspaceSlice';




function getAccountInitials(account: Account): string {
  const name = account.display_name || account.name || '';
  if (!name) return 'A';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isPersonalAccount(account: Account): boolean {
  return account.type.includes('personal');
}

function AccountCard({ account }: { account: Account }) {
  const router = useRouter();
  const personal = isPersonalAccount(account);
  const Icon = personal ? Home : Building2;


  

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30',
        !account.is_active && 'opacity-60',
      )}
      onClick={() => router.push(`/dashboard/${account.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden',
              personal
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
            )}
          >
            {account.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={account.logo_url}
                alt={account.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {getAccountInitials(account)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base text-foreground truncate">
                {account.display_name || account.name}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] shrink-0',
                  personal
                    ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                    : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
                )}
              >
                {personal ? 'Personal' : 'Institution'}
              </Badge>
              {!account.is_active && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-red-200 text-red-600 bg-red-50/50 dark:border-red-900 dark:text-red-400 dark:bg-red-950/30"
                >
                  Inactive
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1 truncate">
              {account.slug}
            </p>

            {account.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {account.description}
              </p>
            )}
          </div>

          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span>Open workspace</span>
          </div>
          {account.status === 'active' ? (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="capitalize">{account.status}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Building2 className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No accounts yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Create a personal or institution account to start managing events.
      </p>
      <Button asChild className="mt-6 cursor-pointer">
        <Link href="/accounts/new">
          <Plus className="h-4 w-4 mr-2" />
          Create your first account
        </Link>
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: accounts, isLoading, isError, refetch } =
    useGetMyAccountsQuery();

  useEffect(() => {
    console.log('[accounts] effect', {
      isLoading,
      isError,
      accountsCount: accounts?.length,
      hasAccount: !!accounts,
    });
    if (!isLoading && !isError && accounts?.length === 1) {
      dispatch(setActiveAccount(accounts[0].id));
      router.replace(`/dashboard/${accounts[0].id}`);
    }
  }, [isLoading, isError, accounts, router, dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick an account to open its workspace, or create a new one.
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/accounts/new">
            <Plus className="h-4 w-4 mr-2" />
            New account
          </Link>
        </Button>
      </div>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && isError && (
        <Card className="border-destructive/30">
          <CardContent className="p-12 text-center text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-3" />
            <p className="font-medium">Couldn&apos;t load your accounts</p>
            <Button
              variant="outline"
              className="mt-4 cursor-pointer"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && accounts && accounts.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !isError && accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}