/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Building2,
  Home,
  Plus,
  Settings,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import type { Account } from '@/lib/types/account';

// ============================================================
// HELPERS
// ============================================================

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

/**
 * Backend sends `type` as "personal" or "institution" on AccountResponse.
 */
function isPersonalAccount(account: Account): boolean {
  return account.type.includes('personal');
}

// ============================================================
// COMPONENT
// ============================================================

export function AccountSwitcher() {
  const router = useRouter();
  const params = useParams();
  const activeAccountId = (params?.accountId as string) ?? null;

  const { data: accounts, isLoading, isError } = useGetMyAccountsQuery();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close the dropdown on route change.
  useEffect(() => {
    setOpen(false);
  }, [activeAccountId]);

  const activeAccount =
    accounts?.find((a) => a.id === activeAccountId) ?? null;

  const handleSelect = (account: Account) => {
    setOpen(false);
    if (account.id === activeAccountId) return;
    router.push(`/accounts/${account.id}`);
  };

  // ------------------------------------------------------------
  // Trigger label + icon
  // ------------------------------------------------------------
  const renderTriggerLabel = () => {
    if (isLoading) return 'Loading…';
    if (!activeAccount) return 'Choose account';
    return activeAccount.display_name || activeAccount.name;
  };

  const renderTriggerBadge = () => {
    if (isLoading) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    if (!activeAccount) return <Home className="h-3.5 w-3.5" />;
    const Icon = isPersonalAccount(activeAccount) ? Home : Building2;
    return <Icon className="h-3.5 w-3.5" />;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ============================================================
          Trigger button
      ============================================================ */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch account"
        className={cn(
          'flex items-center gap-1.5 sm:gap-2 rounded-lg border border-transparent px-2 sm:px-3 py-1.5 md:py-2',
          'text-sm font-medium text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-[#3C4043] hover:border-gray-200 dark:hover:border-[#3C4043]',
          'transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait',
          'max-w-[140px] sm:max-w-[220px]',
        )}
      >
        <span className="shrink-0 text-primary dark:text-primary/90">
          {renderTriggerBadge()}
        </span>
        <span className="truncate hidden sm:inline">
          {renderTriggerLabel()}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* ============================================================
          Dropdown
      ============================================================ */}
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 mt-2 w-72 sm:w-80 z-50',
            'rounded-2xl border border-gray-200/80 dark:border-[#3C4043]',
            'bg-white dark:bg-[#2D2E32]',
            'shadow-2xl shadow-black/10 dark:shadow-black/40',
            'py-2 animate-in fade-in slide-in-from-top-2 duration-200',
          )}
        >
          {/* Header */}
          <div className="px-3 sm:px-4 py-1.5">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Your Accounts
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-100 to-transparent dark:from-[#3C4043] mx-3 sm:mx-4" />

          {/* Account list */}
          <div className="mt-1 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading accounts…
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-500">
                <RefreshCw className="h-4 w-4" />
                Failed to load accounts
              </div>
            )}

            {!isLoading && !isError && accounts?.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>You don&apos;t belong to any accounts yet.</p>
                <Link
                  href="/accounts/new"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create your first account
                </Link>
              </div>
            )}

            {!isLoading &&
              !isError &&
              accounts?.map((account) => {
                const isActive = account.id === activeAccountId;
                const Icon = isPersonalAccount(account) ? Home : Building2;

                return (
                  <button
                    key={account.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(account)}
                    className={cn(
                      'flex w-full items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 text-left',
                      'transition-colors cursor-pointer',
                      isActive
                        ? 'bg-primary/5 dark:bg-primary/10'
                        : 'hover:bg-gray-50 dark:hover:bg-[#3C4043]/50',
                    )}
                  >
                    {/* Avatar / icon */}
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden',
                        isPersonalAccount(account)
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
                        isActive &&
                          'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#2D2E32]',
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
                        <span className="text-sm font-semibold">
                          {getAccountInitials(account)}
                        </span>
                      )}
                    </div>

                    {/* Name + type */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isActive
                            ? 'text-primary'
                            : 'text-gray-700 dark:text-gray-200',
                        )}
                      >
                        {account.display_name || account.name}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {isPersonalAccount(account) ? 'Personal' : 'Institution'}
                        {!account.is_active && ' · Inactive'}
                      </p>
                    </div>

                    {/* Active check */}
                    {isActive && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}

                    {/* Inactive hint icon */}
                    {!isActive && (
                      <Icon className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-100 to-transparent dark:from-[#3C4043] mx-3 sm:mx-4 my-1" />

          {/* Footer actions */}
          <Link
            href="/accounts/new"
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 sm:px-4 py-2.5',
              'text-sm text-gray-700 dark:text-gray-300',
              'hover:bg-gray-50 dark:hover:bg-[#3C4043]/50 transition-colors cursor-pointer',
            )}
          >
            <Plus className="h-4 w-4 shrink-0 text-gray-400" />
            <span>Create new account</span>
          </Link>

          <Link
            href="/accounts"
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 sm:px-4 py-2.5',
              'text-sm text-gray-700 dark:text-gray-300',
              'hover:bg-gray-50 dark:hover:bg-[#3C4043]/50 transition-colors cursor-pointer',
            )}
          >
            <Settings className="h-4 w-4 shrink-0 text-gray-400" />
            <span>Manage accounts</span>
          </Link>
        </div>
      )}
    </div>
  );
}