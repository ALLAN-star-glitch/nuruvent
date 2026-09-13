// components/registration/steps/PersonalDetailsStep.tsx

'use client';

import { Mail, Phone, RefreshCw, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { cn } from '@/lib/utils';

import type { ProfessionalType } from '@/lib/types/auth';
import type { ProfessionalTypeOption } from '../constants';
import type { SignupFormData, SignupErrors } from '../types';

import { GoogleSignupButton } from '../shared/GoogleSignupButton';
import { OrDivider } from '../shared/OrDivider';

// ============================================================
// PROPS
// ============================================================

interface PersonalDetailsStepProps {
  /** Current form values. Controlled by the parent. */
  formData: SignupFormData;

  /**
   * Field-level errors. Keys match `SignupFormData` field names.
   * The parent decides when to show them (usually after a submit
   * attempt).
   */
  errors: SignupErrors;

  /** Password-strength error, if any. Separate from `errors.password`. */
  passwordError: string | null;

  /** List of professional-type options for the dropdown. */
  professionalTypes: ProfessionalTypeOption[];

  /**
   * Generic change handler. Uses `event.target.name` to write to the
   * corresponding field on `formData`.
   */
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;

  /**
   * Change handler for the professional-type dropdown. Separate from
   * `onChange` because shadcn's `<Select>` doesn't produce a normal
   * change event with `target.name`.
   */
  onProfessionalTypeChange: (value: ProfessionalType) => void;

  /** Change handler for the password input. */
  onPasswordChange: (value: string) => void;

  /** Called when the user clicks "Generate" next to the password label. */
  onGeneratePassword: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function PersonalDetailsStep({
  formData,
  errors,
  passwordError,
  professionalTypes,
  onChange,
  onProfessionalTypeChange,
  onPasswordChange,
  onGeneratePassword,
}: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Google signup */}
      <GoogleSignupButton />

      {/* Divider */}
      <OrDivider />

      {/* Form fields */}
      <div className="space-y-3 sm:space-y-4">
        {/* Full name */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="John Doe"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.name && 'border-red-500',
              )}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] sm:text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="you@example.com"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.email && 'border-red-500',
              )}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] sm:text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onChange}
              placeholder="0712345678"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.phone && 'border-red-500',
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-[10px] sm:text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Professional type */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Professional Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.professionalType}
            onValueChange={(value) =>
              onProfessionalTypeChange(value as ProfessionalType)
            }
          >
            <SelectTrigger
              className={cn(
                'h-9 sm:h-10 text-sm cursor-pointer',
                errors.professionalType && 'border-red-500',
              )}
            >
              <SelectValue placeholder="What do you do?" />
            </SelectTrigger>
            <SelectContent>
              {professionalTypes.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer text-sm"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.professionalType && (
            <p className="text-[10px] sm:text-xs text-red-500">
              {errors.professionalType}
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