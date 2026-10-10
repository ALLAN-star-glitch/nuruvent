/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useState, MouseEvent, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { clearWorkspace } from '@/lib/store/slices/workspaceSlice';
import { LogoutDialog } from '@/components/ui/LogoutDialog';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { FaLaptopHouse } from 'react-icons/fa';

// ============================================================
// TYPES
// ============================================================

interface NavItem {
  segment: string;
  label: string;
  icon: LucideIcon;
  isTrash?: boolean;
}

interface DashboardSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  collapsed?: boolean;
}

// ============================================================
// TEAM-SCOPED NAV
// ============================================================

const TEAM_NAV_ITEMS: NavItem[] = [
  { segment: '', label: 'Dashboard', icon: LayoutDashboard },
  { segment: 'events', label: 'Events', icon: Calendar },
  { segment: 'registrations', label: 'Registrations', icon: ClipboardList },
  { segment: 'tickets', label: 'Tickets', icon: Ticket },
  { segment: 'attendees', label: 'Attendees', icon: Users },
  { segment: 'payments', label: 'Payments', icon: CreditCard },
  { segment: 'certificates', label: 'Certificates', icon: Award },
  { segment: 'replays', label: 'Replays', icon: Clapperboard },
  { segment: 'trash', label: 'Trash', icon: Trash2, isTrash: true },
];

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

  // URL-scoped IDs (present only on /dashboard/:accountId/:teamId/*).
  const urlAccountId = (params?.accountId as string) ?? null;
  const urlTeamId = (params?.teamId as string) ?? null;

  // Fall back to the last-used workspace when the URL has no
  // account/team. This keeps the sidebar fully populated on
  // /profile, /accounts, and /dashboard.
  const workspaceAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const workspaceTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  const accountId = urlAccountId ?? workspaceAccountId ?? null;
  const teamId = urlTeamId ?? workspaceTeamId ?? null;

  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Teams under the active (URL or workspace) account.
  const { data: teamsResponse } = useGetUserTeamsQuery(
    { accountId: accountId ?? undefined },
    { skip: !accountId },
  );
  const teams = teamsResponse?.teams ?? [];

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

  // ------------------------------------------------------------
  // URL builders — the sidebar is scoped to /dashboard/:accountId/:teamId
  // ------------------------------------------------------------
  const accountBase = accountId ? `/dashboard/${accountId}` : '/accounts';
  const teamBase =
    accountId && teamId ? `${accountBase}/${teamId}` : accountBase;

  const buildTeamNavHref = (segment: string) => {
    if (!accountId || !teamId) return '/accounts';
    return segment === '' ? teamBase : `${teamBase}/${segment}`;
  };

  const buildAccountHref = (segment: string) => {
    if (!accountId) return '/accounts';
    return segment === '' ? accountBase : `${accountBase}/${segment}`;
  };

  const buildTeamHref = (id: string) => {
    if (!accountId) return '/accounts';
    return `${accountBase}/${id}`;
  };

  const isTeamNavActive = (segment: string) => {
    if (!accountId || !teamId) return false;
    if (segment === '') return pathname === teamBase;
    const href = `${teamBase}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Only highlight the active team when the URL actually carries it,
  // so nothing looks "selected" on /profile.
  const isTeamActive = (id: string) => urlTeamId === id;

  const isProfileActive =
    pathname === '/profile' || pathname.startsWith('/profile/');

  const isAccountSettingsActive = pathname.startsWith(
    `${accountBase}/settings`,
  );

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
        {/* Toggle header */}
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* Section 1: team-scoped nav */}
          <nav className="px-3 py-3 space-y-0.5">
            {TEAM_NAV_ITEMS.map((item) => {
              const isActive = isTeamNavActive(item.segment);
              const Icon = item.icon;
              const isTrash = item.isTrash;

              if (collapsed) {
                return (
                  <Link
                    key={item.segment || 'root'}
                    href={buildTeamNavHref(item.segment)}
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
                );
              }

              return (
                <Link
                  key={item.segment || 'root'}
                  href={buildTeamNavHref(item.segment)}
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
              );
            })}
          </nav>

          {/* ============================================================
              Section 2: Teams dropdown — conspicuous
          ============================================================ */}
          {accountId && (
            <>
              <div className="border-t border-border/50" />

              {/* Expanded list */}
              {!collapsed && (
                <div className="py-3 px-3">
                  {/* Toggle button with count badge */}
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

                    {/* Count badge */}
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
                      {/* Teams list */}
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
                            const Icon =
                              team.type === 'personal' ? Home : Building2;
                            return (
                              <Link
                                key={team.id}
                                href={buildTeamHref(team.id)}
                                className={cn(
                                  'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                                    : 'text-foreground/80 hover:bg-accent/60 hover:text-foreground',
                                )}
                              >
                                {/* Left accent bar on the active team */}
                                {isActive && (
                                  <span
                                    aria-hidden
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary"
                                  />
                                )}

                                <Icon
                                  className={cn(
                                    'h-4 w-4 shrink-0',
                                    isActive
                                      ? 'text-primary'
                                      : 'text-foreground/60',
                                  )}
                                />
                                <span className="truncate flex-1">
                                  {team.display_name || team.name}
                                </span>
                                {isActive && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Actions — primary-tinted inside the container */}
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
                          href={`${accountBase}/teams`}
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

              {/* Collapsed: single icon that expands the rail */}
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

          {/* ============================================================
              Section 3: global actions
          ============================================================ */}
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