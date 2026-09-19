// components/shared/ThemeToggle.tsx

'use client';

import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toggleTheme } from '@/lib/store/slices/themeSlice';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  /** Optional accessible label override. */
  label?: string;
}

export function ThemeToggle({ className, label }: ThemeToggleProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);
  const hydrated = useAppSelector((s) => s.theme.hydrated);

  const isDark = theme === 'dark';

  // Until the provider has hydrated, render the button in a neutral
  // state. Prevents a Sun→Moon icon flip on first paint for users
  // whose stored theme is dark.
  const icon = !hydrated ? null : isDark ? (
    <Sun className="h-4 w-4 md:h-4.5 md:w-4.5" />
  ) : (
    <Moon className="h-4 w-4 md:h-4.5 md:w-4.5" />
  );

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={
        label ?? (isDark ? 'Switch to light mode' : 'Switch to dark mode')
      }
      className={cn(
        // Size + shape
        'h-8 w-8 sm:h-9 sm:w-9 rounded-full',
        // Layout
        'inline-flex items-center justify-center',
        // Interaction
        'cursor-pointer transition-colors',
        // Colors — resolve through your existing semantic tokens, so
        // both themes are covered without `dark:` variants.
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        className,
      )}
    >
      {icon}
    </button>
  );
}