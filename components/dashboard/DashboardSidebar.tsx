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
  User,
  LucideIcon,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  // Main section
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  
  // Middle section
  { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/dashboard/replays', label: 'Replays', icon: Video },
  
  // Settings section (will be separated by divider)
  { href: '/dashboard/account', label: 'Account', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const quickActions: QuickAction[] = [
  { href: '/dashboard/events/new', label: 'Create Event', icon: PlusCircle },
  { href: '/dashboard/certificates/create', label: 'Create Certificate', icon: FileText },
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
  
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const newState = !collapsed;
    if (externalCollapsed !== undefined) {
      onCollapseChange?.(newState);
    } else {
      setInternalCollapsed(newState);
    }
  };

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Logout clicked');
  };

  // Split items: main items and settings items (Account + Settings)
  const mainItems = navItems.filter(item => 
    item.href !== '/dashboard/account' && 
    item.href !== '/dashboard/settings'
  );
  const settingsItems = navItems.filter(item => 
    item.href === '/dashboard/account' || 
    item.href === '/dashboard/settings'
  );

  return (
    <aside
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      className={cn(
        'hidden md:flex md:flex-col bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-300 select-none shrink-0',
        'fixed left-6 z-30 overflow-hidden',
        'rounded-3xl border border-white/30',
        collapsed ? 'w-[70px]' : 'w-[240px]',
        'top-[140px] h-[calc(100vh-200px)]',
        // Enhanced glass-morphism with gradient overlay
        'before:absolute before:inset-0 before:pointer-events-none before:rounded-3xl before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]',
        'after:absolute after:inset-0 after:pointer-events-none after:rounded-3xl after:bg-gradient-to-br after:from-white/5 after:via-transparent after:to-white/5'
      )}
    >
      {/* Toggle Button with Header Text */}
      <div
        onClick={toggleSidebar}
        className={cn(
          "flex items-center justify-between p-3 flex-shrink-0 cursor-pointer relative",
          "border-b border-gray-200/30",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Header Text - Show when expanded */}
        {!collapsed && (
          <span className="text-xs font-medium text-gray-500/70 tracking-wider uppercase">
            Close Sidebar
          </span>
        )}
        
        <div 
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-200",
            "hover:bg-gray-100/50 active:scale-95",
            collapsed && "w-full"
          )}
          role="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          tabIndex={0}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden">
        {/* Main items */}
        <div className="space-y-0.5">
          {mainItems.map((item) => {
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
                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900'
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
                  <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-6">
          {!collapsed && (
            <div className="px-3 mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
          )}
          <div className="space-y-0.5">
            {quickActions.map((action) => {
              const isActive = pathname.startsWith(action.href);
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900',
                    !collapsed && 'border border-dashed border-gray-200/50 hover:border-primary/30'
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
                      {action.label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {action.label}
                    </div>
                  )}
                  {!collapsed && (
                    <Sparkles className="h-3 w-3 text-amber-400 ml-auto flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider with dot decoration */}
        <div className={cn(
          "relative my-4",
          collapsed ? "mx-2" : "mx-3"
        )}>
          <div className="absolute inset-0 flex items-center">
            <div className={cn(
              "w-full border-t",
              collapsed ? "border-gray-200/30" : "border-gray-200/40"
            )} />
          </div>
          <div className="relative flex justify-center">
            <span className={cn(
              "bg-white/80 text-[8px] font-medium tracking-widest uppercase text-gray-400/50",
              collapsed ? "px-1" : "px-2"
            )}>
              •
            </span>
          </div>
        </div>

        {/* Settings items (Account + Settings) */}
        <div className="space-y-0.5">
          {settingsItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900'
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
                  <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout and Copyright */}
      <div className={cn(
        "relative flex flex-col gap-2",
        "border-t border-gray-200/30",
        collapsed ? "px-2 py-3" : "px-3 py-3"
      )}>
        {/* Top divider dot */}
        <div className="absolute -top-[1px] left-0 right-0 flex justify-center">
          <span className={cn(
            "bg-white/80 text-[8px] font-medium tracking-widest uppercase text-gray-400/50",
            collapsed ? "px-1" : "px-2"
          )}>
            •
          </span>
        </div>
        
        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full",
            "text-red-500 hover:bg-red-50/50 active:scale-95",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className={cn(
            "h-5 w-5 flex-shrink-0",
            collapsed ? "text-red-400" : "text-red-500"
          )} />
          {!collapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>

        {/* Copyright Text */}
        {!collapsed && (
          <div className="px-3 pt-1 pb-0.5">
            <p className="text-[10px] text-gray-400/60 text-center font-light tracking-wider">
              © {new Date().getFullYear()} NuruVent
            </p>
          </div>
        )}
        
        {collapsed && (
          <div className="flex justify-center pt-0.5">
            <p className="text-[8px] text-gray-400/40 text-center font-light tracking-wider">
              ©
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}