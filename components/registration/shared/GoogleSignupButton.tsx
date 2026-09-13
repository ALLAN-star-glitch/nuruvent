// components/registration/shared/GoogleSignupButton.tsx

'use client';

import { Button } from '@/components/ui/button';

/**
 * Disabled "Continue with Google" button shown at the top of both
 * signup detail forms.
 *
 * Extracted so the two detail steps (`PersonalDetailsStep` and
 * `InstitutionAdminStep`) render identical markup. When Google signup
 * ships, replace the `disabled` prop with an `onClick` handler that
 * starts the OAuth flow — the visual stays the same.
 *
 * The "Coming Soon" badge is absolutely positioned on the right side
 * of the button and doesn't intercept clicks (pointer-events-none).
 */
export function GoogleSignupButton() {
  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        disabled
        className="w-full h-10 sm:h-12 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-medium relative z-10"
      >
        <GoogleIcon className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
        Continue with Google
      </Button>

      {/* Coming Soon badge on the right side */}
      <div className="absolute inset-0 rounded-xl flex items-center justify-end pr-3 sm:pr-4 pointer-events-none z-20">
        <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-white/90 px-2.5 py-1 rounded-full border border-gray-300 shadow-sm">
          Coming Soon
        </span>
      </div>
    </div>
  );
}

/**
 * Google's "G" logo as an inline SVG.
 *
 * Kept inline so there's no extra asset to ship and no external
 * network request. The four brand colors are hardcoded because
 * Google's brand guidelines require them.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}