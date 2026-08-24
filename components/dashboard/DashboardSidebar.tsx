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
  Zap,
  Trash2,
  FilePlus,
  ChevronLeft,
  ChevronRight,
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
  isTrash?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
}

// Updated navigation layout:
// 1. Main items with Dashboard at the top
// 2. Quick Actions moved right above Settings
// 3. Settings at the bottom
const navGroups: NavGroup[] = [
  {
    id: 'main',
    label: '',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/events', label: 'Events', icon: Calendar },
      { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
      { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
      { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
      { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
      { href: '/dashboard/replays', label: 'Replays', icon: Video },
      { href: '/dashboard/trash', label: 'Trash', icon: Trash2, isTrash: true },
    ],
  },
  {
    id: 'quick-actions',
    label: 'Quick Actions',
    icon: Zap,
    items: [
      { href: '/dashboard/events/new', label: 'Create Event', icon: PlusCircle },
      { href: '/dashboard/certificates/create', label: 'Generate Certificate', icon: FilePlus },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { href: '/dashboard/account', label: 'Account', icon: User },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
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

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href;
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some(item => isActiveLink(item.href));
  };

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
        {/* Sidebar toggle header */}
        <div
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-between p-4 flex-shrink-0 cursor-pointer relative",
            "border-b border-gray-200/20",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          {!collapsed ? (
            <>
              <span className="text-xs font-medium text-gray-400">Close Sidebar</span>
              <ChevronLeft className="h-5 w-5 text-gray-400 hover:text-[#1A73E8] transition-colors" />
            </>
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400 hover:text-[#1A73E8] transition-colors" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="space-y-3">
            {navGroups.map((group) => {
              const groupActive = isGroupActive(group.items);
              const GroupIcon = group.icon;

              if (group.items.length === 0) return null;

              return (
                <div key={group.id} className="space-y-1">
                  {/* Render header label only for groups with a label defined */}
                  {group.label && (
                    !collapsed ? (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 text-xs font-medium transition-colors',
                          groupActive ? 'text-[#1A73E8]' : 'text-gray-400'
                        )}
                      >
                        {GroupIcon && <GroupIcon className="h-3.5 w-3.5" />}
                        <span>{group.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center px-2 py-1">
                        {GroupIcon && <GroupIcon className="h-4 w-4 text-gray-400" />}
                      </div>
                    )
                  )}

                  {/* Group items */}
                  <div className={cn("space-y-0.5", !collapsed && group.label && "pl-1")}>
                    {group.items.map((item) => {
                      const isActive = isActiveLink(item.href);
                      const Icon = item.icon;
                      const isTrash = item.isTrash;

                      if (collapsed) {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-200 group relative',
                              isActive
                                ? isTrash ? 'bg-red-50 text-red-600' : 'bg-[#1A73E8]/10 text-[#1A73E8]'
                                : isTrash 
                                  ? 'text-red-500 hover:bg-red-50/60 hover:text-red-600' 
                                  : 'text-gray-500 hover:bg-gray-100/60 hover:text-gray-900'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5 flex-shrink-0 transition-colors',
                                isTrash
                                  ? 'text-red-500 group-hover:text-red-600'
                                  : isActive
                                    ? 'text-[#1A73E8]'
                                    : 'text-gray-400 group-hover:text-gray-600'
                              )}
                            />
                            <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                              {item.label}
                            </div>
                          </Link>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative',
                            isActive
                              ? isTrash ? 'bg-red-50 text-red-600 shadow-sm' : 'bg-[#1A73E8]/10 text-[#1A73E8] shadow-sm'
                              : isTrash 
                                ? 'text-red-500 hover:bg-red-50/60 hover:text-red-600' 
                                : 'text-gray-500 hover:bg-gray-100/60 hover:text-gray-900'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5 flex-shrink-0 transition-colors',
                              isTrash
                                ? 'text-red-500 group-hover:text-red-600'
                                : isActive
                                  ? 'text-[#1A73E8]'
                                  : 'text-gray-400 group-hover:text-gray-600'
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium whitespace-nowrap",
                              isTrash
                                ? "text-red-500 group-hover:text-red-600"
                                : isActive 
                                  ? "text-[#1A73E8]" 
                                  : "text-gray-700"
                            )}
                          >
                            {item.label}
                          </span>
                          {isActive && (
                            <div 
                              className={cn(
                                "ml-auto w-1 h-6 rounded-full shadow-sm",
                                isTrash ? "bg-red-500 shadow-red-500/30" : "bg-[#1A73E8] shadow-[#1A73E8]/30"
                              )} 
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Divider between groups */}
                  {!collapsed && group.id !== navGroups[navGroups.length - 1].id && (
                    <div className="relative my-2 mx-2">
                      <div className="w-full border-t border-gray-200/20" />
                    </div>
                  )}
                </div>
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