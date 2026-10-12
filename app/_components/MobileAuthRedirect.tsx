// app/_components/MobileAuthRedirect.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectIsAuthenticated,
  selectIsHydrated,
} from '@/lib/store/slices/authSlice';

/**
 * Mobile-only redirect.
 *
 * A logged-in user opening the app on a phone should land in the app,
 * not on the marketing homepage. Desktop users keep the marketing page —
 * showing it at `/` is intentional there.
 *
 * Behaviour:
 *   - Viewport >= 768px     → no-op (desktop).
 *   - Not authenticated     → no-op.
 *   - Redux not yet hydrated → no-op (wait for the persisted state).
 *   - Mobile + auth + hydrated → router.replace to the active workspace.
 *
 * The target mirrors the workspace slice:
 *   - Both account & team set → /dashboard/<accountId>/<teamId>
 *   - Only account set        → /dashboard/<accountId>
 *   - Neither set             → /accounts (workspace picker)
 */
const MOBILE_BREAKPOINT = 768;

export function MobileAuthRedirect() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHydrated = useAppSelector(selectIsHydrated);
  const activeAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const activeTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isHydrated) return;
    if (!isAuthenticated) return;
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;

    const target =
      activeAccountId && activeTeamId
        ? `/dashboard/${activeAccountId}/${activeTeamId}`
        : activeAccountId
          ? `/dashboard/${activeAccountId}`
          : '/accounts';

    router.replace(target);
  }, [
    isAuthenticated,
    isHydrated,
    activeAccountId,
    activeTeamId,
    router,
  ]);

  return null;
}