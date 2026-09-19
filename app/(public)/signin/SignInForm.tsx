// components/auth/SignInForm.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OtpInput } from '@/components/ui/OtpInput';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useResendOTPMutation,
} from '@/lib/store/api/authApi';
import { setTwoFactorEmail } from '@/lib/store/slices/authSlice';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, twoFactorEmail, loginStep } = useAppSelector(
    (state) => state.auth,
  );

  const sessionExpired = searchParams.get('session') === 'expired';

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyTwoFactor, { isLoading: isVerifyLoading }] =
    useVerifyTwoFactorMutation();
  const [resendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);

  const otpRef = useRef('');

  useEffect(() => {
    if (sessionExpired) {
      setSessionExpiredMessage(true);
      const timer = setTimeout(() => {
        setSessionExpiredMessage(false);
        const url = new URL(window.location.href);
        url.searchParams.delete('session');
        window.history.replaceState({}, '', url.toString());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (error) {
      console.log('🔴 Error was set to:', error);
      console.trace('Stack trace:');
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (loginStep === 'two_factor' && twoFactorEmail) {
      setShowTwoFactor(true);
      setResendTimer(60);
      setSuccessMessage('2FA code sent to your email');
      setError(null);
    }
  }, [loginStep, twoFactorEmail]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
    if (sessionExpiredMessage) setSessionExpiredMessage(false);
  };

  const handleOtpChange = (value: string) => {
    otpRef.current = value;
    setTwoFactorOtp(value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setSessionExpiredMessage(false);
    setIsLoading(true);

    console.log('🔍 Login attempt for:', formData.email);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      console.log('✅ Login response:', response);

      if (
        response.data &&
        'requires_2fa' in response.data &&
        response.data.requires_2fa === true
      ) {
        console.log('✅ 2FA required, showing 2FA screen');

        setError(null);
        const email = response.data.email || formData.email;
        dispatch(setTwoFactorEmail(email));
        setShowTwoFactor(true);
        setTwoFactorOtp('');
        otpRef.current = '';
        setResendTimer(60);
        setSuccessMessage('2FA code sent to your email');

        setTimeout(() => {
          const input = document.getElementById('2fa-otp-input');
          if (input) (input as HTMLInputElement)?.focus();
        }, 100);

        setIsLoading(false);
        return;
      }

      if (response.data && 'access_token' in response.data) {
        console.log('✅ Direct login successful');
        router.push('/dashboard');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ Login error caught:', err);

      if (err.data?.data?.requires_2fa === true) {
        console.log('✅ 2FA found in error response');
        setError(null);
        const email = err.data.data.email || formData.email;
        dispatch(setTwoFactorEmail(email));
        setShowTwoFactor(true);
        setTwoFactorOtp('');
        otpRef.current = '';
        setResendTimer(60);
        setSuccessMessage('2FA code sent to your email');
        setTimeout(() => {
          const input = document.getElementById('2fa-otp-input');
          if (input) (input as HTMLInputElement)?.focus();
        }, 100);
        setIsLoading(false);
        return;
      }

      setError(
        err.data?.message || 'Invalid email or password. Please try again.',
      );
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    const code = otpRef.current;
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await verifyTwoFactor({
        email: twoFactorEmail || formData.email,
        otp: code,
      }).unwrap();

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || 'Invalid 2FA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      await resendOTP({
        email: twoFactorEmail || formData.email,
        purpose: 'two_factor',
      }).unwrap();

      setSuccessMessage('New 2FA code sent to your email');
      setResendTimer(60);
      setTwoFactorOtp('');
      otpRef.current = '';
      setTimeout(() => {
        const input = document.getElementById('2fa-otp-input');
        if (input) (input as HTMLInputElement)?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  const isLoadingCombined =
    isLoading || isLoginLoading || isVerifyLoading || isResendLoading;

  // ============================================================
  // RENDER 2FA STEP
  // ============================================================
  if (showTwoFactor) {
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
              <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern2)" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-12 w-96 h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground mt-2">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter the 6-digit code sent to your email
            </p>
            <p className="text-xs text-primary font-medium mt-1 break-all">
              {twoFactorEmail || formData.email}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-6 md:p-8"
          >
            <div className="space-y-6 text-center">
              {successMessage && (
                <div className="bg-tertiary-50 dark:bg-tertiary-950/30 border border-tertiary-200 dark:border-tertiary-900/50 text-tertiary-600 dark:text-tertiary-400 px-4 py-2 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <OtpInput
                id="2fa-otp-input"
                value={twoFactorOtp}
                onChange={handleOtpChange}
                length={6}
                placeholder="Enter 2FA code"
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
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isResendLoading}
                  className={cn(
                    'flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
                    resendTimer > 0 || isResendLoading
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-primary hover:underline',
                  )}
                >
                  {isResendLoading ? (
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

              <Button
                onClick={handleVerifyTwoFactor}
                disabled={isLoadingCombined || twoFactorOtp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoadingCombined ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowTwoFactor(false);
                  setTwoFactorOtp('');
                  otpRef.current = '';
                  setError(null);
                  setSuccessMessage(null);
                  dispatch(setTwoFactorEmail(null));
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                ← Back to sign in
              </button>
            </div>
          </motion.div>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
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
  // RENDER MAIN SIGN IN FORM
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
            <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground mt-2">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sign in to your Nuruvent account
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Your Events. Get Paid. Build Your Brand.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-6 md:p-8"
        >
          {/* Session expired */}
          {sessionExpiredMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </motion.div>
          )}

          {/* Google button (disabled) */}
          <div className="relative w-full mb-4">
            <Button
              type="button"
              variant="outline"
              disabled={true}
              className="w-full h-10 sm:h-12 border-border bg-muted text-foreground cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-medium relative z-10"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 opacity-50"
                viewBox="0 0 24 24"
              >
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
              Continue with Google
            </Button>

            <div className="absolute inset-0 rounded-xl flex items-center justify-end pr-3 sm:pr-4 pointer-events-none z-20">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-background/90 px-2.5 py-1 rounded-full border border-border shadow-sm">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-card text-muted-foreground">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && !showTwoFactor && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={isLoadingCombined}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-background focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 border-border text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoadingCombined}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border transition-all bg-background focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 border-border text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoadingCombined}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoadingCombined}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoadingCombined ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                Get Started
              </Link>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-3 bg-border" />
            <Sparkles className="h-3 w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}