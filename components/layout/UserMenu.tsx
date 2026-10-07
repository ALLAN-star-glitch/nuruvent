// components/layout/UserMenu.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  User,
  Calendar,
  Users,
  Award,
  CreditCard,
  Settings,
  LogOut,
  Video,
  Trash2,
  ChevronDown,
  ClipboardList,
  Ticket,
} from 'lucide-react';

import { useAppDispatch } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth } from '@/lib/store/slices/authSlice';
import { LogoutDialog } from '../ui/LogoutDialog';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

// ============================================================
// QUICK LINKS
// ============================================================

const QUICK_LINKS = [
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Registrations', href: '/dashboard/registrations', icon: ClipboardList },
  { label: 'Tickets', href: '/dashboard/tickets', icon: Ticket },   // ← add
  { label: 'Attendees', href: '/dashboard/attendees', icon: Users },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Replays', href: '/dashboard/replays', icon: Video },
  { label: 'Trash', href: '/dashboard/trash', icon: Trash2, isTrash: true },
];

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [open, setOpen] = useState(false);

  // Close on any route change (back/forward, programmatic nav, etc.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
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

  const openLogoutDialog = () => {
    setOpen(false);
    setShowLogoutDialog(true);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-2 hover:bg-gray-100 rounded-lg cursor-pointer outline-none data-[state=open]:bg-gray-100 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {user?.name || 'Account'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72 p-2" align="end">
          {/* User Info */}
          <DropdownMenuLabel className="font-normal py-2.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-2" />

          {/* Dashboard Link */}
          <DropdownMenuItem
            onSelect={() => navigateTo('/dashboard')}
            className="bg-primary/5 hover:bg-primary/10 cursor-pointer py-2.5"
          >
            <div className="flex items-center gap-3 py-1 px-1 w-full">
              <div className="bg-primary p-1.5 rounded-lg">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">
                  Dashboard
                </span>
                <span className="text-xs text-muted-foreground">
                  Full dashboard with all features
                </span>
              </div>
              <svg
                className="h-4 w-4 text-primary/60 ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          {/* Quick Links */}
          <div className="px-2 pt-2 pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </span>
          </div>
          <DropdownMenuGroup className="space-y-1">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.href}
                  onSelect={() => navigateTo(item.href)}
                  className={
                    item.isTrash
                      ? 'cursor-pointer py-2.5 text-red-600 hover:bg-red-50 focus:text-red-600'
                      : 'cursor-pointer py-2.5'
                  }
                >
                  <Icon
                    className={
                      item.isTrash
                        ? 'h-4 w-4 text-red-500'
                        : 'h-4 w-4 text-muted-foreground'
                    }
                  />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          {/* Account */}
          <div className="px-2 pt-2 pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account
            </span>
          </div>
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem
              onSelect={() => navigateTo('/dashboard/account')}
              className="cursor-pointer py-2.5"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>My Account</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          {/* Settings */}
          <div className="px-2 pt-2 pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Preferences
            </span>
          </div>
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem
              onSelect={() => navigateTo('/dashboard/settings')}
              className="cursor-pointer py-2.5"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          {/* Sign Out */}
          <DropdownMenuItem
            onSelect={openLogoutDialog}
            className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50 py-2.5"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </>
  );
}