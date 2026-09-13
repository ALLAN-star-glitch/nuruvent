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
  /** Current form values. Controlled by the parent. */
  formData: SignupFormData;

  /** Field-level errors keyed by form field name. */
  errors: SignupErrors;

  /**
   * Institution-type options. The parent supplies these — either from
   * `INSTITUTION_TYPES_FALLBACK` for now, or from a fetched list once
   * `GET /api/v1/institution-types` is wired up.
   */
  institutionTypes: InstitutionTypeOption[];

  /**
   * Generic change handler for native inputs. Uses `event.target.name`
   * to write to the matching field on `formData`.
   */
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;

  /**
   * Change handler for the institution-type dropdown. Separate from
   * `onChange` because shadcn's `<Select>` doesn't emit a native
   * change event with `target.name`.
   */
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
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionName"
            value={formData.institutionName}
            onChange={onChange}
            placeholder="Nairobi Training Institute"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionName && 'border-red-500',
            )}
          />
        </div>
        {errors.institutionName && (
          <p className="text-[10px] sm:text-xs text-red-500">
            {errors.institutionName}
          </p>
        )}
      </div>

      {/* Organization email */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionEmail"
            type="email"
            value={formData.institutionEmail}
            onChange={onChange}
            placeholder="info@institute.com"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionEmail && 'border-red-500',
            )}
          />
        </div>
        {errors.institutionEmail && (
          <p className="text-[10px] sm:text-xs text-red-500">
            {errors.institutionEmail}
          </p>
        )}
      </div>

      {/* Organization phone */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionPhone"
            type="tel"
            value={formData.institutionPhone}
            onChange={onChange}
            placeholder="0712345678"
            className={cn(
              'pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text',
              errors.institutionPhone && 'border-red-500',
            )}
          />
        </div>
        {errors.institutionPhone && (
          <p className="text-[10px] sm:text-xs text-red-500">
            {errors.institutionPhone}
          </p>
        )}
      </div>

      {/* Organization type */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Type <span className="text-red-500">*</span>
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
              errors.institutionType && 'border-red-500',
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
          <p className="text-[10px] sm:text-xs text-red-500">
            {errors.institutionType}
          </p>
        )}
      </div>
    </div>
  );
}