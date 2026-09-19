// lib/theme.ts

import type { Theme } from './store/slices/themeSlice';

/** localStorage key — must match themeSlice.ts. */
export const THEME_STORAGE_KEY = 'nuruvent-theme';

/**
 * Inline script injected into <head>. Runs before React hydrates and
 * sets `.dark` on <html> if the stored/preferred theme is dark.
 *
 * Kept as a plain string so it can be dropped into a <script> tag
 * without any bundler processing — it has to execute *before* the
 * framework boots.
 *
 * Wrapped in try/catch because localStorage can throw in private mode.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (e) {}
})();
`.trim();

/** Convenience type for anywhere else that needs the union. */
export type { Theme };