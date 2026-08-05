'use client';

import { TopBar } from './TopBar';
import { MainHeader } from './MainHeader';
import { DashboardHeader } from '../dashboard/DashboardHeader';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: 'host' | 'attendee' | 'admin';
  };
}

export function Header({ isAuthenticated = false, user }: HeaderProps) {
  if (isAuthenticated) {
    return (
      <>
        <div className="hidden md:block">
          <TopBar />
        </div>
        <DashboardHeader user={user} />
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <TopBar />
      </div>
      <MainHeader />
    </>
  );
}