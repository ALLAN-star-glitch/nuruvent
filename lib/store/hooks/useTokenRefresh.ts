// lib/store/hooks/useTokenRefresh.ts
'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/lib/store/hooks';

// Refresh at ~80% of the access token lifetime.
// Backend: JWT_ACCESS_EXPIRATION=15m → refresh at 12 min.
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;

export function useTokenRefresh() {
  const isAuthenticated = useAppSelector((s) => s.auth?.isAuthenticated ?? false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      return;
    }

    const tick = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      } catch {
        // Network blip — the reactive wrapper handles the next 401.
      }
    };

    // Do NOT tick on mount.
    //
    // The reactive base query (baseQueryWithReauth) already handles the
    // "cookie expired on arrival" case by refreshing and retrying the
    // original request. Firing the timer on mount races that path and
    // can consume the refresh token twice — the backend rotates on every
    // refresh, so the second call 401s.
    //
    // The timer only handles "I've been open for 12 minutes", which the
    // reactive wrapper would miss. That's its whole job.
    timer.current = setInterval(tick, REFRESH_INTERVAL_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [isAuthenticated]);
}