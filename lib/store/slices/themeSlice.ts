// lib/store/slices/themeSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

/** localStorage key — keep in sync with the anti-flash script (Step 2). */
export const THEME_STORAGE_KEY = 'nuruvent-theme';

interface ThemeState {
  /** Active theme. Default matches SSR so hydration is stable. */
  theme: Theme;
  /**
   * False until the client has read localStorage and dispatched
   * `hydrateTheme`. Used by ThemeProvider to avoid writing to
   * localStorage before we know what the user actually chose.
   */
  hydrated: boolean;
}

const initialState: ThemeState = {
  theme: 'light',
  hydrated: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /** Set an explicit theme (used by cross-tab sync and future settings UI). */
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },

    /** Flip light ↔ dark. This is what the toggle button dispatches. */
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },

    /**
     * One-shot hydration from localStorage. Flips `hydrated` so the
     * provider knows it's safe to start persisting.
     */
    hydrateTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      state.hydrated = true;
    },
  },
});

export const { setTheme, toggleTheme, hydrateTheme } = themeSlice.actions;
export default themeSlice.reducer;