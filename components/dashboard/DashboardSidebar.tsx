'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, MouseEvent } from 'react';
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
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const quickActions: NavItem[] = [
  { label: 'Create Event', href: '/dashboard/events/new', icon: PlusCircle },
  { label: 'Revenue', href: '/dashboard/payments', icon: DollarSign },
  { label: 'Replays', href: '/dashboard/replays', icon: Video },
];

interface DashboardSidebarProps {
  role?: 'host' | 'attendee' | 'admin';
}

export function DashboardSidebar({ role = 'host' }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Logout clicked');
  };

  return (
    <aside
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      className={cn(
        'hidden md:flex md:flex-col bg-white border-r border-gray-200 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] z-30 select-none shrink-0',
        collapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      {/* Toggle Button Container */}
      <div
        onClick={toggleSidebar}
        className="flex justify-end p-2.5 border-b border-gray-100 bg-white select-none relative z-50 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-pointer flex items-center justify-center rounded-md hover:bg-gray-100"
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          // Check exact match for dashboard home, prefix match for sub-routes
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-500'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-14 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Quick Actions Section */}
        {!collapsed && role === 'host' && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-red-500 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}