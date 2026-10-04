/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAppDispatch } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { LogoutDialog } from '@/components/ui/LogoutDialog';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isTrash?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  {
    href: '/dashboard/registrations',
    label: 'Registrations',
    icon: ClipboardList,
  },
  { href: '/dashboard/attendees', label: 'Attendance', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/replays', label: 'Replays', icon: Clapperboard },
  {
    href: '/dashboard/trash',
    label: 'Trash',
    icon: Trash2,
    isTrash: true,
  },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface DashboardSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  collapsed?: boolean;
}

export function DashboardSidebar({
  onCollapseChange,
  collapsed: externalCollapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [internalCollapsed, setInternalCollapsed] = useState(true);

  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setInternalCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

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
    // Exact match for the dashboard root
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <aside
        onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
        className={cn(
          'hidden md:flex md:flex-col bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out select-none shrink-0',
          'fixed left-6 z-30 overflow-hidden',
          'rounded-2xl border border-border/70 shadow-xl shadow-black/5',
          collapsed ? 'w-[80px]' : 'w-[280px]',
          'top-[140px] h-[calc(100vh-200px)]',
        )}
      >
        {/* Toggle Header */}
        <div
          onClick={toggleSidebar}
          className={cn(
            'flex items-center h-14 flex-shrink-0 cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/40',
            collapsed ? 'justify-center px-2' : 'justify-between px-5',
          )}
        >
          {!collapsed ? (
            <>
              <span className="text-sm font-semibold tracking-wider uppercase text-foreground/70 cursor-pointer">
                Collapse Menu
              </span>
              <ChevronLeft className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
            </>
          ) : (
            <ChevronRight className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto overflow-x-hidden scrollbar-none space-y-2">
          {navItems.map((item) => {
            const isActive = isActiveLink(item.href);
            const Icon = item.icon;
            const isTrash = item.isTrash;

            if (collapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center h-12 w-12 mx-auto rounded-xl transition-all duration-150 group relative cursor-pointer',
                    isActive
                      ? isTrash
                        ? 'bg-destructive/15 text-destructive font-semibold'
                        : 'bg-primary/15 text-primary font-semibold'
                      : isTrash
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <div className="absolute left-16 ml-2 px-3 py-2 bg-popover text-popover-foreground border border-border text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md font-medium">
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
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 group relative cursor-pointer',
                  isActive
                    ? isTrash
                      ? 'bg-destructive/15 text-destructive font-bold'
                      : 'bg-primary/15 text-primary font-bold'
                    : isTrash
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground',
                )}
              >
                {isActive && (
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full',
                      isTrash ? 'bg-destructive' : 'bg-primary',
                    )}
                  />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
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

        {/* Footer Actions */}
        <div
          className={cn(
            'p-3 border-t border-border/50',
            collapsed ? 'flex justify-center' : 'px-4',
          )}
        >
          <button
            type="button"
            onClick={openLogoutDialog}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-bold transition-all duration-150 w-full cursor-pointer',
              'text-destructive hover:bg-destructive/10 active:scale-[0.98]',
              collapsed && 'justify-center w-12 h-12 p-0',
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 text-destructive" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoading}
      />
    </>
  );
}