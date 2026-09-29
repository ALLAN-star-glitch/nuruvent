// app/(dashboard)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';


export const metadata: Metadata = {
  title: 'Dashboard | Nuruvent',
  description: 'Manage your events, attendees, and payments.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header reads auth state from Redux automatically */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-sm">
        <Header />
      </header>

      {/* Client Component for sidebar interaction */}
      <DashboardLayoutClient>
        <div className="p-4 md:p-6 space-y-4">
          {/* Page Content */}
          {children}
        </div>
      </DashboardLayoutClient>

      
    </div>
  );
}