// components/registration/shared/OrDivider.tsx

'use client';

interface OrDividerProps {
  /**
   * Text to display in the middle of the divider.
   * Defaults to "or sign up with email".
   */
  label?: string;
}

/**
 * Horizontal separator with a centered label.
 *
 * The implementation uses an absolutely positioned line behind a
 * background-colored label, so the line appears to break around the
 * text. This is the standard pattern for "or" dividers and works
 * regardless of the surrounding background color as long as the
 * label has a solid background.
 *
 * The label's `bg-white` matches the card background. If the card
 * background changes (e.g. dark mode), update the label's background
 * class here — it's the only place it appears.
 */
export function OrDivider({ label = 'or sign up with email' }: OrDividerProps) {
  return (
    <div className="relative">
      {/* The line, positioned absolutely so the label can sit on top */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>

      {/* The label, centered with a solid background to "cut" the line */}
      <div className="relative flex justify-center text-xs sm:text-sm">
        <span className="px-3 sm:px-4 bg-white text-gray-500">{label}</span>
      </div>
    </div>
  );
}