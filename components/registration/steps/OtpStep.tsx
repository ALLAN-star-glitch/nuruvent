// components/registration/steps/OtpStep.tsx

'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/OtpInput';
import { cn } from '@/lib/utils';

import { RESEND_OTP_COOLDOWN_SECONDS } from '../constants';

// ============================================================
// PROPS
// ============================================================

interface OtpStepProps {
  /** Email the code was sent to. Displayed to the user. */
  email: string;

  /** True while a verify request is in flight. */
  isVerifying: boolean;

  /** True while a resend request is in flight. */
  isResending: boolean;

  /** Error message from the last verify or resend attempt. */
  error: string | null;

  /** Success message (e.g. after a successful resend). */
  successMessage: string | null;

  /**
   * Called when the user clicks "Verify Email" with a complete code.
   * The parent performs the API call and reports back via `isVerifying`
   * and `error`.
   */
  onVerify: (code: string) => void;

  /**
   * Called when the user clicks "Resend code". The parent performs the
   * API call and reports back via `isResending` and `successMessage`.
   * The step manages its own cooldown timer.
   */
  onResend: () => void;

  /** Called when the user clicks "Back" to edit the previous step. */
  onBack: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function OtpStep({
  email,
  isVerifying,
  isResending,
  error,
  successMessage,
  onVerify,
  onResend,
  onBack,
}: OtpStepProps) {
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_OTP_COOLDOWN_SECONDS);

  // Countdown tick. Runs once per second while the timer is above 0.
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = () => {
    // Guard against double-clicks while the cooldown is active or
    // while a resend is already in flight.
    if (resendTimer > 0 || isResending) return;

    onResend();
    setCode('');
    setResendTimer(RESEND_OTP_COOLDOWN_SECONDS);
  };

  const handleVerify = () => {
    if (code.length !== 6) return;
    onVerify(code);
  };

  const isBusy = isVerifying || isResending;
  const canResend = resendTimer === 0 && !isResending;

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="p-3 sm:p-4 rounded-full bg-[#1A73E8]/10">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A73E8]" />
        </div>
      </div>

      {/* Where the code was sent */}
      <div>
        <p className="text-xs sm:text-sm text-gray-500">
          We&apos;ve sent a verification code to:
        </p>
        <p className="text-[#1A73E8] font-medium text-xs sm:text-sm mt-1 break-all">
          {email}
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* OTP input */}
      <OtpInput
        id="otp-input"
        value={code}
        onChange={setCode}
        length={6}
        placeholder="Enter verification code"
        disabled={isBusy}
        error={error ?? undefined}
        autoFocus
        // Intentionally no `onComplete` — API is called only when the
        // user clicks "Verify Email". Auto-submit caused race conditions
        // in earlier iterations.
      />

      {/* Resend controls */}
      <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-xs sm:text-sm">
        <span className="text-gray-500">
          Code expires in {resendTimer > 0 ? resendTimer : 0}s
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={cn(
            'flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
            canResend
              ? 'text-[#1A73E8] hover:underline'
              : 'text-gray-400 cursor-not-allowed',
          )}
        >
          {isResending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Resend code
            </>
          )}
        </button>
      </div>

      {/* Verify button */}
      <Button
        onClick={handleVerify}
        disabled={isBusy || code.length !== 6}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </Button>

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        disabled={isBusy}
        className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline-offset-4 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Wrong email? Go back and edit
      </button>
    </div>
  );
}