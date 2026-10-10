// components/layout/MobileBottomNav.tsx

'use client';

import { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  MoreHorizontal,
  ClipboardList,
  Users,
  CreditCard,
  Award,
  Clapperboard,
  Trash2,
  Settings,
  User,
  Building2,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { clearWorkspace } from '@/lib/store/slices/workspaceSlice';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LogoutDialog } from '@/components/ui/LogoutDialog';

// ============================================================
// TYPES & CONSTANTS
// ============================================================

interface PrimaryNavItem {
  key: 'dashboard' | 'events' | 'tickets';
  label: string;
  icon: LucideIcon;
  segment: string;
}

interface MoreNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  segment?: string;
  isTrash?: boolean;
  section?: 'workspace' | 'account';
}

const PRIMARY_ITEMS: PrimaryNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, segment: '' },
  { key: 'events', label: 'Team Events', icon: Calendar, segment: 'events' },
  { key: 'tickets', label: 'My Tickets', icon: Ticket, segment: 'tickets' },
];

// ============================================================
// COMPONENT
// ============================================================

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ accountId?: string; teamId?: string }>();

  const urlAccountId = params?.accountId ?? null;
  const urlTeamId = params?.teamId ?? null;

  const workspaceAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const workspaceTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  const accountId = urlAccountId ?? workspaceAccountId ?? null;
  const teamId = urlTeamId ?? workspaceTeamId ?? null;

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (!isAuthenticated) return null;

  const teamBase =
    accountId && teamId ? `/dashboard/${accountId}/${teamId}` : null;

  const moreItems: MoreNavItem[] = [
    // Team-scoped items
    { key: 'registrations', label: 'Registrations', icon: ClipboardList, segment: 'registrations', section: 'workspace' },
    { key: 'attendees', label: 'Attendees', icon: Users, segment: 'attendees', section: 'workspace' },
    { key: 'payments', label: 'Payments', icon: CreditCard, segment: 'payments', section: 'workspace' },
    { key: 'certificates', label: 'Certificates', icon: Award, segment: 'certificates', section: 'workspace' },
    { key: 'replays', label: 'Replays', icon: Clapperboard, segment: 'replays', section: 'workspace' },
    { key: 'trash', label: 'Trash', icon: Trash2, segment: 'trash', isTrash: true, section: 'workspace' },

    // Account-scoped items
    {
      key: 'teams',
      label: 'Teams',
      icon: Building2,
      href: accountId ? `/dashboard/${accountId}/teams` : '/accounts',
      section: 'account',
    },
    {
      key: 'settings',
      label: 'Account Settings',
      icon: Settings,
      href: accountId ? `/dashboard/${accountId}/settings` : '/accounts',
      section: 'account',
    },
    {
      key: 'profile',
      label: 'My Profile',
      icon: User,
      href: '/profile',
      section: 'account',
    },
  ];

  const buildHref = (item: MoreNavItem) => {
    if (item.href) return item.href;
    if (!item.segment) return '/accounts';
    if (!teamBase) return '/accounts';
    return item.segment === '' ? teamBase : `${teamBase}/${item.segment}`;
  };

  const isActive = (item: MoreNavItem) => {
    const href = buildHref(item);
    if (item.href) {
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    if (!teamBase || item.segment === undefined) return false;
    if (item.segment === '') return pathname === teamBase;
    const scoped = `${teamBase}/${item.segment}`;
    return pathname === scoped || pathname.startsWith(`${scoped}/`);
  };

  const isMoreActive =
    moreItems.some((item) => isActive(item)) ||
    pathname.startsWith('/profile') ||
    (accountId ? pathname.startsWith(`/dashboard/${accountId}/settings`) : false);

  const isPrimaryActive = (segment: string) => {
    if (!teamBase) return false;
    if (segment === '') return pathname === teamBase;
    const href = `${teamBase}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const workspaceItems = moreItems.filter((i) => i.section === 'workspace');
  const accountItems = moreItems.filter((i) => i.section === 'account');

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(clearAuth());
      dispatch(clearWorkspace());
      setIsMoreOpen(false);
      router.push('/');
    }
  };

  const openLogoutDialog = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMoreOpen(false);
    setShowLogoutDialog(true);
  };

  return (
    <>
      {/* Flush Edge-to-Edge Bottom Navigation */}
      <nav
        aria-label="Bottom navigation"
        className={cn(
          'md:hidden',
          'fixed inset-x-0 bottom-0 z-40',
          'border-t border-border/80 bg-background/95 backdrop-blur-xl',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
          'pb-[env(safe-area-inset-bottom)] transition-all duration-300'
        )}
      >
        <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isPrimaryActive(item.segment);
            return (
              <li key={item.key} className="flex-1">
                <Link
                  href={
                    teamBase
                      ? item.segment === ''
                        ? teamBase
                        : `${teamBase}/${item.segment}`
                      : '/accounts'
                  }
                  prefetch={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-1',
                    'select-none transition-all duration-200 ease-out active:scale-95',
                    active
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <span className="absolute inset-x-1 inset-y-0.5 rounded-lg bg-primary/10 transition-all duration-300" />
                  )}

                  <Icon
                    className={cn(
                      'relative h-5 w-5 transition-transform duration-200',
                      active ? 'scale-110 text-primary stroke-[2.25px]' : 'stroke-[1.75px]'
                    )}
                  />
                  <span className="relative text-[10px] tracking-tight leading-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* More Action Sheet Button */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
              className={cn(
                'relative flex w-full flex-col items-center justify-center gap-1 rounded-lg py-2 px-1',
                'select-none transition-all duration-200 ease-out active:scale-95',
                isMoreActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isMoreActive && (
                <span className="absolute inset-x-1 inset-y-0.5 rounded-lg bg-primary/10 transition-all duration-300" />
              )}

              <MoreHorizontal
                className={cn(
                  'relative h-5 w-5 transition-transform duration-200',
                  isMoreActive ? 'scale-110 text-primary stroke-[2.25px]' : 'stroke-[1.75px]'
                )}
              />
              <span className="relative text-[10px] tracking-tight leading-none">
                More
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Dynamic Slide-Up Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent
          side="bottom"
          className={cn(
            'z-50 rounded-t-[24px] border-t border-border/60 bg-background/95 backdrop-blur-2xl px-0 pb-0',
            'shadow-2xl'
          )}
          showCloseButton={false}
        >
          {/* Grab Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
          </div>

          <SheetHeader className="border-b border-border/50 px-6 py-3 text-left">
            <SheetTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
              Navigation
            </SheetTitle>
          </SheetHeader>

          <div className="max-h-[72vh] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 space-y-4">
            {/* Workspace Group */}
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                Workspace
              </div>
              <ul className="space-y-1">
                {workspaceItems.map((item) => renderSheetItem(item))}
              </ul>
            </div>

            <hr className="border-border/40 my-2" />

            {/* Account Group */}
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                Account & Settings
              </div>
              <ul className="space-y-1">
                {accountItems.map((item) => renderSheetItem(item))}
              </ul>
            </div>

            <hr className="border-border/40 my-2" />

            {/* Log out */}
            <ul className="space-y-1 pb-1">
              <li>
                <button
                  type="button"
                  onClick={openLogoutDialog}
                  disabled={isLoggingOut}
                  className={cn(
                    'group flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-all duration-150',
                    'text-destructive hover:bg-destructive/10 active:bg-destructive/15',
                    isLoggingOut && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <LogOut className="h-5 w-5 shrink-0 text-destructive transition-transform duration-200 group-hover:scale-105" />
                    <span className="text-sm font-medium">
                      {isLoggingOut ? 'Logging out…' : 'Log Out'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-destructive opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                </button>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );

  function renderSheetItem(item: MoreNavItem) {
    const Icon = item.icon;
    const active = isActive(item);
    const isTrash = item.isTrash;

    return (
      <li key={item.key}>
        <Link
          href={buildHref(item)}
          prefetch={false}
          onClick={() => setIsMoreOpen(false)}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'group flex items-center justify-between rounded-xl px-3.5 py-3 transition-all duration-150',
            active
              ? isTrash
                ? 'bg-destructive/10 text-destructive font-semibold'
                : 'bg-primary/10 text-primary font-semibold'
              : isTrash
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground hover:bg-muted/60 active:bg-muted'
          )}
        >
          <div className="flex items-center gap-3.5">
            <Icon
              className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                isTrash
                  ? 'text-destructive'
                  : active
                    ? 'text-primary stroke-[2.25px]'
                    : 'text-muted-foreground'
              )}
            />
            <span className="text-sm">{item.label}</span>
          </div>
          <ChevronRight
            className={cn(
              'h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5',
              active ? 'opacity-100 text-primary' : 'text-muted-foreground'
            )}
          />
        </Link>
      </li>
    );
  }
}