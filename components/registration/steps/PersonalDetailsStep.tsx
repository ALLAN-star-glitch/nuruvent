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
  formData: SignupFormData;
  errors: SignupErrors;
  passwordError: string | null;
  professionalTypes: ProfessionalTypeOption[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onProfessionalTypeChange: (value: ProfessionalType) => void;
  onPasswordChange: (value: string) => void;
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
          <Label className="text-xs sm:text-sm font-medium text-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="John Doe"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.name && 'border-destructive',
              )}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] sm:text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-foreground">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="you@example.com"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.email && 'border-destructive',
              )}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] sm:text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-foreground">
            Phone <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onChange}
              placeholder="0712345678"
              className={cn(
                'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
                errors.phone && 'border-destructive',
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-[10px] sm:text-xs text-destructive">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Professional type */}
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm font-medium text-foreground">
            Professional Type <span className="text-destructive">*</span>
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
                errors.professionalType && 'border-destructive',
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
            <p className="text-[10px] sm:text-xs text-destructive">
              {errors.professionalType}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-medium text-foreground">
              Password <span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={onGeneratePassword}
              className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-primary hover:text-primary-600 hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
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