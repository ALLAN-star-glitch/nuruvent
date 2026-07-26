// components/layout/MainHeader.tsx

'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Logo } from '../shared/Logo';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';
import { Button } from '@/components/ui/button';

export function MainHeader() {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <MobileMenu />
            <Logo />
          </div>

          {/* Center: Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile Search Icon */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Unauthenticated users see Sign In and Get Started */}
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