// components/layout/MobileMenu.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 animate-slide-in">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Image
                    src="/logo.png"
                    alt="Nuruvent"
                    width={100}
                    height={32}
                  />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                {/* Main Navigation */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Menu
                  </span>
                </div>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="border-t my-3" />

                {/* Account Links */}
                <Link
                  href="/signin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">🔑</span>
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">✨</span>
                  Get Started
                </Link>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Nuruvent. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}