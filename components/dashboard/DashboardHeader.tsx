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
import { LogoutDialog } from '../ui/LogoutDialog';
import { useState, useEffect } from 'react';

// ============================================================
// DASHBOARD NAV ITEMS
// ============================================================

import {
  LayoutDashboard,
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

interface NavItem {
  segment: string;
  label: string;
  icon: LucideIcon;
  isTrash?: boolean;
}

const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { segment: '', label: 'Dashboard', icon: LayoutDashboard },
  { segment: 'events', label: 'Events', icon: Calendar },
  { segment: 'registrations', label: 'Registrations', icon: ClipboardList },
  { segment: 'tickets', label: 'My Tickets', icon: TicketCheckIcon },
  { segment: 'attendees', label: 'Attendees', icon: Users },
  { segment: 'payments', label: 'Payments', icon: CreditCard },
  { segment: 'certificates', label: 'Certificates', icon: Award },
  { segment: 'replays', label: 'Replays', icon: Clapperboard },
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

  const accountId = params?.accountId;
  const teamId = params?.teamId;

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

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

  const handleCreateEvent = () => {
    if (accountId && teamId) {
      router.push(`/dashboard/${accountId}/${teamId}/events/new`);
    } else {
      router.push('/dashboard');
    }
  };

  const buildTeamNavHref = (segment: string) => {
    if (segment === '') return '/dashboard';
    if (!accountId || !teamId) return '/accounts';
    return `/dashboard/${accountId}/${teamId}/${segment}`;
  };

  const isTeamNavActive = (segment: string) => {
    if (segment === '') return pathname === '/dashboard';
    if (!accountId || !teamId) return false;
    const href = `/dashboard/${accountId}/${teamId}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isPublicActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasTeamContext = Boolean(accountId && teamId);

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-[#202124] dark:border-[#3C4043]/80 dark:backdrop-blur-sm dark:bg-[#202124]/95">
      <div className="container mx-auto px-2.5 sm:px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 md:gap-3">
            {/* Left: Drawer Menu + Brand + Team Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[520px]">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#3C4043] cursor-pointer shrink-0"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="p-0 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col h-full bg-white dark:bg-[#202124] border-r dark:border-[#3C4043]"
                >
                  <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between space-y-0 text-left shrink-0 dark:border-[#3C4043]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </SheetHeader>

                  <div className="p-3 flex-1 overflow-y-auto space-y-5">
                    <TeamSwitcher variant="drawer" />

                  {hasTeamContext && (
                    <div>
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">
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
                              ? 'bg-primary/10 text-primary dark:bg-primary/20'
                              : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white',
                          )}
                        >
                          <LayoutDashboard
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isTeamNavActive('')
                                ? 'text-primary'
                                : 'text-gray-400 dark:text-gray-500',
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
                          (i) => i.segment !== '' && i.segment !== 'teams',
                        ).map((item) => {
                          const isActive = isTeamNavActive(item.segment);
                          const Icon = item.icon;
                          const isTrash = item.isTrash;

                          return (
                            <Link
                              key={item.segment}
                              href={buildTeamNavHref(item.segment)}
                              onClick={() => setIsDrawerOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                isActive
                                  ? isTrash
                                    ? 'bg-destructive/10 text-destructive dark:bg-destructive/20'
                                    : 'bg-primary/10 text-primary dark:bg-primary/20'
                                  : isTrash
                                    ? 'text-destructive hover:bg-destructive/10'
                                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white',
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
                                      : 'text-gray-400 dark:text-gray-500',
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">
                          Explore Nuruvent
                        </p>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
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
                                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                  : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white',
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive
                                    ? 'text-primary'
                                    : 'text-gray-400 dark:text-gray-500',
                                )}
                              />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3 dark:border-[#3C4043] dark:bg-[#2D2E32]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setShowLogoutDialog(true);
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-500 hover:bg-red-50/50 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-red-400" viewBox="0 0 24 24">
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
                          <LogOut className="h-5 w-5 shrink-0 text-red-400" />
                          <span className="text-sm font-medium">Logout</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-[#3C4043]">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold flex items-center justify-center text-sm shrink-0 dark:from-primary/30 dark:to-primary/10">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Brand — smaller on mobile, full size on lg+ */}
              <span className="inline-flex items-center shrink-0">
                <span className="lg:hidden">
                  <Logo width={90} />
                </span>
                <span className="hidden lg:inline-flex">
                  <Logo width={120} />
                </span>
              </span>

              {/* Team switcher — always visible, compact on small screens */}
              <div className="min-w-0 flex-1 max-w-[220px] sm:max-w-[280px] lg:max-w-[260px]">
                <TeamSwitcher variant="compact" />
              </div>

              {/* Team settings shortcut — only when inside a team */}
              {hasTeamContext && (
                <Link
                  href={`/dashboard/${accountId}/${teamId}/settings`}
                  aria-label="Team settings"
                  className="hidden sm:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Search (desktop) */}
            <div className="hidden xl:flex items-center flex-1 max-w-2xl mx-4 justify-center">
              <div className="w-full max-w-xl relative">
                <SearchBar />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#3C4043] cursor-pointer"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
              >
                {isMobileSearchOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              <button
                type="button"
                onClick={handleCreateEvent}
                className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all px-2.5 sm:px-3 md:px-4 py-1.5 md:py-2 h-8 md:h-9 text-xs md:text-sm font-medium rounded-md cursor-pointer shrink-0"
              >
                <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span>Create Event</span>
              </button>

              <ThemeToggle />
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