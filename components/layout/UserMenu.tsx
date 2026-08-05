'use client';

import Link from 'next/link';
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
  Shield,
  LifeBuoy,
  Settings,
  LogOut,
  PlusCircle,
  Video,
  ChevronDown,
} from 'lucide-react';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: 'host' | 'attendee' | 'admin';
    avatar?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!user?.role) return '/dashboard';
    return `/dashboard/${user.role}`;
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'host':
        return { label: 'Host', className: 'text-blue-600 bg-blue-50' };
      case 'attendee':
        return { label: 'Attendee', className: 'text-green-600 bg-green-50' };
      case 'admin':
        return { label: 'Admin', className: 'text-purple-600 bg-purple-50' };
      default:
        return { label: 'User', className: 'text-gray-600 bg-gray-50' };
    }
  };

  const roleBadge = getRoleBadge();

  const getQuickLinks = () => {
    if (user?.role === 'host') {
      return [
        { label: 'My Events', href: '/dashboard/host/events', icon: Calendar },
        { label: 'Create Event', href: '/dashboard/host/events/new', icon: PlusCircle },
        { label: 'Attendees', href: '/dashboard/host/attendees', icon: Users },
        { label: 'Revenue', href: '/dashboard/host/revenue', icon: DollarSign },
        { label: 'Certificates', href: '/dashboard/host/certificates', icon: Award },
      ];
    }
    if (user?.role === 'attendee') {
      return [
        { label: 'My Events', href: '/dashboard/attendee/events', icon: Calendar },
        { label: 'Certificates', href: '/dashboard/attendee/certificates', icon: Award },
        { label: 'Replays', href: '/dashboard/attendee/replays', icon: Video },
        { label: 'Payments', href: '/dashboard/attendee/payments', icon: CreditCard },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { label: 'Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Events', href: '/dashboard/admin/events', icon: Calendar },
        { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
        { label: 'Certificates', href: '/dashboard/admin/certificates', icon: Award },
      ];
    }
    return [];
  };

  const quickLinks = getQuickLinks();

  return (
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
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {user?.email}
              </p>
              <span
                className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${roleBadge.className}`}
              >
                {roleBadge.label}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard Link */}
        <DropdownMenuItem className="bg-primary/5 hover:bg-primary/10 cursor-pointer p-0">
          <Link
            href={getDashboardLink()}
            className="flex items-center gap-3 py-2.5 px-2 w-full"
          >
            <div className="bg-primary p-1.5 rounded-lg">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-primary">Dashboard</span>
              <span className="text-xs text-muted-foreground">Full dashboard with all features</span>
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
        {quickLinks.length > 0 && (
          <>
            <div className="px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </span>
            </div>
            <DropdownMenuGroup>
              {quickLinks.map((item) => (
                <DropdownMenuItem key={item.href} className="p-0 cursor-pointer">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 py-2 px-2 w-full"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Account Settings */}
        <div className="px-2 py-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </span>
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0 cursor-pointer">
            <Link href="/profile" className="flex items-center gap-2 py-2 px-2 w-full">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 cursor-pointer">
            <Link href="/settings/security" className="flex items-center gap-2 py-2 px-2 w-full">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Security (2FA)</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 cursor-pointer">
            <Link href="/settings/payments" className="flex items-center gap-2 py-2 px-2 w-full">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Payment Methods</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Support & Settings */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0 cursor-pointer">
            <Link href="/help" className="flex items-center gap-2 py-2 px-2 w-full">
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 cursor-pointer">
            <Link href="/settings" className="flex items-center gap-2 py-2 px-2 w-full">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>All Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={() => {
            console.log('Sign out');
          }}
          className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}