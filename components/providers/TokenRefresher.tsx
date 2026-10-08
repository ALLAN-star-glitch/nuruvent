// components/providers/TokenRefresher.tsx

'use client';

import { useTokenRefresh } from '@/lib/store/hooks/useTokenRefresh';

/**
 * Mounts the periodic token-refresh hook. Renders nothing.
 *
 * Place inside PersistGate so it reads the rehydrated auth state on
 * first render, not the initial value.
 */
export function TokenRefresher() {
  useTokenRefresh();
  return null;
}