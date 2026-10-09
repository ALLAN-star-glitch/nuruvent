/* eslint-disable react-hooks/set-state-in-effect */
// components/layout/UserMenu.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  LayoutDashboard,
  User,
  Calendar,
  Users,
  Award,
  CreditCard,
  Settings,
  LogOut,
  Video,
  Trash2,
  ChevronDown,
  ClipboardList,
  Ticket,
  Home,
  Building2,
  Check,
  Plus,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Mail,
  UserPlus,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { clearWorkspace } from '@/lib/store/slices/workspaceSlice';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { useGetMyProfileQuery } from '@/lib/store/api/profileApi';
import { LogoutDialog } from '../ui/LogoutDialog';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { cn } from '@/lib/utils';
import { accountLabel } from '@/lib/utils/account-label';
import type { Account } from '@/lib/types/account';
import type { Team } from '@/lib/types/team';
import { buildTeamSwitchHref } from '@/lib/utils/team-switch';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

// ============================================================
// LEFT RAIL SECTIONS
// ============================================================

type SectionKey = 'actions' | 'teams' | 'account' | 'preferences';

const SECTIONS: Array<{
  key: SectionKey;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: 'actions', label: 'Quick Actions', icon: LayoutDashboard },
  { key: 'teams', label: 'Teams', icon: Users },
  { key: 'account', label: 'Account', icon: User },
  { key: 'preferences', label: 'Preferences', icon: Settings },
];

// ============================================================
// QUICK LINKS
// ============================================================

const QUICK_LINKS = [
  { label: 'Events', segment: 'events', icon: Calendar },
  { label: 'Registrations', segment: 'registrations', icon: ClipboardList },
  { label: 'Tickets', segment: 'tickets', icon: Ticket },
  { label: 'Attendees', segment: 'attendees', icon: Users },
  { label: 'Certificates', segment: 'certificates', icon: Award },
  { label: 'Payments', segment: 'payments', icon: CreditCard },
  { label: 'Replays', segment: 'replays', icon: Video },
  { label: 'Trash', segment: 'trash', icon: Trash2, isTrash: true },
];

// ============================================================
// COMPONENT
// ============================================================

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
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
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('actions');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: profile } = useGetMyProfileQuery();
  const { data: accounts } = useGetMyAccountsQuery();
  const { data: teamsData } = useGetUserTeamsQuery();

  const teams = teamsData?.teams ?? [];

  const accountById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts?.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const avatarUrl = profile?.avatar_url || user?.avatar || undefined;
  const displayName = profile?.display_name || user?.name || 'Account';
  const email = profile?.email || user?.email || '';

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (containerRef.current?.contains(target)) return;
      if (target.closest('[data-user-menu-panel]')) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const getUserInitials = () => {
    const source = displayName || user?.name;
    if (!source) return 'U';
    return source
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
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

  const openLogoutDialog = () => {
    setOpen(false);
    setShowLogoutDialog(true);
  };

  const openInviteDialog = () => {
    setOpen(false);
    setInviteOpen(true);
  };

  const teamBase =
    accountId && teamId ? `/dashboard/${accountId}/${teamId}` : null;

  const buildQuickLink = (segment: string) =>
    teamBase ? `${teamBase}/${segment}` : '/accounts';

  const dashboardHref = teamBase ?? '/dashboard';
  const settingsHref = accountId
    ? `/dashboard/${accountId}/settings`
    : '/accounts';
  const newTeamHref = accountId
    ? `/dashboard/${accountId}/teams/new`
    : '/accounts';
  const teamSettingsHref = teamBase ? `${teamBase}/settings` : null;

  // ============================================================
  // ACCOUNT LOGO (reused in team rows)
  // ============================================================

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

  // ============================================================
  // TEAM ROW (used in the Teams panel)
  // ============================================================

  const renderTeamRow = (team: Team) => {
    const isActive = team.id === teamId;
    const teamAccount = accountById.get(team.account_id);
    const label = teamAccount
      ? accountLabel(teamAccount)
      : 'Unknown Account';

    return (
      <button
        key={team.id}
        type="button"
        onClick={() => {
          setOpen(false);
          router.push(
            buildTeamSwitchHref(pathname, team.account_id, team.id),
          );
        }}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
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

        {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
      </button>
    );
  };

  // ============================================================
  // DESKTOP PANEL RENDERER
  // ============================================================

  const renderPanel = () => {
    switch (activeSection) {
      case 'actions':
        return (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Quick Actions
            </p>
            <button
              type="button"
              onClick={() => navigateTo(dashboardHref)}
              className="flex w-full items-center gap-3 rounded-lg bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10 cursor-pointer"
            >
              <div className="rounded-lg bg-primary p-1.5 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">
                  Dashboard
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Full dashboard with all features
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary/60" />
            </button>

            <div className="my-2 h-px bg-border" />

            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              const href = buildQuickLink(item.segment);
              return (
                <button
                  key={item.segment}
                  type="button"
                  onClick={() => navigateTo(href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer',
                    item.isTrash
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground hover:bg-accent',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      item.isTrash
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Your Teams
            </p>

            {teams.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No teams yet
              </p>
            ) : (
              teams.map(renderTeamRow)
            )}

            {/* Team-scoped management — only when a team is active */}
            {teamId && accountId && teamSettingsHref && (
              <>
                <div className="my-2 h-px bg-border" />

                <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Manage this team
                </p>

                <button
                  type="button"
                  onClick={() => navigateTo(`${teamSettingsHref}#general`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
                >
                  <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">Team settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(`${teamSettingsHref}#members`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
                >
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">Members</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(`${teamSettingsHref}#invitations`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
                >
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">Invitations</span>
                </button>

                <button
                  type="button"
                  onClick={openInviteDialog}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">Invite member</span>
                </button>
              </>
            )}

            <div className="my-2 h-px bg-border" />

            <button
              type="button"
              onClick={() => navigateTo(newTeamHref)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Create new team</span>
            </button>

            {accountId && (
              <button
                type="button"
                onClick={() => navigateTo(`/dashboard/${accountId}/teams`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Manage teams</span>
              </button>
            )}
          </div>
        );

      case 'account':
        return (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Account
            </p>
            <button
              type="button"
              onClick={() => navigateTo('/profile')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">My Profile</p>
                <p className="truncate text-xs text-muted-foreground">
                  Name, avatar, contact details
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigateTo(settingsHref)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">Account Settings</p>
                <p className="truncate text-xs text-muted-foreground">
                  Name, logo, members, billing
                </p>
              </div>
            </button>
            <div className="my-2 h-px bg-border" />
            <button
              type="button"
              onClick={openLogoutDialog}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Preferences
            </p>
            <button
              type="button"
              onClick={() => navigateTo('/profile')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Settings</span>
            </button>
            <a
              href="https://nuruvent.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-foreground transition-colors hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">Help & Docs</span>
            </a>
          </div>
        );
    }
  };

  // ============================================================
  // DESKTOP MEGA MENU
  // ============================================================

  const desktopMenuPanel = (
    <div
      data-user-menu-panel
      className={cn(
        'z-[9999] overflow-hidden border border-border bg-popover text-popover-foreground shadow-2xl',
        'animate-in fade-in slide-in-from-top-2 duration-200',
        'fixed right-4 top-16 flex w-[560px] max-w-[95vw] flex-row rounded-2xl',
      )}
    >
      <div className="w-56 shrink-0 border-r border-border bg-muted/40 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-background p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-1 truncate text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        <nav className="space-y-0.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span className={cn('text-sm', isActive && 'font-medium')}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={openLogoutDialog}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-8rem)]">
        {renderPanel()}
      </div>
    </div>
  );

  // ============================================================
  // MOBILE SIMPLE DROPDOWN
  // ============================================================

  const mobileMenuPanel = (
    <div
      data-user-menu-panel
      className={cn(
        'z-[9999] overflow-hidden border border-border bg-popover text-popover-foreground shadow-2xl',
        'animate-in fade-in slide-in-from-top-2 duration-200',
        'fixed inset-x-3 top-16 rounded-2xl',
      )}
    >
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-1 truncate text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </p>
          <button
            type="button"
            onClick={() => navigateTo(dashboardHref)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo(buildQuickLink('events'))}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Events</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo(buildQuickLink('registrations'))}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Registrations</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo(buildQuickLink('tickets'))}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Tickets</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo(buildQuickLink('attendees'))}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Attendees</span>
          </button>
        </div>

        {/* Teams (mobile) */}
        <div className="border-t border-border p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Teams
          </p>
          {teams.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              No teams yet
            </p>
          ) : (
            teams.map(renderTeamRow)
          )}

          {teamId && teamSettingsHref && (
            <>
              <button
                type="button"
                onClick={() => navigateTo(teamSettingsHref)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Team settings</span>
              </button>

              <button
                type="button"
                onClick={openInviteDialog}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Invite member</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => navigateTo(newTeamHref)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Create new team</span>
          </button>
        </div>

        {/* Account */}
        <div className="border-t border-border p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <button
            type="button"
            onClick={() => navigateTo('/profile')}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">My Profile</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo(settingsHref)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">Account Settings</span>
          </button>
        </div>

        {/* Sign out */}
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={openLogoutDialog}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex items-center gap-2 h-9 px-2 rounded-lg cursor-pointer outline-none transition-colors',
            'text-foreground hover:bg-accent',
            open && 'bg-accent',
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {displayName}
          </span>
          <ChevronDown
            className={cn(
              'hidden h-4 w-4 text-muted-foreground transition-transform sm:block',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>

      {open &&
        mounted &&
        createPortal(
          isMobile ? mobileMenuPanel : desktopMenuPanel,
          document.body,
        )}

      {teamId && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={teamId}
        />
      )}

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </>
  );
}