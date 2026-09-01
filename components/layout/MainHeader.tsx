// components/layout/MainHeader.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  LogIn,
  UserPlus,
  Search,
  X
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
import { useAppSelector } from '@/lib/store/hooks';
import { useState, useRef, useEffect } from 'react';

export function MainHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // If authenticated, don't show this header
  if (isAuthenticated) {
    return null;
  }

  // Handle search toggle
  const handleSearchToggle = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    if (newState) {
      setShouldAutoFocus(true);
      // Reset autoFocus after a short delay to allow the input to mount
      setTimeout(() => setShouldAutoFocus(false), 100);
    }
  };

  return (
    <div className="bg-white border-b shadow-xs relative z-10">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col">
          {/* Top Row: Logo + Search + Actions */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="p-0 w-[300px] sm:w-[340px] flex flex-col h-full bg-white">
                  <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between space-y-0 text-left shrink-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </SheetHeader>

                  <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    {/* Main Navigation Section */}
                    <div>
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                      </p>
                      <nav className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900'
                                )}
                              >
                                <Icon className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive ? 'text-primary' : 'text-gray-400'
                                )} />
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
              <Link href="/" className="inline-flex items-center shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                <Logo />
              </Link>
            </div>

            {/* Search - Desktop: full bar, Tablet/Mobile: hidden (toggle via icon) */}
            <div className="hidden xl:flex items-center flex-1 max-w-2xl mx-4 justify-center">
              <div className="w-full max-w-xl relative">
                <SearchBar />
              </div>
            </div>

            {/* Right: Actions + Search Toggle (tablet/mobile) */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Search Toggle Button - visible on xl and below (tablets, iPads, Nest Hub, mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                onClick={handleSearchToggle}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                {isSearchOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Actions - Only show if not authenticated */}
              {!isAuthenticated && (
                <>
                  <Link href="/signin" className="cursor-pointer hidden sm:flex">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="font-medium text-gray-600 hover:text-primary cursor-pointer hidden sm:flex"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="cursor-pointer">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer px-2.5 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <span className="hidden xs:inline">Get Started</span>
                      <span className="xs:hidden">Get Started</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Search - shown when toggled on xl and below */}
          <div className={cn(
            "xl:hidden transition-all duration-300 ease-in-out relative z-20",
            isSearchOpen ? "max-h-16 pb-2 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}>
            <SearchBar autoFocus={shouldAutoFocus} />
          </div>
        </div>
      </div>
    </div>
  );
}