// app/(dashboard)/DashboardLayoutClient.tsx

'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useAppSelector } from '@/lib/store/hooks';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Show loading state while auth is being restored
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 relative">
      {/* Sidebar - Floating with glassmorphism */}
      <DashboardSidebar 
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      />

      {/* Spacer that adjusts based on sidebar state */}
      <div 
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[110px]' : 'w-[270px]'
        }`} 
      />

      {/* Main Content - Children will now include the welcome banner via the layout */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6">
        {children}
      </main>
    </div>
  );
}