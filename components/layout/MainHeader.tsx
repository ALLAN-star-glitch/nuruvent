'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  CreditCard, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Award, 
  Settings,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Logo } from '../shared/Logo';
import { SearchBar } from './SearchBar';
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

const dashboardNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function MainHeader() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b shadow-xs">
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
                  {/* Main Navigation Section */}
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
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
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
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
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
                </div>

                {/* Mobile Drawer Footer Auth CTAs */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-2">
                  <SheetClose asChild>
                    <Link href="/signin" className="w-full block cursor-pointer">
                      <Button variant="outline" className="w-full justify-center gap-2 text-gray-700 cursor-pointer">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/signup" className="w-full block cursor-pointer">
                      <Button className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer">
                        <UserPlus className="h-4 w-4" />
                        Get Started
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="inline-flex items-center shrink-0">
              <Logo />
            </div>
          </div>

          {/* Center: Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link href="/signin" className="cursor-pointer">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-medium text-gray-600 hover:text-primary cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="cursor-pointer">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}