// components/dashboard/DashboardHeader.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  CreditCard, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Award, 
  Settings,
  PlusCircle,
  DollarSign,
  Video,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Gift,
  Zap,
  Clock,
  TrendingUp,
  Search,
  X
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { SearchBar } from '@/components/layout/SearchBar';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { UserMenu } from '@/components/layout/UserMenu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth, UserRole } from '@/lib/store/slices/authSlice';
import { LogoutDialog } from '../ui/LogoutDialog';
import { useState, useRef, useEffect } from 'react';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
}

// Quick action items for dropdown
const quickActions = [
  { href: '/dashboard/events/new', label: 'Create Event', icon: PlusCircle, color: 'text-primary' },
  { href: '/dashboard/events', label: 'Manage Events', icon: Calendar, color: 'text-blue-500' },
  { href: '/dashboard/attendees', label: 'View Attendees', icon: Users, color: 'text-emerald-500' },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  // If not authenticated, don't show this header
  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearAuth());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearAuth());
      router.push('/');
    }
  };

  const handleCreateEvent = () => {
    router.push('/dashboard/events/new');
  };

  // Close quick actions on click outside
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="p-0 w-[300px] sm:w-[340px] flex flex-col h-full bg-white">
                  <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between space-y-0 text-left shrink-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </SheetHeader>

                  <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    {/* Main Website Navigation - Only this remains */}
                    <div>
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                      </p>
                      <nav className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900'
                                )}
                              >
                                <Icon className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive ? 'text-primary' : 'text-gray-400'
                                )} />
                                <span>{item.label}</span>
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  {/* Drawer Footer - Logout and User */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={() => setShowLogoutDialog(true)}
                      disabled={isLoading}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-500 hover:bg-red-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-red-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm font-medium">Logging out...</span>
                        </div>
                      ) : (
                        <>
                          <LogOut className="h-5 w-5 shrink-0 text-red-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium group-hover:text-red-600 transition-colors">Logout</span>
                        </>
                      )}
                    </button>

                    {/* User Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/dashboard" className="inline-flex items-center shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                <Logo />
              </Link>
            </div>

            {/* Search Bar - Desktop: full bar, Tablet/Mobile: hidden (toggle via icon) */}
            <div className="hidden xl:flex items-center flex-1 max-w-2xl mx-4 justify-center">
              <div className="w-full max-w-xl relative">
                <SearchBar />
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
              {/* Search Toggle Button - visible on xl and below (tablets, iPads, Nest Hub, mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              >
                {isMobileSearchOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Create Event Button - Desktop */}
              <Button
                onClick={handleCreateEvent}
                className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all cursor-pointer px-3 md:px-4 py-1.5 md:py-2 h-8 md:h-9 text-xs md:text-sm font-medium rounded-md"
              >
                <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Create Event</span>
              </Button>

              {/* Create Event Button - Mobile */}
              <Button
                onClick={handleCreateEvent}
                variant="ghost"
                size="icon"
                className="sm:hidden text-primary hover:bg-primary/10 rounded-full cursor-pointer h-8 w-8 transition-colors active:scale-95 touch-manipulation"
                aria-label="Create Event"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>

              <NotificationBell />

              {/* Quick Actions Dropdown */}
              <div className="relative" ref={quickActionsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer h-8 w-8 md:h-9 md:w-9 hidden sm:flex transition-colors active:scale-95 touch-manipulation"
                  onClick={toggleQuickActions}
                  aria-label="Quick actions"
                >
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>

                {showQuickActions && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-100 to-transparent mx-3 sm:mx-4" />
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.href}
                          onClick={() => {
                            router.push(action.href);
                            setShowQuickActions(false);
                          }}
                          className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 w-full text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors", action.color)}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <span className="font-medium text-xs sm:text-sm">{action.label}</span>
                          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 ml-auto -rotate-90" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <UserMenu user={user} onLogout={handleLogout} />

              {/* Create Event Button - Quick create for tablet */}
              <Button
                onClick={handleCreateEvent}
                variant="outline"
                size="sm"
                className="hidden md:flex lg:hidden items-center gap-1 border-gray-200 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm cursor-pointer px-2.5 sm:px-3 h-8 sm:h-9 transition-all active:scale-95 rounded-md"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet Search - shown when toggled on xl and below */}
          <div className={cn(
            "xl:hidden transition-all duration-300 ease-in-out relative z-20",
            isMobileSearchOpen ? "max-h-16 pb-2 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </header>
  );
}