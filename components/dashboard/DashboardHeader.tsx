'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Search,
  BookOpen, 
  Zap, 
  CreditCard, 
  Target, 
  HelpCircle,
  LayoutDashboard, 
  Calendar, 
  Users, 
  Award, 
  Settings,
  PlusCircle,
  DollarSign,
  Video
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { SearchBar } from '@/components/layout/SearchBar';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { UserMenu } from '@/components/layout/UserMenu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

interface DashboardHeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: 'host' | 'attendee' | 'admin';
  };
}



const dashboardNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const quickActions = [
  { label: 'Create Event', href: '/dashboard/events/new', icon: PlusCircle },
  { label: 'Revenue', href: '/dashboard/payments', icon: DollarSign },
  { label: 'Replays', href: '/dashboard/replays', icon: Video },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();

  const currentUser = user || {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'host' as const,
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 shrink-0 h-full">
            {/* Mobile Sheet Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-[300px] sm:w-[340px] flex flex-col h-full bg-white">
                <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between space-y-0 text-left shrink-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="inline-flex items-center">
                    <Logo />
                  </div>
                </SheetHeader>

                {/* Mobile Drawer Navigation Links */}
                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                  {/* Website Topbar Navigation Section */}
                  <div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Main Menu
                    </p>
                    <nav className="space-y-1">
                      {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              )}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Dashboard Menu Section */}
                  <div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Dashboard
                    </p>
                    <nav className="space-y-1">
                      {dashboardNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              )}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Quick Actions (Host) */}
                  {currentUser.role === 'host' && (
                    <div>
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Quick Actions
                      </p>
                      <nav className="space-y-1">
                        {quickActions.map((item) => {
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                <Icon className="h-5 w-5 shrink-0 text-gray-500" />
                                <span>{item.label}</span>
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </nav>
                    </div>
                  )}
                </div>

                {/* Drawer Footer User Details */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Header Logo */}
            <div className="inline-flex items-center shrink-0">
              <Logo />
            </div>
          </div>

          {/* Center: Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <SearchBar />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Trigger Icon */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <NotificationBell />
            <UserMenu user={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
}