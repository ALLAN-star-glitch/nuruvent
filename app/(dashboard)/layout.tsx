// app/(dashboard)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';
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

      {/* Toaster — sonner renders via portal, so the theme comes from
          its own CSS vars, not Tailwind classes on the element. Use
          `theme="system"` to follow the OS, or wire it to your Redux
          theme state to follow the toggle. */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
        visibleToasts={3}
        theme="system"
        toastOptions={{
          classNames: {
            toast: 'font-sans',
          },
        }}
      />
    </div>
  );
}