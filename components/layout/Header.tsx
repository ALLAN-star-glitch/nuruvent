// components/layout/Header.tsx

'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { TopBar } from './TopBar';
import { MainHeader } from './MainHeader';
import { DashboardHeader } from '../dashboard/DashboardHeader';

export function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Show loading state while persisting
  if (isAuthenticated === undefined) {
    return (
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Show DashboardHeader when authenticated
  if (isAuthenticated && user) {
    return (
      <>
        <div className="hidden md:block">
          <TopBar />
        </div>
        <DashboardHeader user={user} />
      </>
    );
  }

  // Show MainHeader when not authenticated
  return (
    <>
      <div className="hidden md:block">
        <TopBar />
      </div>
      <MainHeader />
    </>
  );
}