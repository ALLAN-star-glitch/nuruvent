// components/auth/SignInForm.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLoginMutation, useVerifyTwoFactorMutation } from '@/lib/store/api/authApi';
import { setTwoFactorEmail } from '@/lib/store/slices/authSlice';

export function SignInForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, twoFactorEmail } = useAppSelector((state) => state.auth);
  
  // RTK Query hooks
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyTwoFactor, { isLoading: isVerifyLoading }] = useVerifyTwoFactorMutation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState(['', '', '', '', '', '']);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // If 2FA is required, show the 2FA input
  useEffect(() => {
    if (twoFactorEmail) {
      setShowTwoFactor(true);
    }
  }, [twoFactorEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...twoFactorOtp];
    newOtp[index] = value;
    setTwoFactorOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !twoFactorOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // If 2FA is required, the response will contain the email
      if (response.data?.email) {
        dispatch(setTwoFactorEmail(response.data.email));
        setShowTwoFactor(true);
        // Reset OTP when 2FA is shown
        setTwoFactorOtp(['', '', '', '', '', '']);
        // Focus first OTP input
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          if (firstInput) (firstInput as HTMLInputElement)?.focus();
        }, 100);
      } else {
        // Direct login (if 2FA not required)
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    const otpValue = twoFactorOtp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyTwoFactor({
        email: twoFactorEmail || formData.email,
        otp: otpValue,
      }).unwrap();

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || 'Invalid 2FA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Placeholder function - no API call
  const handleResendCode = () => {
    // UI-only: shows feedback without making an API call
    console.log('Resend code clicked - functionality coming soon');
    // You could add a simple toast notification here if you have one
  };

  const isLoadingCombined = isLoading || isLoginLoading || isVerifyLoading;

  // Render 2FA Step
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
            <p className="text-xs text-[#1A73E8] font-medium mt-1">{twoFactorEmail || formData.email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8"
          >
            <div className="space-y-6 text-center">
              <div className="flex justify-center gap-2">
                {twoFactorOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 cursor-text",
                      error && !digit ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#1A73E8]"
                    )}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-gray-500">Code expires in 4:59</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[#1A73E8] font-medium hover:underline transition-colors cursor-pointer"
                >
                  Resend code
                </button>
              </div>

              <Button
                onClick={handleVerifyTwoFactor}
                disabled={isLoadingCombined || twoFactorOtp.join('').length !== 6}
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
                  setTwoFactorOtp(['', '', '', '', '', '']);
                  setError(null);
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

  // Main Sign In Form
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