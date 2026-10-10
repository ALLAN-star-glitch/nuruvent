// components/layout/TeamSwitcher.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { accountLabel } from '@/lib/utils/account-label';
import { buildTeamSwitchHref } from '@/lib/utils/team-switch';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { useAppSelector } from '@/lib/store/hooks';
import type { Account } from '@/lib/types/account';
import type { Team } from '@/lib/types/team';

// ============================================================
// TYPES
// ============================================================

interface TeamSwitcherProps {
  variant?: 'default' | 'compact' | 'drawer';
}

// ============================================================
// COMPONENT
// ============================================================

export function TeamSwitcher({ variant = 'default' }: TeamSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ accountId?: string; teamId?: string }>();

  const urlAccountId = params?.accountId ?? null;
  const urlTeamId = params?.teamId ?? null;

  const workspaceAccountId = useAppSelector(
    (s) => s.workspace.activeAccountId,
  );
  const workspaceTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  const accountId = urlAccountId ?? workspaceAccountId ?? null;
  const teamId = urlTeamId ?? workspaceTeamId ?? null;

  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Manage-this-team section: collapsed by default on desktop.
  const [manageCollapsed, setManageCollapsed] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset manage collapse whenever the popover closes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setManageCollapsed(true);
  }, [open]);

  const { data: accounts } = useGetMyAccountsQuery();
  const { data: teamsData, isLoading: teamsLoading } = useGetUserTeamsQuery();

  const teams = teamsData?.teams ?? [];

  const accountById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts?.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const activeAccount =
    (accountId ? accountById.get(accountId) : null) ??
    accounts?.[0] ??
    null;

  const activeTeam = useMemo<Team | null>(() => {
    if (teamId) {
      const exact = teams.find((t) => t.id === teamId);
      if (exact) return exact;
    }
    if (accountId) {
      const inAccount = teams.find((t) => t.account_id === accountId);
      if (inAccount) return inAccount;
    }
    return null;
  }, [teamId, accountId, teams]);

  const triggerAccountLabel = accountLabel(activeAccount);

  const distinctAccountIds = useMemo(
    () => new Set(teams.map((t) => t.account_id)).size,
    [teams],
  );
  const isMultiAccount = distinctAccountIds > 1;

  const groupedTeams = useMemo(() => {
    if (!isMultiAccount) return null;

    const groups = new Map<string, Team[]>();
    for (const team of teams) {
      const bucket = groups.get(team.account_id) ?? [];
      bucket.push(team);
      groups.set(team.account_id, bucket);
    }

    return Array.from(groups.entries()).map(([accId, groupTeams]) => {
      const account = accountById.get(accId);
      return {
        accountId: accId,
        label: account ? accountLabel(account) : 'Unknown Account',
        teams: groupTeams,
      };
    });
  }, [isMultiAccount, teams, accountById]);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleSelectTeam = (team: Team) => {
    setOpen(false);
    const href = buildTeamSwitchHref(pathname, team.account_id, team.id);
    router.push(href);
  };

  const handleCreateTeam = () => {
    if (!accountId) {
      navigateTo('/accounts');
      return;
    }
    navigateTo(`/dashboard/${accountId}/teams/new`);
  };

  const handleManageTeams = () => {
    if (!accountId) {
      navigateTo('/accounts');
      return;
    }
    navigateTo(`/dashboard/${accountId}/teams`);
  };

  const handleOpenTeamSettings = () => {
    if (!accountId || !activeTeam) return;
    navigateTo(`/dashboard/${accountId}/${activeTeam.id}/settings`);
  };

  const renderAccountLogo = (
    account: Account | null | undefined,
    size: number = 28,
  ) => {
    const personal = (account?.type ?? '').includes('personal');
    const FallbackIcon = personal ? Home : Building2;

    return (
      <span
        style={{ width: size, height: size }}
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-md',
          personal
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
          <FallbackIcon style={{ width: size * 0.5, height: size * 0.5 }} />
        )}
      </span>
    );
  };

  const triggerPrimary = activeTeam
    ? activeTeam.display_name || activeTeam.name
    : triggerAccountLabel;

  const triggerSecondary = activeTeam
    ? triggerAccountLabel
    : teamsLoading
      ? 'Loading…'
      : 'Select a team';

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-border/60 bg-card text-left transition-colors hover:bg-accent cursor-pointer',
        variant === 'compact'
          ? 'px-2 py-1.5 sm:px-2.5 sm:py-2'
          : 'px-3 py-2.5',
      )}
    >
      {/* Account logo — hidden on mobile, visible from sm upward */}
      <span className="hidden sm:flex shrink-0">
        {renderAccountLogo(activeAccount, 32)}
      </span>

      {/* Text — always visible; both lines truncate */}
      <span className="min-w-0 flex-1 block">
        <span className="block truncate text-sm font-medium text-foreground">
          {triggerPrimary}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {triggerSecondary}
        </span>
      </span>

      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
          open && 'rotate-180',
        )}
      />
    </button>
  );

  // ============================================================
  // SELECTABLE TEAM ROW
  //
  // Styled like a radio option: full-width, selected state with a
  // primary tint, checkmark on the right when active.
  // ============================================================

  const renderTeamRow = (team: Team) => {
    const isActive = activeTeam?.id === team.id;
    const teamAccount = accountById.get(team.account_id);
    const label = teamAccount ? accountLabel(teamAccount) : 'Unknown Account';

    return (
      <button
        key={team.id}
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={() => handleSelectTeam(team)}
        className={cn(
          'group/row flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-foreground hover:bg-accent',
        )}
      >
        {renderAccountLogo(teamAccount, 28)}

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm',
              isActive ? 'font-medium text-primary' : 'text-foreground',
            )}
          >
            {team.display_name || team.name}
          </span>
          <span
            className={cn(
              'block truncate text-xs',
              isActive ? 'text-primary/70' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
        </span>

        {isActive && (
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        )}
      </button>
    );
  };

  // ============================================================
  // PANEL CONTENT
  // ============================================================

  const panelContent = (
    <div className="space-y-1 p-2">
      <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Switch team
      </p>

      {/* Teams list — always visible, selectable */}
      {teams.length === 0 ? (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          No teams yet
        </p>
      ) : isMultiAccount && groupedTeams ? (
        <div role="radiogroup" aria-label="Select a team">
          {groupedTeams.map((group, index) => (
            <div key={group.accountId}>
              {index > 0 && <div className="my-2 h-px bg-border" />}
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.teams.map(renderTeamRow)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Select a team"
          className="space-y-0.5"
        >
          {teams.map(renderTeamRow)}
        </div>
      )}

      <div className="my-2 h-px bg-border" />

      {/* ---- Manage this team (collapsible) ---- */}
      {activeTeam && accountId && (
        <>
          <button
            type="button"
            onClick={() => setManageCollapsed((v) => !v)}
            aria-expanded={!manageCollapsed}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Manage this team
            </span>
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                !manageCollapsed && 'rotate-90',
              )}
            />
          </button>

          {!manageCollapsed && (
            <div className="space-y-0.5 pt-1">
              <button
                type="button"
                onClick={handleOpenTeamSettings}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Team settings</span>
              </button>

              <button
                type="button"
                onClick={handleManageTeams}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Manage teams</span>
              </button>
            </div>
          )}
        </>
      )}

      <div className="my-2 h-px bg-border" />

      <button
        type="button"
        onClick={handleCreateTeam}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
      >
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm">Create new team</span>
      </button>

      {/* If no active team, still show a path to manage teams */}
      {!activeTeam && accountId && (
        <button
          type="button"
          onClick={handleManageTeams}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm">Manage teams</span>
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)}>{trigger}</div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl p-0 max-h-[85vh]"
          >
            <SheetHeader className="border-b border-border px-4 py-3 text-left">
              <SheetTitle className="text-sm font-medium">
                Switch team
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-3.5rem)]">
              {panelContent}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
      >
        <div className="max-h-[420px] overflow-y-auto">{panelContent}</div>
      </PopoverContent>
    </Popover>
  );
}