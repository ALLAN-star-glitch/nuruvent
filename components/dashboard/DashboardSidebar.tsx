/* eslint-disable react-hooks/set-state-in-effect */
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
  User,
  LucideIcon,
  Trash2,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Ticket,
  CalendarDays,
  BadgeCheck,
  Wallet,
  Clapperboard,
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
  badge?: string;
  soon?: boolean;
  isTrash?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
  collapsible?: boolean;
}

const navGroups: NavGroup[] = [
  {
    id: 'main',
    label: '',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'events',
    label: 'EVENTS',
    icon: CalendarDays,
    collapsible: true,
    items: [
      { href: '/dashboard/events/new', label: 'Create Event', icon: PlusCircle },
      { href: '/dashboard/events', label: "Events I'm Hosting", icon: Calendar },
      { href: '/dashboard/my-registrations', label: "Events I'm Attending", icon: Ticket },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    collapsible: true,
    items: [
      { href: '/dashboard/certificates/create', label: 'Generate Certificate', icon: FilePlus },
      { href: '/dashboard/certificates/issued', label: 'Issued', icon: BadgeCheck },
      { href: '/dashboard/certificates/received', label: 'Received', icon: Award },
    ],
  },
  {
    id: 'people',
    label: '',
    items: [
      { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
    ],
  },
  {
    id: 'money',
    label: 'Payments',
    icon: CreditCard,
    collapsible: true,
    items: [
      { href: '/dashboard/payments/received', label: 'Received', icon: Wallet },
      { href: '/dashboard/payments/made', label: 'Made', icon: CreditCard },
      { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
    ],
  },
  {
    id: 'media',
    label: '',
    items: [
      { href: '/dashboard/replays', label: 'Replays', icon: Clapperboard },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { href: '/dashboard/account', label: 'Account', icon: User },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/trash', label: 'Trash', icon: Trash2, isTrash: true },
    ],
  },
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
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

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
    // Exact match for dashboard root and index collection pages
    if (href === '/dashboard' || href === '/dashboard/events') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some((item) => isActiveLink(item.href));
  };

  const toggleGroup = (id: string) => {
    setOpenGroupId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    for (const group of navGroups) {
      if (!group.collapsible) continue;
      if (group.items.some((item) => isActiveLink(item.href))) {
        setOpenGroupId(group.id);
        break;
      }
    }
  }, [pathname]);

  const isGroupOpen = (group: NavGroup) => {
    if (!group.collapsible) return true;
    if (collapsed) return true;
    return openGroupId === group.id;
  };

  return (
    <>
      <aside
        onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
        className={cn(
          'hidden md:flex md:flex-col bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out select-none shrink-0',
          'fixed left-6 z-30 overflow-hidden',
          'rounded-2xl border border-border/70 shadow-xl shadow-black/5',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          'top-[140px] h-[calc(100vh-200px)]'
        )}
      >
        {/* Toggle Header */}
        <div
          onClick={toggleSidebar}
          className={cn(
            'flex items-center h-12 flex-shrink-0 cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/40',
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {!collapsed ? (
            <>
              <span className="text-xs font-semibold tracking-wider uppercase text-foreground/70 cursor-pointer">
                Collapse Menu
              </span>
              <ChevronLeft className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
            </>
          ) : (
            <ChevronRight className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors cursor-pointer" />
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3.5 overflow-y-auto overflow-x-hidden scrollbar-none space-y-4">
          {navGroups.map((group) => {
            const groupActive = isGroupActive(group.items);
            const GroupIcon = group.icon;
            const groupOpen = isGroupOpen(group);

            if (group.items.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header Label */}
                {group.label &&
                  (!collapsed ? (
                    group.collapsible ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors rounded-md hover:bg-accent/50 cursor-pointer',
                          groupActive
                            ? 'text-primary'
                            : 'text-foreground/70 hover:text-foreground'
                        )}
                        aria-expanded={groupOpen}
                      >
                        <div className="flex items-center gap-2">
                          {GroupIcon && <GroupIcon className="h-4 w-4 shrink-0" />}
                          <span>{group.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200 text-foreground/60',
                            groupOpen && 'rotate-180'
                          )}
                        />
                      </button>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold tracking-wider uppercase',
                          groupActive
                            ? 'text-primary'
                            : 'text-foreground/70'
                        )}
                      >
                        {GroupIcon && <GroupIcon className="h-4 w-4 shrink-0" />}
                        <span>{group.label}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-1">
                      {GroupIcon && (
                        <GroupIcon className="h-4 w-4 text-foreground/60" />
                      )}
                    </div>
                  ))}

                {/* Nav Items Container */}
                <div
                  className={cn(
                    'transition-all duration-300 ease-in-out overflow-hidden',
                    groupOpen
                      ? 'max-h-96 opacity-100 space-y-1'
                      : 'max-h-0 opacity-0 pointer-events-none'
                  )}
                >
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
                            'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-150 group relative cursor-pointer',
                            isActive
                              ? isTrash
                                ? 'bg-destructive/15 text-destructive font-semibold'
                                : 'bg-primary/15 text-primary font-semibold'
                              : isTrash
                                ? 'text-destructive hover:bg-destructive/10'
                                : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <div className="absolute left-14 ml-2 px-3 py-1.5 bg-popover text-popover-foreground border border-border text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md font-medium">
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
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group relative cursor-pointer',
                          isActive
                            ? isTrash
                              ? 'bg-destructive/15 text-destructive font-bold'
                              : 'bg-primary/15 text-primary font-bold'
                            : isTrash
                              ? 'text-destructive hover:bg-destructive/10'
                              : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground'
                        )}
                      >
                        {isActive && (
                          <div
                            className={cn(
                              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full',
                              isTrash ? 'bg-destructive' : 'bg-primary'
                            )}
                          />
                        )}
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isTrash
                              ? 'text-destructive'
                              : isActive
                                ? 'text-primary'
                                : 'text-foreground/70 group-hover:text-foreground'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div
          className={cn(
            'p-2.5 border-t border-border/50',
            collapsed ? 'flex justify-center' : 'px-3'
          )}
        >
          <button
            type="button"
            onClick={openLogoutDialog}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-150 w-full cursor-pointer',
              'text-destructive hover:bg-destructive/10 active:scale-[0.98]',
              collapsed && 'justify-center w-10 h-10 p-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 text-destructive" />
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