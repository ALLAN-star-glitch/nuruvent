'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, MouseEvent, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  CreditCard,
  Settings,
  LogOut,
  PlusCircle,
  DollarSign,
  Video,
  User,
  LucideIcon,
  FileText,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  Home,
  BarChart3,
  Shield,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Redux imports
import { useAppDispatch } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { LogoutDialog } from '@/components/ui/LogoutDialog';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  soon?: boolean;
}

const navItems: NavItem[] = [
  // Main section
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/events/new', label: 'Create Event', icon: PlusCircle },
  
  // Middle section
  { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/dashboard/replays', label: 'Replays', icon: Video },
  
  // Settings section
  { href: '/dashboard/account', label: 'Account', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface DashboardSidebarProps {
  role?: 'host' | 'attendee' | 'admin';
  onCollapseChange?: (collapsed: boolean) => void;
  collapsed?: boolean;
}

export function DashboardSidebar({ 
  role = 'host', 
  onCollapseChange,
  collapsed: externalCollapsed
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Internal state: CLOSED by default (true = collapsed)
  const [internalCollapsed, setInternalCollapsed] = useState(true);

  // Keep internal state in sync if parent controls `collapsed` prop
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const newState = !collapsed;
    setInternalCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const handleLogoutConfirm = async () => {
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

  const openLogoutDialog = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowLogoutDialog(true);
  };

  // ✅ FIXED: Check exact path match for parent items
  const isActiveLink = (href: string) => {
    // For parent items like /dashboard/events, only match exact path
    // Not sub-paths like /dashboard/events/new
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For exact matches only
    return pathname === href;
  };

  // Check if a sub-item is active (for highlighting parent)
  const isParentActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href) && pathname !== href + '/new';
  };

  // Split items: main items and settings items
  const mainItems = navItems.filter(
    item => item.href !== '/dashboard/account' && item.href !== '/dashboard/settings'
  );
  const settingsItems = navItems.filter(
    item => item.href === '/dashboard/account' || item.href === '/dashboard/settings'
  );

  return (
    <>
      <aside
        onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
        className={cn(
          'hidden md:flex md:flex-col bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-300 select-none shrink-0',
          'fixed left-6 z-30 overflow-hidden',
          'rounded-3xl border border-white/30',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          'top-[140px] h-[calc(100vh-200px)]',
          'before:absolute before:inset-0 before:pointer-events-none before:rounded-3xl before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]',
          'after:absolute after:inset-0 after:pointer-events-none after:rounded-3xl after:bg-gradient-to-br after:from-white/5 after:via-transparent after:to-white/5'
        )}
      >
        {/* Logo / Brand - Removed "N" icon */}
        <div
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-between p-4 flex-shrink-0 cursor-pointer relative",
            "border-b border-gray-200/20",
            collapsed && "justify-center px-2"
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-gray-800 tracking-tight">NuruVent</span>
              <span className="text-[8px] font-medium text-[#1A73E8] bg-[#1A73E8]/10 px-2 py-0.5 rounded-full">Pro</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-800 tracking-tight">N</span>
          )}
          
          <div 
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-200",
              "hover:bg-gray-100/80 active:scale-95",
              collapsed && "hidden"
            )}
            role="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            tabIndex={0}
          >
            <ChevronsLeft className="h-4 w-4 text-gray-400 hover:text-[#1A73E8] transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="space-y-1">
            {mainItems.map((item) => {
              // ✅ FIXED: Only active for exact match
              const isActive = isActiveLink(item.href);
              const Icon = item.icon;
              const isCreateEvent = item.href === '/dashboard/events/new';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    isActive
                      ? 'bg-[#1A73E8]/10 text-[#1A73E8] shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100/60 hover:text-gray-900',
                    isCreateEvent && !isActive && 'border border-dashed border-gray-200/50 hover:border-[#1A73E8]/30 hover:bg-[#1A73E8]/5'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-[#1A73E8]' : 'text-gray-400 group-hover:text-gray-600',
                      isCreateEvent && !isActive && 'text-gray-400'
                    )}
                  />
                  {!collapsed && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isCreateEvent && !isActive && "text-gray-600"
                    )}>
                      {item.label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                  {!collapsed && isCreateEvent && !isActive && (
                    <Sparkles className="h-3 w-3 text-amber-400 ml-auto flex-shrink-0" />
                  )}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-1 h-6 rounded-full bg-[#1A73E8] shadow-sm shadow-[#1A73E8]/30" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className={cn("relative my-4", collapsed ? "mx-2" : "mx-3")}>
            <div className="absolute inset-0 flex items-center">
              <div className={cn(
                "w-full border-t",
                collapsed ? "border-gray-200/20" : "border-gray-200/30"
              )} />
            </div>
          </div>

          {/* Settings items */}
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = isActiveLink(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    isActive
                      ? 'bg-[#1A73E8]/10 text-[#1A73E8] shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100/60 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-[#1A73E8]' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-1 h-6 rounded-full bg-[#1A73E8] shadow-sm shadow-[#1A73E8]/30" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User & Logout */}
        <div className={cn(
          "relative flex flex-col gap-2",
          "border-t border-gray-200/20",
          collapsed ? "px-2 py-3" : "px-3 py-3"
        )}>
          {/* User Avatar */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
            collapsed && "justify-center px-0"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A73E8]/20 to-[#1A73E8]/5 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
              <User className="h-4 w-4 text-[#1A73E8]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">User</p>
                <p className="text-[10px] text-gray-400 truncate">Host Account</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openLogoutDialog}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 w-full",
              "text-red-500 hover:bg-red-50/60 active:scale-95",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className={cn(
              "h-4 w-4 flex-shrink-0",
              collapsed ? "text-red-400" : "text-red-500"
            )} />
            {!collapsed && (
              <span className="text-sm font-medium">Sign out</span>
            )}
          </button>
        </div>

        {/* Toggle Button - Floating */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200/50 shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:border-[#1A73E8]/30 group",
            "hidden md:flex"
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-3 w-3 text-gray-400 group-hover:text-[#1A73E8] transition-colors" />
          ) : (
            <ChevronsLeft className="h-3 w-3 text-gray-400 group-hover:text-[#1A73E8] transition-colors" />
          )}
        </button>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoading}
      />
    </>
  );
}