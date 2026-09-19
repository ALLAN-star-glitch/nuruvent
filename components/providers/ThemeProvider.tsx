// components/providers/ThemeProvider.tsx

'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  hydrateTheme,
  setTheme,
  type Theme,
} from '@/lib/store/slices/themeSlice';
import { THEME_STORAGE_KEY } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { theme, hydrated } = useAppSelector((s) => s.theme);

  // ---- One-time hydration ----
  // Read what the anti-flash script already applied (or what the user
  // last chose) and mirror it into Redux. The script itself already
  // set `.dark` on <html>, so we don't re-apply it here.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as
        | Theme
        | null;

      if (stored === 'light' || stored === 'dark') {
        dispatch(hydrateTheme(stored));
        return;
      }

      // No stored value → fall back to the OS preference.
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      dispatch(hydrateTheme(prefersDark ? 'dark' : 'light'));
    } catch {
      // localStorage can throw in private mode — default to light.
      dispatch(hydrateTheme('light'));
    }
  }, [dispatch]);

  // ---- Persist + apply ----
  // Only runs after hydration, so we don't overwrite the user's
  // stored preference with our SSR default on first mount.
  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore quota / private-mode errors.
    }
  }, [theme, hydrated]);

  // ---- Cross-tab sync ----
  // When the user toggles the theme in another tab, mirror it here.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      if (e.newValue !== 'light' && e.newValue !== 'dark') return;
      dispatch(setTheme(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch]);

  return <>{children}</>;
}