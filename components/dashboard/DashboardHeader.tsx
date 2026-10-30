/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  Menu,
  PlusCircle,
  LogOut,
  Search,
  X,
  ExternalLink,
  Settings,
  Building2,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { SearchBar } from '@/components/layout/SearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { Logo } from '@/components/shared/Logo';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { clearWorkspace } from '@/lib/store/slices/workspaceSlice';
import { useGetMyMembershipQuery } from '@/lib/store/api/accountsApi';
import { LogoutDialog } from '../ui/LogoutDialog';
import { useState, useEffect, useMemo } from 'react';

// ============================================================
// DASHBOARD NAV ITEMS (For mobile drawer)
// ============================================================

import {
  Calendar,
  ClipboardList,
  Users,
  CreditCard,
  Award,
  Clapperboard,
  Trash2,
  TicketCheckIcon,
  type LucideIcon,
} from 'lucide-react';
import { TeamsNavItem } from '../layout/TeamsNavItem';
import type { AccountRole } from '@/lib/types/account';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  segment: string;
  label: string;
  icon: LucideIcon;
  isTrash?: boolean;
  organizersOnly?: boolean;
  disabled?: boolean;
}

const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { segment: '', label: 'Dashboard', icon: LayoutDashboard },
  { segment: 'events', label: 'Team Events', icon: Calendar },
  { segment: 'registrations', label: 'Registrations', icon: ClipboardList, organizersOnly: true },
  { segment: 'tickets', label: 'My Tickets', icon: TicketCheckIcon },
  { segment: 'attendees', label: 'Attendees', icon: Users, organizersOnly: true },
  { segment: 'payments', label: 'Payments', icon: CreditCard },
  { segment: 'certificates', label: 'Certificates', icon: Award },
  { segment: 'certificates/templates', label: 'Templates', icon: Award, organizersOnly: true },
  { segment: 'replays', label: 'Replays', icon: Clapperboard, disabled: true },
  { segment: 'trash', label: 'Trash', icon: Trash2, isTrash: true },
  { segment: 'settings', label: 'Settings', icon: Settings },
];

// ============================================================
// TYPES
// ============================================================

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// ============================================================
// COMPONENT
// ============================================================

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ accountId?: string; teamId?: string }>();

  // Get IDs from URL params first, fallback to Redux workspace state
  const urlAccountId = params?.accountId;
  const urlTeamId = params?.teamId;
  const reduxAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const reduxTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  const accountId = urlAccountId ?? reduxAccountId ?? null;
  const teamId = urlTeamId ?? reduxTeamId ?? null;

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  // Note: useGetMyMembershipQuery needs a real account ID. If the user is on 
  // the public site and we have a cached reduxAccountId, it will work.
  const { data: myMembership } = useGetMyMembershipQuery(
    accountId ?? '',
    { skip: !accountId },
  );

  const isOrganizer = useMemo(() => {
    const role = myMembership?.role as AccountRole | undefined;
    return role === 'account_admin' || role === 'trainer';
  }, [myMembership]);

  // Check if we are inside the dashboard or on the public site
  const isDashboardRoute = pathname.startsWith('/dashboard');

  const goCreateEvent = () => {
    if (!accountId || !teamId) return;
    router.push(`/dashboard/${accountId}/${teamId}/events/new`);
  };
  
  const goCreateTeam = () => {
    if (!accountId) return;
    router.push(`/dashboard/${accountId}/teams/new`);
  };
  
  const goCreateWorkspace = () => {
    router.push('/accounts/new');
  };

  const goCreateCertificate = () => {
    if (!accountId) return;
    router.push(`/dashboard/${accountId}/certificates/templates/new`);
  };

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const buildTeamNavHref = (segment: string) => {
    if (segment === '') return '/dashboard';
    if (!accountId || !teamId) return '/accounts';
    
    if (segment === 'certificates') {
      if (isOrganizer) {
        return `/dashboard/${accountId}/certificates`;
      }
      return '/me/certificates';
    }
    
    if (segment === 'certificates/templates') {
      return `/dashboard/${accountId}/certificates/templates`;
    }

    return `/dashboard/${accountId}/${teamId}/${segment}`;
  };

  const isTeamNavActive = (segment: string) => {
    if (segment === '') return pathname === '/dashboard';
    if (!accountId || !teamId) return false;

    if (segment === 'certificates') {
      if (isOrganizer) {
        return pathname === `/dashboard/${accountId}/certificates`;
      }
      return pathname.startsWith('/me/certificates');
    }

    if (segment === 'certificates/templates') {
      return pathname.startsWith(`/dashboard/${accountId}/certificates/templates`);
    }

    const href = `/dashboard/${accountId}/${teamId}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isPublicActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Now hasTeamContext relies on the Redux fallback, so it stays true even on public routes
  const hasTeamContext = Boolean(accountId && teamId);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-2.5 sm:px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 md:gap-3">
            
            {/* Left: Drawer Menu + Brand + Team Switcher (Mobile exact original) */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 xl:flex-none xl:w-auto shrink-0">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors cursor-pointer shrink-0"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="p-0 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col h-full bg-background border-r border-border"
                >
                  <SheetHeader className="p-4 border-b border-border flex-row items-center justify-between space-y-0 text-left shrink-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </SheetHeader>

                  <div className="p-3 flex-1 overflow-y-auto space-y-5">
                    <TeamSwitcher variant="drawer" />

                  {hasTeamContext && (
                    <div>
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Menu
                      </p>
                      <nav className="space-y-0.5">
                        {/* Dashboard — always first */}
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDrawerOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                            isTeamNavActive('')
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          )}
                        >
                          <LayoutDashboard
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isTeamNavActive('') ? 'text-primary' : 'text-muted-foreground',
                            )}
                          />
                          <span>Dashboard</span>
                        </Link>

                        {/* Teams — expandable dropdown */}
                        <TeamsNavItem
                          accountId={accountId}
                          onNavigate={(href) => {
                            setIsDrawerOpen(false);
                            router.push(href);
                          }}
                        />

                        {/* Everything else (excluding root & teams) */}
                        {DASHBOARD_NAV_ITEMS.filter(
                          (i) => i.segment !== '' && i.segment !== 'teams' && (!i.organizersOnly || isOrganizer),
                        ).map((item) => {
                          const isActive = isTeamNavActive(item.segment);
                          const Icon = item.icon;
                          const isTrash = item.isTrash;

                          if (item.disabled) {
                            return (
                              <div
                                key={item.segment}
                                className="flex items-center justify-between px-3 py-2.5 text-muted-foreground/60 cursor-not-allowed select-none"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 shrink-0" />
                                  <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  Soon
                                </span>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={item.segment}
                              href={buildTeamNavHref(item.segment)}
                              prefetch={false}
                              onClick={() => setIsDrawerOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                isActive
                                  ? isTrash
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-primary/10 text-primary'
                                  : isTrash
                                    ? 'text-destructive hover:bg-destructive/10'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive
                                    ? isTrash
                                      ? 'text-destructive'
                                      : 'text-primary'
                                    : isTrash
                                      ? 'text-destructive'
                                      : 'text-muted-foreground',
                                )}
                              />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  )}

                    <div>
                      <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Explore Nuruvent
                        </p>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <nav className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                          const isActive = isPublicActive(item.href);
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsDrawerOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive ? 'text-primary' : 'text-muted-foreground',
                                )}
                              />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border bg-muted shrink-0 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setShowLogoutDialog(true);
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-destructive" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Logging out...</span>
                        </div>
                      ) : (
                        <>
                          <LogOut className="h-5 w-5 shrink-0 text-destructive" />
                          <span className="text-sm font-medium">Logout</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Nuruvent logo — hidden on mobile, visible from md upward. */}
              <span className="hidden md:inline-flex items-center shrink-0">
                <Logo
                  width={120}
                  className="w-22 md:w-25 lg:w-30"
                />
              </span>

              {/* Team switcher — always on mobile */}
              <div className="min-w-0 flex-1 max-w-none md:max-w-[280px] lg:max-w-[260px] xl:hidden">
                <TeamSwitcher variant="compact" />
              </div>

            </div>

            {/* Middle: Search + Create New + Theme (Desktop only) */}
            <div className="hidden xl:flex items-center flex-1 mx-4 lg:mx-6 justify-center gap-3 min-w-0">
              
              {/* Search bar with minimum width to prevent squeezing */}
              <div className="flex-1 min-w-[300px] max-w-2xl relative">
                <SearchBar />
              </div>
              
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="cursor-pointer gap-1.5 bg-primary hover:bg-primary/90 text-white dark:text-white shadow-sm hover:shadow-md px-3 md:px-4 py-2 h-9 text-sm font-medium"
                    >
                      <PlusCircle className="h-4 w-4 shrink-0" />
                      <span className="hidden 2xl:inline">Create New</span>
                      <ChevronDown className="h-3 w-3 opacity-80 hidden 2xl:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={goCreateEvent}
                      disabled={!hasTeamContext}
                      className="cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Event
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={goCreateTeam}
                      disabled={!accountId}
                      className="cursor-pointer"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Team
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={goCreateCertificate}
                      disabled={!accountId}
                      className="cursor-pointer"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Certificate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={goCreateWorkspace} className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Theme Toggle — Restored here for desktop */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors cursor-pointer"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
              >
                {isMobileSearchOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Create New — Mobile (visible < xl) */}
              <div className="hidden sm:block xl:hidden shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="cursor-pointer gap-1.5 bg-primary hover:bg-primary/90 text-white dark:text-white shadow-sm hover:shadow-md px-3 md:px-4 py-2 h-9 text-sm font-medium"
                    >
                      <PlusCircle className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={goCreateEvent}
                      disabled={!hasTeamContext}
                      className="cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Event
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={goCreateTeam}
                      disabled={!accountId}
                      className="cursor-pointer"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Team
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={goCreateCertificate}
                      disabled={!accountId}
                      className="cursor-pointer"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Certificate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={goCreateWorkspace} className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Theme Toggle — Mobile (visible < xl) */}
              <div className="xl:hidden">
                <ThemeToggle />
              </div>

              {/* Team Switcher — ONLY show on very large screens AND if inside dashboard */}
              {isDashboardRoute && (
                <div className="hidden 2xl:block w-[220px] shrink-0">
                  <TeamSwitcher variant="compact" />
                </div>
              )}

              {/* GO TO DASHBOARD BUTTON — Conspicuous, next to user menu, only on public routes */}
              {!isDashboardRoute && (
                <Link href="/dashboard">
                  <Button
                    className="hidden xl:flex h-9 px-4 gap-2 bg-primary hover:bg-primary/90 text-white dark:text-white font-semibold shadow-sm cursor-pointer mr-1"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              )}

              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>

          {/* Mobile search dropdown */}
          <div
            className={cn(
              'xl:hidden transition-all duration-300 ease-in-out relative z-20',
              isMobileSearchOpen
                ? 'max-h-16 pb-2 opacity-100'
                : 'max-h-0 opacity-0 overflow-hidden',
            )}
          >
            <SearchBar />
          </div>
        </div>
      </div>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </header>
  );
}