/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useState, MouseEvent, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  CreditCard,
  Award,
  Clapperboard,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Plus,
  Home,
  Building2,
  LucideIcon,
  Ticket,
  UserPlus,
  Check,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { clearWorkspace } from '@/lib/store/slices/workspaceSlice';
import { LogoutDialog } from '@/components/ui/LogoutDialog';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import {
  useGetMyAccountsQuery,
  useGetMyMembershipQuery,
} from '@/lib/store/api/accountsApi';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { buildTeamSwitchHref } from '@/lib/utils/team-switch';
import { accountLabel } from '@/lib/utils/account-label';
import type { Account, AccountRole } from '@/lib/types/account';
import type { Team } from '@/lib/types/team';

// ============================================================
// TYPES
// ============================================================

interface NavItem {
  segment: string;
  label: string;
  icon: LucideIcon;
  isTrash?: boolean;
  href?: string;
  exact?: boolean;
  organizersOnly?: boolean;
  adminsOnly?: boolean;
  children?: NavItem[];
}

interface DashboardSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  collapsed?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function DashboardSidebar({
  onCollapseChange,
  collapsed: externalCollapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const urlAccountId = (params?.accountId as string) ?? null;
  const urlTeamId = (params?.teamId as string) ?? null;

  const workspaceAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const workspaceTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  const accountId = urlAccountId ?? workspaceAccountId ?? null;
  const teamId = urlTeamId ?? workspaceTeamId ?? null;

  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [certificatesExpanded, setCertificatesExpanded] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: teamsResponse } = useGetUserTeamsQuery();
  const teams = teamsResponse?.teams ?? [];

  const { data: accounts } = useGetMyAccountsQuery();

  const { data: myMembership } = useGetMyMembershipQuery(accountId ?? '', {
    skip: !accountId,
  });

  const accountById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts?.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const isAdmin = useMemo(() => {
    const role = myMembership?.role as AccountRole | undefined;
    return role === 'account_admin';
  }, [myMembership]);

  const isOrganizer = useMemo(() => {
    const role = myMembership?.role as AccountRole | undefined;
    return role === 'account_admin' || role === 'trainer';
  }, [myMembership]);

  const TEAM_NAV_ITEMS = useMemo<NavItem[]>(
    () => [
      {
        segment: 'workspaces',
        label: 'My Workspaces',
        icon: Layers,
        href: '/accounts',
      },
      { segment: '', label: 'Dashboard', icon: LayoutDashboard },
      { segment: 'events', label: 'Team Events', icon: Calendar },
      {
        segment: 'registrations',
        label: 'Registrations',
        icon: ClipboardList,
        organizersOnly: true,
      },
      { segment: 'tickets', label: 'My Tickets', icon: Ticket },
      {
        segment: 'attendees',
        label: 'Attendees',
        icon: Users,
        organizersOnly: true,
      },
      {
        segment: 'payments',
        label: 'Payments',
        icon: CreditCard,
        adminsOnly: true,
      },
        {
      segment: 'certificates',
      label: 'Certificates',
      icon: Award,
      organizersOnly: true,
      href: accountId ? `/dashboard/${accountId}/certificates` : undefined,
      children: [
        {
          segment: '',
          label: 'Issued Certificates',
          icon: Award,
          href: accountId
            ? `/dashboard/${accountId}/certificates`
            : undefined,
          exact: true,
        },
        {
          segment: '',
          label: 'Templates', // <-- RENAMED
          icon: Award,
          href: accountId
            ? `/dashboard/${accountId}/certificates/templates`
            : undefined,
        },
      ],
    },
      { segment: 'replays', label: 'Replays', icon: Clapperboard },
      {
        segment: 'trash',
        label: 'Trash',
        icon: Trash2,
        isTrash: true,
        organizersOnly: true,
      },
    ],
    [accountId],
  );

  const visibleNavItems = useMemo(
    () =>
      TEAM_NAV_ITEMS.filter((item) => {
        if (item.adminsOnly) return isAdmin;
        if (item.organizersOnly) return isOrganizer;
        return true;
      }),
    [TEAM_NAV_ITEMS, isAdmin, isOrganizer],
  );

  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setInternalCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapseChange?.(next);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap();
      dispatch(clearAuth());
      dispatch(clearWorkspace());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearAuth());
      dispatch(clearWorkspace());
      router.push('/');
    }
  };

  const openLogoutDialog = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowLogoutDialog(true);
  };

  const accountBase = accountId ? `/dashboard/${accountId}` : '/accounts';
  const teamBase =
    accountId && teamId ? `${accountBase}/${teamId}` : accountBase;

  const buildTeamNavHref = (item: NavItem) => {
    if (item.href) return item.href;
    if (!accountId || !teamId) return '/accounts';
    return item.segment === '' ? teamBase : `${teamBase}/${item.segment}`;
  };

  const buildAccountHref = (segment: string) => {
    if (!accountId) return '/accounts';
    return segment === '' ? accountBase : `${accountBase}/${segment}`;
  };

  const buildTeamHref = (team: Team) => {
    return buildTeamSwitchHref(pathname, team.account_id, team.id);
  };

  const isTeamNavActive = (item: NavItem) => {
    if (item.href) {
      if (item.exact) return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (!accountId || !teamId) return false;
    if (item.segment === '') return pathname === teamBase;

    if (item.children) {
      return item.children.some((child) => isChildActive(child));
    }

    const href = `${teamBase}/${item.segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isChildActive = (child: NavItem) => {
    if (child.href) {
      if (child.exact) return pathname === child.href;
      return pathname === child.href || pathname.startsWith(`${child.href}/`);
    }
    if (!accountId || !teamId) return false;
    const href = `${teamBase}/${child.segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isTeamActive = (id: string) => urlTeamId === id;

  const isProfileActive =
    pathname === '/profile' || pathname.startsWith('/profile/');

  const isAccountSettingsActive = pathname.startsWith(
    `${accountBase}/settings`,
  );

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

  return (
    <>
      <aside
        onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
        className={cn(
          'hidden md:flex md:flex-col bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out select-none shrink-0',
          'fixed left-6 z-30 overflow-hidden',
          'rounded-2xl border border-border/70 shadow-xl shadow-black/5',
          collapsed ? 'w-[68px]' : 'w-[260px]',
          'top-[140px] h-[calc(100vh-200px)]',
        )}
      >
        <div
          onClick={toggleSidebar}
          className={cn(
            'flex items-center h-12 flex-shrink-0 cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/40',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {!collapsed ? (
            <>
              <span className="text-xs font-semibold tracking-wider uppercase text-foreground/70 cursor-pointer">
                Collapse Menu
              </span>
              <ChevronLeft className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
            </>
          ) : (
            <ChevronRight className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <nav className="px-3 py-3 space-y-0.5">
            {visibleNavItems.map((item) => {
              const isActive = isTeamNavActive(item);
              const Icon = item.icon;
              const isTrash = item.isTrash;
              const isWorkspaces = item.segment === 'workspaces';
              const showDivider = isWorkspaces;
              const hasChildren = !!item.children && item.children.length > 0;
              const isCertGroup = item.segment === 'certificates';
              const childrenExpanded = isCertGroup && certificatesExpanded;

              if (collapsed) {
                return (
                  <div key={item.segment || item.label}>
                    <Link
                      href={buildTeamNavHref(item)}
                      prefetch={false}
                      className={cn(
                        'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-150 group relative cursor-pointer',
                        isActive
                          ? isTrash
                            ? 'bg-destructive/15 text-destructive font-semibold'
                            : 'bg-primary/15 text-primary font-semibold'
                          : isTrash
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="absolute left-12 ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground border border-border text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md font-medium">
                        {item.label}
                      </div>
                    </Link>
                    {showDivider && (
                      <div className="my-2 border-t border-border/40" />
                    )}
                  </div>
                );
              }

              return (
                <div key={item.segment || item.label}>
                  {hasChildren ? (
                    <div className="space-y-0.5">
                      <div
                        className={cn(
                          'flex items-center gap-1 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                          isActive
                            ? isTrash
                              ? 'bg-destructive/15 text-destructive font-semibold'
                              : 'bg-primary/15 text-primary font-semibold'
                            : isTrash
                              ? 'text-destructive hover:bg-destructive/10'
                              : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
                        )}
                      >
                        {isActive && (
                          <div
                            className={cn(
                              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full',
                              isTrash ? 'bg-destructive' : 'bg-primary',
                            )}
                          />
                        )}

                        <Link
                          href={buildTeamNavHref(item)}
                          prefetch={false}
                          className="flex flex-1 items-center gap-3 px-3 py-2.5 cursor-pointer truncate"
                        >
                          <Icon
                            className={cn(
                              'h-[18px] w-[18px] shrink-0 transition-colors',
                              isTrash
                                ? 'text-destructive'
                                : isActive
                                  ? 'text-primary'
                                  : 'text-foreground/70 group-hover:text-foreground',
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (isCertGroup)
                              setCertificatesExpanded((v) => !v);
                          }}
                          className="pr-3 py-2.5 cursor-pointer hover:text-primary transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 transition-transform',
                              childrenExpanded
                                ? 'rotate-180 text-primary'
                                : 'text-foreground/60',
                            )}
                          />
                        </button>
                      </div>

                      {childrenExpanded && (
                        <div className="mt-1 ml-4 pl-3 border-l border-border/40 space-y-0.5">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isChildActive(child);
                            return (
                              <Link
                                key={child.label}
                                href={buildTeamNavHref(child)}
                                prefetch={false}
                                className={cn(
                                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer',
                                  childActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-foreground/75 hover:bg-accent/60 hover:text-foreground',
                                )}
                              >
                                <ChildIcon className="h-[16px] w-[16px] shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={buildTeamNavHref(item)}
                      prefetch={false}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative cursor-pointer',
                        isActive
                          ? isTrash
                            ? 'bg-destructive/15 text-destructive font-semibold'
                            : 'bg-primary/15 text-primary font-semibold'
                          : isTrash
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
                      )}
                    >
                      {isActive && (
                        <div
                          className={cn(
                            'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full',
                            isTrash ? 'bg-destructive' : 'bg-primary',
                          )}
                        />
                      )}
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          isTrash
                            ? 'text-destructive'
                            : isActive
                              ? 'text-primary'
                              : 'text-foreground/70 group-hover:text-foreground',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}
                  {showDivider && (
                    <div className="my-2 border-t border-border/40" />
                  )}
                </div>
              );
            })}
          </nav>

          {accountId && (
            <>
              <div className="border-t border-border/50" />
              {!collapsed && (
                <div className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => setTeamsExpanded((v) => !v)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all cursor-pointer',
                      teamsExpanded
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
                    )}
                  >
                    <Users
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        teamsExpanded ? 'text-primary' : 'text-foreground/70',
                      )}
                    />
                    <span className="flex-1">Teams</span>
                    {teams.length > 0 && (
                      <span
                        className={cn(
                          'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                          teamsExpanded
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary',
                        )}
                      >
                        {teams.length}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform',
                        teamsExpanded
                          ? 'rotate-180 text-primary'
                          : 'text-foreground/60',
                      )}
                    />
                  </button>

                  {teamsExpanded && (
                    <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                      {teams.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-muted-foreground">
                          No teams yet
                        </p>
                      ) : (
                        <div
                          role="radiogroup"
                          aria-label="Your teams"
                          className="space-y-0.5"
                        >
                          {teams.map((team) => {
                            const isActive = isTeamActive(team.id);
                            const teamAccount = accountById.get(team.account_id);
                            const label = teamAccount
                              ? accountLabel(teamAccount)
                              : 'Unknown Account';
                            return (
                              <Link
                                key={team.id}
                                href={buildTeamHref(team)}
                                className={cn(
                                  'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                                    : 'text-foreground/80 hover:bg-accent/60 hover:text-foreground',
                                )}
                              >
                                {isActive && (
                                  <span
                                    aria-hidden
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary"
                                  />
                                )}
                                {renderAccountLogo(teamAccount, 24)}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate">
                                    {team.display_name || team.name}
                                  </span>
                                  <span
                                    className={cn(
                                      'block truncate text-xs',
                                      isActive
                                        ? 'text-primary/70'
                                        : 'text-muted-foreground',
                                    )}
                                  >
                                    {label}
                                  </span>
                                </span>
                                {isActive && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-2 border-t border-primary/15 pt-2 space-y-0.5">
                        {teamId && (
                          <Link
                            href={`${teamBase}/settings`}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <Settings className="h-4 w-4 shrink-0" />
                            <span>Team settings</span>
                          </Link>
                        )}
                        {teamId && (
                          <button
                            type="button"
                            onClick={() => setInviteOpen(true)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <UserPlus className="h-4 w-4 shrink-0" />
                            <span>Invite member</span>
                          </button>
                        )}
                        <Link
                          href={`${accountBase}/teams/new`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          <span>New team</span>
                        </Link>
                        <Link
                          href="/accounts"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 shrink-0" />
                          <span>Manage teams</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {collapsed && (
                <div className="py-3 px-2">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                      'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all cursor-pointer group relative',
                      'text-foreground/80 hover:bg-accent hover:text-foreground',
                    )}
                    title="Teams"
                  >
                    <Users className="h-5 w-5 shrink-0" />
                    <div className="absolute left-12 ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground border border-border text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md font-medium">
                      Teams
                    </div>
                  </button>
                </div>
              )}
            </>
          )}

          <div className="border-t border-border/50" />
          <div className={cn('py-3 space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
            {accountId && (
              <Link
                href={buildAccountHref('settings')}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all cursor-pointer',
                  collapsed
                    ? 'h-10 w-10 mx-auto justify-center'
                    : 'px-3 py-2.5',
                  isAccountSettingsActive
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
                )}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    Account Settings
                  </span>
                )}
              </Link>
            )}

            <Link
              href="/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg transition-all cursor-pointer',
                collapsed ? 'h-10 w-10 mx-auto justify-center' : 'px-3 py-2.5',
                isProfileActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
              )}
            >
              <User className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">My Profile</span>
              )}
            </Link>

            <button
              type="button"
              onClick={openLogoutDialog}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-all duration-150 w-full cursor-pointer',
                collapsed ? 'h-10 w-10 mx-auto justify-center' : 'px-3 py-2.5',
                'text-destructive hover:bg-destructive/10 active:scale-[0.98]',
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0 text-destructive" />
              {!collapsed && (
                <span className="text-sm font-semibold">Sign out</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoading}
      />

      {teamId && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={teamId}
        />
      )}
    </>
  );
}