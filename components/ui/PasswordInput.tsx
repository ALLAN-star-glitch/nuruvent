// components/ui/PasswordInput.tsx

'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword } from '@/lib/utils/password';

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
      <Check className="h-3.5 w-3.5 text-tertiary-500" />
    ) : (
      <X className="h-3.5 w-3.5 text-destructive" />
    );
  };

  // All five requirements met?
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

  const getStrengthColor = () => {
    if (!value || value.length === 0) return 'bg-muted';
    if (allRequirementsMet) return 'bg-tertiary-500';
    if (validation.score >= 3) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getStrengthLabel = () => {
    if (!value || value.length === 0) return '';
    if (allRequirementsMet) return 'Strong';
    if (validation.score >= 3) return 'Medium';
    return 'Weak';
  };

  const getStrengthLabelColor = () => {
    if (allRequirementsMet) return 'text-tertiary-600 dark:text-tertiary-400';
    if (validation.score >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  };

  const getWidthPercentage = () => {
    if (!value || value.length === 0) return 0;
    if (allRequirementsMet) return 100;
    const requirementsMet = [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /[0-9]/.test(value),
      /[!@#$%^&*(),.?":{}|<>]/.test(value),
    ].filter(Boolean).length;
    return (requirementsMet / 5) * 100;
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
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
            'w-full px-4 py-3 rounded-xl border transition-all',
            'bg-background text-foreground placeholder:text-muted-foreground',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            error ? 'border-destructive' : 'border-border',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Strength meter */}
      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  getStrengthColor(),
                )}
                style={{ width: `${getWidthPercentage()}%` }}
              />
            </div>
            <span
              className={cn(
                'text-xs font-medium whitespace-nowrap',
                getStrengthLabelColor(),
              )}
            >
              {getStrengthLabel()}
            </span>
          </div>
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && (isFocused || value.length > 0) && (
        <div className="mt-1 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {getRequirementIcon(value.length >= 8)}
            <span className={value.length >= 8 ? 'text-foreground' : ''}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {getRequirementIcon(/[A-Z]/.test(value))}
            <span className={/[A-Z]/.test(value) ? 'text-foreground' : ''}>
              One uppercase letter
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {getRequirementIcon(/[a-z]/.test(value))}
            <span className={/[a-z]/.test(value) ? 'text-foreground' : ''}>
              One lowercase letter
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {getRequirementIcon(/[0-9]/.test(value))}
            <span className={/[0-9]/.test(value) ? 'text-foreground' : ''}>
              One number
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {getRequirementIcon(/[!@#$%^&*(),.?":{}|<>]/.test(value))}
            <span
              className={
                /[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-foreground' : ''
              }
            >
              One special character ({'!@#$%^&*(),.?":{}|<>'})
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}