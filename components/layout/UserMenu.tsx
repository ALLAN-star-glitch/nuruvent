// components/layout/UserMenu.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  DollarSign,
  LifeBuoy,
  Settings,
  LogOut,
  PlusCircle,
  Video,
  ChevronDown,
} from 'lucide-react';

// Redux imports
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
// QUICK LINKS — flat list, same for everyone
// ============================================================

const QUICK_LINKS = [
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Create Event', href: '/dashboard/events/new', icon: PlusCircle },
  { label: 'Attendees', href: '/dashboard/attendees', icon: Users },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
  { label: 'Replays', href: '/dashboard/replays', icon: Video },
];

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const closeDropdown = () => {
    document.body.click();
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
    setShowLogoutDialog(true);
    closeDropdown();
  };

  return (
    <>
      <DropdownMenu>
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

        <DropdownMenuContent className="w-72" align="end">
          {/* User Info */}
          <DropdownMenuLabel className="font-normal">
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

          <DropdownMenuSeparator />

          {/* Dashboard Link */}
          <DropdownMenuItem className="bg-primary/5 hover:bg-primary/10 cursor-pointer p-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 py-2.5 px-2 w-full"
              onClick={closeDropdown}
            >
              <div className="bg-primary p-1.5 rounded-lg">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">Dashboard</span>
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
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Quick Links */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </span>
          </div>
          <DropdownMenuGroup>
            {QUICK_LINKS.map((item) => (
              <DropdownMenuItem key={item.href} className="p-0 cursor-pointer">
                <Link
                  href={item.href}
                  className="flex items-center gap-2 py-2 px-2 w-full"
                  onClick={closeDropdown}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Account */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account
            </span>
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link
                href="/dashboard/account"
                className="flex items-center gap-2 py-2 px-2 w-full"
                onClick={closeDropdown}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>My Account</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Settings */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Preferences
            </span>
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 py-2 px-2 w-full"
                onClick={closeDropdown}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link
                href="/help"
                className="flex items-center gap-2 py-2 px-2 w-full"
                onClick={closeDropdown}
              >
                <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                <span>Help &amp; Support</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <DropdownMenuItem
            onClick={openLogoutDialog}
            className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </>
  );
}