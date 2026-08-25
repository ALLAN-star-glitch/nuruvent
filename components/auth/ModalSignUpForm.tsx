// components/auth/ModalSignUpForm.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Mail, Phone, User, Lock, Loader2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/lib/store/hooks';
import { useRegisterPersonalMutation, useVerifyOTPMutation, useResendOTPMutation } from '@/lib/store/api/authApi';
import { setOtpEmail } from '@/lib/store/slices/authSlice';
import { validatePassword, generateStrongPassword } from '@/lib/utils/password';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { OtpInput } from '@/components/ui/OtpInput';

interface ModalSignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
  prefillData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function ModalSignUpForm({ onSuccess, onSwitchToSignIn, prefillData }: ModalSignUpFormProps) {
  const dispatch = useAppDispatch();
  const [registerPersonal, { isLoading: isRegisterLoading }] = useRegisterPersonalMutation();
  const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: prefillData?.name || '',
    email: prefillData?.email || '',
    phone: prefillData?.phone || '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [registrationEmail, setRegistrationEmail] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    const validation = validatePassword(value);
    if (!validation.isValid && value.length > 0) {
      setPasswordError(validation.errors[0] || null);
    } else {
      setPasswordError(null);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    const validation = validatePassword(newPassword);
    if (validation.isValid) {
      setPasswordError(null);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setPasswordError(validation.errors[0] || 'Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await registerPersonal({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        account_type: 'account_type_personal',
      }).unwrap();

      const email = response.data?.email || formData.email;
      setRegistrationEmail(email);
      dispatch(setOtpEmail(email));
      setStep('otp');
      setResendTimer(60);
      setOtpSuccess('Verification code sent to your email');
    } catch (error: any) {
      const message = error.data?.message || 'Registration failed. Please try again.';
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Manual OTP verification with button
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setOtpError(null);
    setOtpSuccess(null);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }

    const email = registrationEmail || formData.email;
    if (!email) {
      setOtpError('Email not found. Please try again.');
      return;
    }

    setIsLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      await verifyOTP({
        email: email,
        otp: otp,
      }).unwrap();
      
      // ✅ Registration complete - call onSuccess
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setOtpError(error.data?.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtpError(null);
    setOtpSuccess(null);
    
    const email = registrationEmail || formData.email;
    if (!email) {
      setOtpError('Email not found. Please try again.');
      return;
    }

    setResendTimer(60);
    
    resendOTP({ 
      email: email,
      purpose: 'registration'
    })
      .unwrap()
      .then(() => {
        setOtpSuccess('New verification code sent to your email');
        setOtp('');
        setTimeout(() => {
          const input = document.getElementById('modal-signup-otp-input');
          if (input) (input as HTMLInputElement)?.focus();
        }, 100);
      })
      .catch((error: any) => {
        const message = error.data?.message || 'Failed to resend OTP. Please try again.';
        setOtpError(message);
        setResendTimer(0);
      });
  };

  const isLoadingCombined = isLoading || isRegisterLoading || isVerifyLoading || isResendLoading;

  // OTP View
  if (step === 'otp') {
    return (
      <div className="space-y-6 text-center py-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-[#1A73E8]/10">
            <Mail className="h-6 w-6 text-[#1A73E8]" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Verify Your Email</h3>
          <p className="text-sm text-gray-500 mt-1">We&apos;ve sent a verification code to:</p>
          <p className="text-[#1A73E8] font-medium text-sm mt-1 break-all">{registrationEmail || formData.email}</p>
        </div>

        {otpSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm">
            {otpSuccess}
          </div>
        )}
        
        {otpError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
            {otpError}
          </div>
        )}

        <OtpInput
          id="modal-signup-otp-input"
          value={otp}
          onChange={handleOtpChange}
          length={6}
          placeholder="Enter verification code"
          disabled={isLoadingCombined}
          error={otpError}
          autoFocus={true}
        />

        <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-sm">
          <span className="text-gray-500">
            Code expires in {resendTimer > 0 ? resendTimer : 0}s
          </span>
          <button
            type="button"
            onClick={handleResendOtp}
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

        {/* ✅ Manual Verify Button */}
        <Button
          onClick={handleVerifyOtp}
          disabled={isLoadingCombined || otp.length !== 6}
          className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoadingCombined ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying...
            </span>
          ) : (
            'Verify & Create Account'
          )}
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep('details');
            setOtp('');
            setOtpError(null);
            setOtpSuccess(null);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          ← Back to details
        </button>
      </div>
    );
  }

  // Main Sign Up View
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {errors.email && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {errors.email}
        </div>
      )}

      {/* Continue with Google Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
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
          <span className="px-3 bg-white text-gray-500">or sign up with email</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={cn("pl-10 h-11 text-sm", errors.name && "border-red-500")}
            disabled={isLoadingCombined}
          />
        </div>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={cn("pl-10 h-11 text-sm", errors.email && "border-red-500")}
            disabled={isLoadingCombined}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-10 h-11 text-sm", errors.phone && "border-red-500")}
            disabled={isLoadingCombined}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            onClick={handleGeneratePassword}
            className="h-7 px-2 text-xs font-medium text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/10 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Generate
          </Button>
        </div>
        <PasswordInput
          value={formData.password}
          onChange={handlePasswordChange}
          placeholder="Create a strong password"
          required
          showStrength
          showRequirements
          error={passwordError || undefined}
          label={false}
          disabled={isLoadingCombined}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoadingCombined}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoadingCombined ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      {onSwitchToSignIn && (
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-[#1A73E8] font-medium hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      )}
    </form>
  );
}