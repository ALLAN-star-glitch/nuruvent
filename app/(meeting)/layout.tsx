// app/(meeting)/layout.tsx

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MeetingHeader } from './MeetingHeader';
import './meeting.css';

export const metadata: Metadata = {
  title: 'Meeting | Nuruvent',
  robots: 'noindex, nofollow',
};

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="meeting-shell">
      <Suspense fallback={<div className="meeting-header" />}>
        <MeetingHeader />
      </Suspense>
      <main className="meeting-main">{children}</main>
    </div>
  );
}