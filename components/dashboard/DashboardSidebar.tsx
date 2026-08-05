'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, MouseEvent, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  DollarSign,
  Video,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/replays', label: 'Replays', icon: Video },
  { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
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
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use external collapsed state if provided, otherwise use internal
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const newState = !collapsed;
    if (externalCollapsed !== undefined) {
      // If controlled, notify parent
      onCollapseChange?.(newState);
    } else {
      // If uncontrolled, update internal state
      setInternalCollapsed(newState);
    }
  };

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Logout clicked');
  };

  return (
    <aside
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      className={cn(
        'hidden md:flex md:flex-col bg-white/90 backdrop-blur-md shadow-2xl transition-all duration-300 select-none shrink-0',
        'fixed left-6 z-30 overflow-hidden',
        'rounded-3xl border border-white/20',
        collapsed ? 'w-[70px]' : 'w-[240px]',
        'top-[140px] h-[calc(100vh-200px)]',
        // Floating glow effect
        'before:absolute before:inset-0 before:pointer-events-none before:rounded-3xl before:shadow-inner before:shadow-white/20',
        'after:absolute after:inset-0 after:pointer-events-none after:rounded-3xl after:bg-gradient-to-b after:from-white/5 after:to-transparent'
      )}
    >
      {/* Toggle Button */}
      <div
        onClick={toggleSidebar}
        className={cn(
          "flex justify-end p-3 border-b border-gray-100/50 flex-shrink-0 cursor-pointer",
          collapsed && "justify-center px-2"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-pointer flex items-center justify-center rounded-lg hover:bg-gray-100/50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-14 ml-2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Logout */}
      <div className={cn(
        "px-3 py-2.5 border-t border-gray-100/50 flex-shrink-0",
        collapsed ? "flex justify-center" : ""
      )}>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-red-500 hover:bg-red-50/50 cursor-pointer",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}