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

    let cancelled = false;

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
        // Network blip — the reactive wrapper will catch the next 401.
      }
    };

    // Fire once on mount so a long-idle tab refreshes immediately.
    tick();

    timer.current = setInterval(tick, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [isAuthenticated]);
}