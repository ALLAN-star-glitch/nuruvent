// app/(meeting)/MeetingHeader.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function MeetingHeader() {
  const searchParams = useSearchParams();
  const meetingName = searchParams.get('name');

  return (
    <header className="meeting-header">
      <div className="meeting-header__inner">
        <Link
          href="/dashboard"
          className="meeting-header__brand"
          aria-label="Nuruvent dashboard"
        >
          <Image
            src="/logo.png"
            alt="Nuruvent"
            width={600}
            height={120}
            priority
            className="meeting-header__logo"
          />
        </Link>

        <div className="meeting-header__divider" aria-hidden="true" />

        <div className="meeting-header__context" aria-live="polite">
          <span className="meeting-header__dot" aria-hidden="true" />
          <span className="meeting-header__name">
            {meetingName || 'Live meeting'}
          </span>
          {meetingName && (
            <span className="meeting-header__suffix">Live</span>
          )}
        </div>

        <Link
          href="/dashboard/events"
          className="meeting-header__back"
          aria-label="Back to events"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </Link>
      </div>
    </header>
  );
}