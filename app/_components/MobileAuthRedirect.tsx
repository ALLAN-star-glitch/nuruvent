'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectIsAuthenticated,
  selectIsHydrated,
} from '@/lib/store/slices/authSlice';

const MOBILE_BREAKPOINT = 768;

// Public routes from which an authenticated mobile user should be
// redirected into the app. Any pathname matching one of these (or
// extending one of these with a segment) triggers the redirect.
//
// Exempt routes — anything not in this list, plus anything starting
// with /dashboard or /profile — pass through untouched. Add or remove
// entries to change which pages behave as "app entry points."
const PUBLIC_PREFIXES = [
  '/',
  '/how-it-works',
  '/about',
  '/contact',
  '/pricing',
  '/blog',
  '/login',
  '/register',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((prefix) => {
    if (prefix === '/') return false;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function MobileAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHydrated = useAppSelector(selectIsHydrated);
  const activeAccountId = useAppSelector((s) => s.workspace.activeAccountId);
  const activeTeamId = useAppSelector((s) => s.workspace.activeTeamId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isHydrated) return;
    if (!isAuthenticated) return;
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;
    if (!isPublicRoute(pathname)) return;

    const target =
      activeAccountId && activeTeamId
        ? `/dashboard/${activeAccountId}/${activeTeamId}`
        : activeAccountId
          ? `/dashboard/${activeAccountId}`
          : '/accounts';

    router.replace(target);
  }, [
    pathname,
    isAuthenticated,
    isHydrated,
    activeAccountId,
    activeTeamId,
    router,
  ]);

  return null;
}