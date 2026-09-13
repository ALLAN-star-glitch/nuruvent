// components/registration/steps/InstitutionAdminStep.tsx

'use client';

import { Mail, Phone, RefreshCw, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { cn } from '@/lib/utils';

import type { SignupFormData, SignupErrors } from '../types';

import { GoogleSignupButton } from '../shared/GoogleSignupButton';
import { OrDivider } from '../shared/OrDivider';

// ============================================================
// PROPS
// ============================================================

interface InstitutionAdminStepProps {
  /** Current form values. Controlled by the parent. */
  formData: SignupFormData;

  /** Field-level errors keyed by form field name. */
  errors: SignupErrors;

  /** Password-strength error, if any. */
  passwordError: string | null;

  /**
   * Generic change handler for native inputs. Uses `event.target.name`
   * to write to the matching field on `formData`.
   */
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;

  /** Change handler for the password input. */
  onPasswordChange: (value: string) => void;

  /** Called when the user clicks "Generate" next to the password label. */
  onGeneratePassword: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function InstitutionAdminStep({
  formData,
  errors,
  passwordError,
  onChange,
  onPasswordChange,
  onGeneratePassword,
}: InstitutionAdminStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Google signup */}
      <GoogleSignupButton />

      {/* Divider */}
      <OrDivider />

      {/* Admin fields */}
      <div className="space-y-3 sm:space-y-4">
        {/* Admin name */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Your Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="adminName"
              value={formData.adminName}
              onChange={onChange}
              placeholder="Jane Smith"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.adminName && 'border-red-500',
              )}
            />
          </div>
          {errors.adminName && (
            <p className="text-[10px] sm:text-xs text-red-500">
              {errors.adminName}
            </p>
          )}
        </div>

        {/* Admin email */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Your Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={onChange}
              placeholder="admin@example.com"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.adminEmail && 'border-red-500',
              )}
            />
          </div>
          {errors.adminEmail && (
            <p className="text-[10px] sm:text-xs text-red-500">
              {errors.adminEmail}
            </p>
          )}
        </div>

        {/* Admin phone */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Your Phone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="adminPhone"
              type="tel"
              value={formData.adminPhone}
              onChange={onChange}
              placeholder="0712345678"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.adminPhone && 'border-red-500',
              )}
            />
          </div>
          {errors.adminPhone && (
            <p className="text-[10px] sm:text-xs text-red-500">
              {errors.adminPhone}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={onGeneratePassword}
              className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/10 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Generate
            </Button>
          </div>

          <PasswordInput
            value={formData.password}
            onChange={onPasswordChange}
            placeholder="Create a strong password"
            required
            showStrength
            showRequirements
            error={passwordError || undefined}
            label={false}
          />
        </div>
      </div>
    </div>
  );
}