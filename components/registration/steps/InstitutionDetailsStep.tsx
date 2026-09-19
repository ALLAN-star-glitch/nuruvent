// components/registration/steps/InstitutionDetailsStep.tsx

'use client';

import { Building2, Mail, Phone } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { InstitutionType } from '@/lib/types/auth';
import type { InstitutionTypeOption } from '../types';
import type { SignupFormData, SignupErrors } from '../types';

// ============================================================
// PROPS
// ============================================================

interface InstitutionDetailsStepProps {
  formData: SignupFormData;
  errors: SignupErrors;
  institutionTypes: InstitutionTypeOption[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onInstitutionTypeChange: (value: InstitutionType) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function InstitutionDetailsStep({
  formData,
  errors,
  institutionTypes,
  onChange,
  onInstitutionTypeChange,
}: InstitutionDetailsStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Organization name */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-foreground">
          Organization Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            name="institutionName"
            value={formData.institutionName}
            onChange={onChange}
            placeholder="Nairobi Training Institute"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionName && 'border-destructive',
            )}
          />
        </div>
        {errors.institutionName && (
          <p className="text-[10px] sm:text-xs text-destructive">
            {errors.institutionName}
          </p>
        )}
      </div>

      {/* Organization email */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-foreground">
          Organization Email <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            name="institutionEmail"
            type="email"
            value={formData.institutionEmail}
            onChange={onChange}
            placeholder="info@institute.com"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionEmail && 'border-destructive',
            )}
          />
        </div>
        {errors.institutionEmail && (
          <p className="text-[10px] sm:text-xs text-destructive">
            {errors.institutionEmail}
          </p>
        )}
      </div>

      {/* Organization phone */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-foreground">
          Organization Phone <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            name="institutionPhone"
            type="tel"
            value={formData.institutionPhone}
            onChange={onChange}
            placeholder="0712345678"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionPhone && 'border-destructive',
            )}
          />
        </div>
        {errors.institutionPhone && (
          <p className="text-[10px] sm:text-xs text-destructive">
            {errors.institutionPhone}
          </p>
        )}
      </div>

      {/* Organization type */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-foreground">
          Organization Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.institutionType}
          onValueChange={(value) =>
            onInstitutionTypeChange(value as InstitutionType)
          }
        >
          <SelectTrigger
            className={cn(
              'h-9 sm:h-10 text-sm cursor-pointer',
              errors.institutionType && 'border-destructive',
            )}
          >
            <SelectValue placeholder="Select organization type" />
          </SelectTrigger>
          <SelectContent>
            {institutionTypes.map((type) => (
              <SelectItem
                key={type.value}
                value={type.value}
                className="cursor-pointer text-sm"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.institutionType && (
          <p className="text-[10px] sm:text-xs text-destructive">
            {errors.institutionType}
          </p>
        )}
      </div>
    </div>
  );
}