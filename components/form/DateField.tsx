// components/form/DateField.tsx

'use client';

import type { ChangeEvent, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

interface DateFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name: string;
  label: ReactNode;
  placeholder?: string;
  helper?: string;
  optional?: boolean;

  min?: string;
  max?: string;
}

export function DateField({
  value,
  onChange,
  name,
  label,
  placeholder,
  helper,
  optional,
  min,
  max,
  error,
  disabled,
  id,
}: DateFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
    >
      <Input
        type="date"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          'cursor-text focus:ring-primary-500 focus:border-primary-500',
          error && 'border-error-500',
        )}
      />
    </FieldWrapper>
  );
}