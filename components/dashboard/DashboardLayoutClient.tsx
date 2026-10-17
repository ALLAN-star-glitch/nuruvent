'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAppSelector } from '@/lib/store/hooks';
import { MobileCreateFab } from './MobileCreateFab';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 relative">
      <DashboardSidebar
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      />

      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[110px]' : 'w-[270px]'
        }`}
      />

      <main className="flex-1 min-w-0 px-4 py-6 pb-20 md:px-8 md:py-8">
        {children}
      </main>

      <MobileBottomNav />
      <MobileCreateFab />
    </div>
  );
}