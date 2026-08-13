// app/(dashboard)/DashboardLayoutClient.tsx
'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  role: 'host' | 'attendee' | 'admin';
}

export function DashboardLayoutClient({ children, role }: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-1 relative">
      {/* Sidebar - Floating with glassmorphism */}
      <DashboardSidebar 
        role={role} 
        onCollapseChange={setCollapsed}
        collapsed={collapsed}
      />

      {/* Spacer that adjusts based on sidebar state */}
      <div 
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[110px]' : 'w-[270px]'
        }`} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6">
        {children}
      </main>
    </div>
  );
}