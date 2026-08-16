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
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* ✅ Header reads auth state from Redux automatically */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
        <Header />
      </header>

      {/* Client Component for sidebar interaction */}
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </div>
  );
}