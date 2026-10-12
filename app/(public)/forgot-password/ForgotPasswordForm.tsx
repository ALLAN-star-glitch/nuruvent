/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Shield,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { OtpInput } from '@/components/ui/OtpInput';
import { generateStrongPassword } from '@/lib/utils/password';

// Redux imports
import {
  useForgotPasswordMutation,
  useVerifyResetOTPMutation,
  useResendOTPMutation,
} from '@/lib/store/api/authApi';

export function ForgotPasswordForm() {
  const router = useRouter();

  // RTK Query hooks
  const [forgotPassword, { isLoading: isForgotLoading }] =
    useForgotPasswordMutation();
  const [verifyResetOTP, { isLoading: isVerifyLoading }] =
    useVerifyResetOTPMutation();
  const [resendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();

  // Form state
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Ref for OTP
  const otpRef = useRef('');

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
    if (passwordError) setPasswordError(null);
  };

  const handlePasswordChange = (value: string) => {
    setFormData({
      ...formData,
      newPassword: value,
    });
    if (passwordError) setPasswordError(null);
    if (error) setError(null);
  };

  // Only updates state — NO API call.
  const handleOtpChange = (value: string) => {
    otpRef.current = value;
    setOtp(value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setFormData({
      ...formData,
      newPassword: newPassword,
    });
    setPasswordError(null);
  };

  // Step 1: Send OTP
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (!formData.email) {
      setError('Email is required');
      return;
    }

    if (formData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword({
        email: formData.email,
        new_password: formData.newPassword,
      }).unwrap();

      setStep('otp');
      setResendTimer(60);
      setSuccessMessage('OTP sent to your email');
      setTimeout(() => {
        const input = document.getElementById('reset-otp-input');
        if (input) (input as HTMLInputElement)?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP — only called on button click.
  const handleVerifyOTP = async () => {
    const code = otpRef.current;
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await verifyResetOTP({
        email: formData.email,
        otp: code,
      }).unwrap();

      setStep('success');
    } catch (err: any) {
      setError(err.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      await resendOTP({
        email: formData.email,
        purpose: 'password_reset',
      }).unwrap();

      setSuccessMessage('New OTP sent to your email');
      setResendTimer(60);
      setOtp('');
      otpRef.current = '';
      setTimeout(() => {
        const input = document.getElementById('reset-otp-input');
        if (input) (input as HTMLInputElement)?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const isLoadingCombined =
    isLoading || isForgotLoading || isVerifyLoading || isResendLoading;

  // ============================================================
  // STEP 3: SUCCESS
  // ============================================================
  if (step === 'success') {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-background">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />

        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40"
            viewBox="0 0 200 200"
            fill="none"
          >
            <pattern
              id="dotPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="currentColor" className="text-primary" opacity="0.3" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mt-2">
              Password Reset
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your password has been reset successfully
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/60 p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Password Reset Complete!
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
            <Link href="/signin">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer">
                Back to Sign In
              </Button>
            </Link>
          </div>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <Shield className="h-3 w-3" />
              <span>Secure & encrypted</span>
              <span className="w-px h-3 bg-border" />
              <Sparkles className="h-3 w-3" />
              <span>Powered by Nuruvent</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP 2: OTP VERIFICATION
  // ============================================================
  if (step === 'otp') {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-background">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />

        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40"
            viewBox="0 0 200 200"
            fill="none"
          >
            <pattern
              id="dotPattern2"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="currentColor" className="text-primary" opacity="0.3" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern2)" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mt-2">
              Verify OTP
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter the 6-digit code sent to your email
            </p>
            <p className="text-xs text-primary font-medium mt-1 break-all">
              {formData.email}
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/60 p-6 md:p-8">
            <div className="space-y-6 text-center">
              {successMessage && (
                <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <OtpInput
                id="reset-otp-input"
                value={otp}
                onChange={handleOtpChange}
                length={6}
                placeholder="Enter OTP"
                disabled={isLoadingCombined}
                error={error}
                autoFocus={true}
              />

              <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-sm">
                <span className="text-muted-foreground">
                  Code expires in {resendTimer > 0 ? resendTimer : 0}s
                </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isResendLoading}
                  className={cn(
                    'flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
                    resendTimer > 0 || isResendLoading
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'text-primary hover:underline',
                  )}
                >
                  {isResendLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend code'
                  )}
                </button>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoadingCombined || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoadingCombined ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Reset Password'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  otpRef.current = '';
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                ← Back to email
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <Shield className="h-3 w-3" />
              <span>Secure & encrypted</span>
              <span className="w-px h-3 bg-border" />
              <Sparkles className="h-3 w-3" />
              <span>Powered by Nuruvent</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP 1: EMAIL & PASSWORD
  // ============================================================
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />

      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40"
          viewBox="0 0 200 200"
          fill="none"
        >
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="2" fill="currentColor" className="text-primary" opacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mt-2">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter your email and new password
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/60 p-6 md:p-8">
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {passwordError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={isLoadingCombined}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-background text-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 border-border placeholder:text-muted-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field with Generate Button */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Password <span className="text-destructive">*</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleGeneratePassword}
                  className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Generate
                </Button>
              </div>
              <PasswordInput
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                required
                showStrength
                showRequirements
                error={passwordError || undefined}
                label={false}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoadingCombined}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoadingCombined ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                'Send OTP'
              )}
            </Button>

            <Link
              href="/signin"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </form>
        </div>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-3 bg-border" />
            <Sparkles className="h-3 w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </div>
      </div>
    </div>
  );
}