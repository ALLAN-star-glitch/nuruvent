
'use client';

import { TopBar } from './TopBar';
import { MainHeader } from './MainHeader';

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Desktop only */}
      <div className="hidden md:block">
        <TopBar />
      </div>

      {/* Main Header */}
      <MainHeader />
    </header>
  );
}