// app/(dashboard)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';
import { WelcomeBannerWrapper } from '@/components/dashboard/WelcomeBannerWrapper';
import { Toaster } from 'sonner';

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
      {/* Header reads auth state from Redux automatically */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
        <Header />
      </header>

      {/* Client Component for sidebar interaction */}
      <DashboardLayoutClient>
        <div className="p-4 md:p-6 space-y-4">
          {/* ✅ Welcome Banner - Shows at top of dashboard */}
          <WelcomeBannerWrapper />
          
          {/* Page Content */}
          {children}
        </div>
      </DashboardLayoutClient>

      {/* Toaster */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
        visibleToasts={3}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          className: 'font-sans',
        }}
      />
    </div>
  );
}