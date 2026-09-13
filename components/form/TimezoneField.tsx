// components/form/TimezoneField.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

// ============================================================
// TIMEZONE FIELD
// ============================================================
//
// Select over a curated list of common IANA timezones. If `value`
// isn't in the list, it's prepended so a loaded draft isn't reset.
//
// Generic — no domain knowledge. Any form can use it.

interface TimezoneFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name?: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  optional?: boolean;
}

const TIMEZONES = [
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT, UTC+1)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET, UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST, UTC+2)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST, UTC+4)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST, UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export function TimezoneField({
  value,
  onChange,
  name = 'timezone',
  label = 'Timezone',
  placeholder = 'Choose a timezone',
  helper = 'Times are displayed in this timezone.',
  optional,
  error,
  disabled,
  id,
}: TimezoneFieldProps) {
  const hasValue = TIMEZONES.some((tz) => tz.value === value);
  const options =
    value && !hasValue
      ? [{ value, label: value }, ...TIMEZONES]
      : TIMEZONES;

  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn('cursor-pointer', error && 'border-error-500')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((tz) => (
            <SelectItem
              key={tz.value}
              value={tz.value}
              className="cursor-pointer"
            >
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}