import type { Metadata } from 'next';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Dashboard | Nuruvent',
  description: 'Manage your events, attendees, and payments.',
};

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'host' as const,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm overflow-hidden">
        <Header isAuthenticated={true} user={mockUser} />
      </header>

      {/* Main Body */}
      <div className="flex flex-1 items-start relative z-30">
        <DashboardSidebar role={mockUser.role} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}