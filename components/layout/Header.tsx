// components/layout/Header.tsx

'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { TopBar } from './TopBar';
import { MainHeader } from './MainHeader';
import { DashboardHeader } from '../dashboard/DashboardHeader';

interface HeaderProps {
  hideTopBar?: boolean;
}

export function Header({ hideTopBar = false }: HeaderProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Show loading state while persisting (Themed)
  if (isAuthenticated === undefined) {
    return (
      <div className="h-16 bg-card border-b border-border flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Show DashboardHeader when authenticated
  if (isAuthenticated && user) {
    return (
      <>
        {!hideTopBar && (
          <div className="md:block">
            <TopBar />
          </div>
        )}
        <DashboardHeader user={user} />
      </>
    );
  }

  // Show MainHeader when not authenticated
  return (
    <>
      <div className="md:block">
        <TopBar />
      </div>
      <MainHeader />
    </>
  );
}