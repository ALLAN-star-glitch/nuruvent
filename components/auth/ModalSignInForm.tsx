// components/auth/ModalSignInForm.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OtpInput } from '@/components/ui/OtpInput';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLoginMutation, useVerifyTwoFactorMutation, useResendOTPMutation } from '@/lib/store/api/authApi';
import { setTwoFactorEmail } from '@/lib/store/slices/authSlice';

interface ModalSignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export function ModalSignInForm({ onSuccess, onSwitchToSignUp }: ModalSignInFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, twoFactorEmail, loginStep } = useAppSelector((state) => state.auth);
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyTwoFactor, { isLoading: isVerifyLoading }] = useVerifyTwoFactorMutation();
  const [resendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, router, onSuccess]);

  // If 2FA is required from Redux state, show the 2FA input
  useEffect(() => {
    if (loginStep === 'two_factor' && twoFactorEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    // TODO: Implement Google OAuth signin
    try {
      // Simulate Google signin
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleOtpChange = (value: string) => {
    setTwoFactorOtp(value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Check for requires_2fa
      if (response.data && 'requires_2fa' in response.data && response.data.requires_2fa === true) {
        setError(null);
        const email = response.data.email || formData.email;
        dispatch(setTwoFactorEmail(email));
        setShowTwoFactor(true);
        setTwoFactorOtp('');
        setResendTimer(60);
        setSuccessMessage('2FA code sent to your email');
        setIsLoading(false);
        return;
      }

      // Direct login successful
      if (response.data && 'access_token' in response.data) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if error contains 2FA data (fallback)
      if (err.data?.data?.requires_2fa === true) {
        setError(null);
        const email = err.data.data.email || formData.email;
        dispatch(setTwoFactorEmail(email));
        setShowTwoFactor(true);
        setTwoFactorOtp('');
        setResendTimer(60);
        setSuccessMessage('2FA code sent to your email');
        setIsLoading(false);
        return;
      }
      
      setError(err.data?.message || 'Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (twoFactorOtp.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await verifyTwoFactor({
        email: twoFactorEmail || formData.email,
        otp: twoFactorOtp,
      }).unwrap();

      if (response.data?.account) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Verification failed. Please try again.');
      }
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
    } catch (err: any) {
      setError(err.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  const isLoadingCombined = isLoading || isLoginLoading || isVerifyLoading || isResendLoading;

  // 2FA View
  if (showTwoFactor) {
    return (
      <div className="space-y-6 text-center py-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-[#1A73E8]/10">
            <Mail className="h-6 w-6 text-[#1A73E8]" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
          <p className="text-xs text-[#1A73E8] font-medium mt-1 break-all">{twoFactorEmail || formData.email}</p>
        </div>

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
          id="modal-2fa-otp-input"
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
              'Resend code'
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
            setError(null);
            setSuccessMessage(null);
            dispatch(setTwoFactorEmail(null));
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  // Main Sign In View
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* ✅ Continue with Google Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-500">or sign in with email</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            disabled={isLoadingCombined}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={isLoadingCombined}
            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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

      {onSwitchToSignUp && (
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[#1A73E8] font-medium hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </p>
      )}
    </form>
  );
}