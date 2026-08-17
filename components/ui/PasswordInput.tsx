// components/ui/PasswordInput.tsx

'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthLabel } from '@/lib/utils/password';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: boolean | string;
  required?: boolean;
  disabled?: boolean;
  showStrength?: boolean;
  showRequirements?: boolean;
  className?: string;
  error?: string | null;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter your password',
  label = 'Password',
  required = true,
  disabled = false,
  showStrength = true,
  showRequirements = true,
  className,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validation = useMemo(() => validatePassword(value), [value]);

  const getRequirementIcon = (passed: boolean) => {
    if (!value && !isFocused) return null;
    return passed ? (
      <Check className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <X className="h-3.5 w-3.5 text-red-500" />
    );
  };

  // ✅ Calculate if ALL requirements are met
  const allRequirementsMet = useMemo(() => {
    if (!value || value.length === 0) return false;
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value)
    );
  }, [value]);

  // ✅ Get the strength color - only green when ALL requirements are met
  const getStrengthColor = () => {
    if (!value || value.length === 0) return 'bg-gray-200';
    if (allRequirementsMet) return 'bg-green-500';
    if (validation.score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // ✅ Get the strength label - only "Strong" when ALL requirements are met
  const getStrengthLabel = () => {
    if (!value || value.length === 0) return '';
    if (allRequirementsMet) return 'Strong';
    if (validation.score >= 3) return 'Medium';
    return 'Weak';
  };

  // ✅ Get the width percentage - only 100% when ALL requirements are met
  const getWidthPercentage = () => {
    if (!value || value.length === 0) return 0;
    if (allRequirementsMet) return 100;
    // Show partial progress based on requirements met
    const requirementsMet = [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /[0-9]/.test(value),
      /[!@#$%^&*(),.?":{}|<>]/.test(value)
    ].filter(Boolean).length;
    return (requirementsMet / 5) * 100;
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
            error ? "border-red-500" : "border-gray-200",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Password Strength - Only shows green when ALL requirements are met */}
      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  getStrengthColor()
                )}
                style={{ width: `${getWidthPercentage()}%` }}
              />
            </div>
            <span className={cn(
              "text-xs font-medium whitespace-nowrap",
              allRequirementsMet ? "text-green-600" : 
              validation.score >= 3 ? "text-yellow-600" : 
              "text-red-500"
            )}>
              {getStrengthLabel()}
            </span>
          </div>
        </div>
      )}

      {/* Password Requirements */}
      {showRequirements && (isFocused || value.length > 0) && (
        <div className="mt-1 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500">
            {getRequirementIcon(value.length >= 8)}
            <span className={value.length >= 8 ? 'text-gray-700' : ''}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            {getRequirementIcon(/[A-Z]/.test(value))}
            <span className={/[A-Z]/.test(value) ? 'text-gray-700' : ''}>
              One uppercase letter
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            {getRequirementIcon(/[a-z]/.test(value))}
            <span className={/[a-z]/.test(value) ? 'text-gray-700' : ''}>
              One lowercase letter
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            {getRequirementIcon(/[0-9]/.test(value))}
            <span className={/[0-9]/.test(value) ? 'text-gray-700' : ''}>
              One number
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            {getRequirementIcon(/[!@#$%^&*(),.?":{}|<>]/.test(value))}
            <span className={/[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-gray-700' : ''}>
              One special character ({'!@#$%^&*(),.?":{}|<>'})
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}