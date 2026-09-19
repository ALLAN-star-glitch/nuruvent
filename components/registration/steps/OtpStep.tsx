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
  email: string;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  successMessage: string | null;
  onVerify: (code: string) => void;
  onResend: () => void;
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

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = () => {
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
        <div className="p-3 sm:p-4 rounded-full bg-primary/10">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
      </div>

      {/* Where the code was sent */}
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          We&apos;ve sent a verification code to:
        </p>
        <p className="text-primary font-medium text-xs sm:text-sm mt-1 break-all">
          {email}
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-tertiary-50 dark:bg-tertiary-950/30 border border-tertiary-200 dark:border-tertiary-900/50 text-tertiary-600 dark:text-tertiary-400 px-4 py-2 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-xl text-sm">
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
      />

      {/* Resend controls */}
      <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-xs sm:text-sm">
        <span className="text-muted-foreground">
          Code expires in {resendTimer > 0 ? resendTimer : 0}s
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={cn(
            'flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
            canResend
              ? 'text-primary hover:underline'
              : 'text-muted-foreground cursor-not-allowed',
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
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Wrong email? Go back and edit
      </button>
    </div>
  );
}