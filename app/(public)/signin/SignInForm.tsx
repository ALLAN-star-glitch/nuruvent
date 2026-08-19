// components/auth/SignInForm.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OtpInput } from '@/components/ui/OtpInput';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLoginMutation, useVerifyTwoFactorMutation, useResendOTPMutation } from '@/lib/store/api/authApi';
import { setTwoFactorEmail } from '@/lib/store/slices/authSlice';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, twoFactorEmail, loginStep } = useAppSelector((state) => state.auth);
  
  // ✅ Check if session expired
  const sessionExpired = searchParams.get('session') === 'expired';
  
  // RTK Query hooks
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyTwoFactor, { isLoading: isVerifyLoading }] = useVerifyTwoFactorMutation();
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

  // ✅ Ref for OTP to avoid race condition
  const otpRef = useRef('');

  // ✅ Show session expired message
  useEffect(() => {
    if (sessionExpired) {
      setSessionExpiredMessage(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setSessionExpiredMessage(false);
        // Clean up URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete('session');
        window.history.replaceState({}, '', url.toString());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired]);

  // ✅ DEBUG: Track where error is being set
  useEffect(() => {
    if (error) {
      console.log('🔴 Error was set to:', error);
      console.trace('Stack trace:');
    }
  }, [error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // If 2FA is required from Redux state, show the 2FA input
  useEffect(() => {
    if (loginStep === 'two_factor' && twoFactorEmail) {
      setShowTwoFactor(true);
      setResendTimer(60);
      setSuccessMessage('2FA code sent to your email');
      setError(null);
    }
  }, [loginStep, twoFactorEmail]);

  // Resend timer countdown
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

  // ✅ OTP change handler - updates both state and ref
  const handleOtpChange = (value: string) => {
    otpRef.current = value;
    setTwoFactorOtp(value);
    setError(null);
    setSuccessMessage(null);
  };

  // ✅ Updated handleSubmit with proper 2FA handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Clear ALL states at the very beginning
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

      // ✅ Check for requires_2fa in response.data
      if (response.data && 'requires_2fa' in response.data && response.data.requires_2fa === true) {
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

      // ✅ Check for access_token (direct login)
      if (response.data && 'access_token' in response.data) {
        console.log('✅ Direct login successful');
        router.push('/dashboard');
        setIsLoading(false);
        return;
      }

      // ✅ Fallback
      router.push('/dashboard');
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('❌ Login error caught:', err);
      
      // ✅ Check if error contains 2FA data (fallback)
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
      
      // ✅ Real error - show message
      setError(err.data?.message || 'Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  // ✅ Verify 2FA - uses ref for latest value
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
      const response = await verifyTwoFactor({
        email: twoFactorEmail || formData.email,
        otp: code,
      }).unwrap();

      // ✅ Check if verification was successful
      if (response.data?.account) {
        router.push('/dashboard');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.data?.message || 'Invalid 2FA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Resend 2FA OTP
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

  const isLoadingCombined = isLoading || isLoginLoading || isVerifyLoading || isResendLoading;

  // ============================================================
  // RENDER 2FA STEP
  // ============================================================
  if (showTwoFactor) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-white/80 to-white/60" />
        
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40" viewBox="0 0 200 200" fill="none">
            <pattern id="dotPattern2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
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
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Two-Factor Authentication</h1>
            <p className="text-sm text-gray-600 mt-0.5">Enter the 6-digit code sent to your email</p>
            <p className="text-xs text-[#1A73E8] font-medium mt-1 break-all">{twoFactorEmail || formData.email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8"
          >
            <div className="space-y-6 text-center">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
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
                <span className="text-gray-500">
                  Code expires in {resendTimer > 0 ? resendTimer : 0}s
                </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isResendLoading}
                  className={cn(
                    "flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
                    resendTimer > 0 || isResendLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#1A73E8] hover:underline"
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
                className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                ← Back to sign in
              </button>
            </div>
          </motion.div>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>Secure & encrypted</span>
              <span className="w-px h-3 bg-gray-300" />
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
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-white">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-white/80 to-white/60" />
      
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40" viewBox="0 0 200 200" fill="none">
          <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
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
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-0.5">Sign in to your Nuruvent account</p>
          <p className="text-xs text-gray-400 mt-1">Manage Your Events. Get Paid. Build Your Brand.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8"
        >
          {/* ✅ Session Expired Message */}
          {sessionExpiredMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && !showTwoFactor && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={isLoadingCombined}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoadingCombined}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  className="h-4 w-4 rounded border-gray-300 text-[#1A73E8] focus:ring-[#1A73E8] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#1A73E8] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoadingCombined}
              className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#1A73E8] font-medium hover:underline cursor-pointer">
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
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-3 bg-gray-300" />
            <Sparkles className="h-3 w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}