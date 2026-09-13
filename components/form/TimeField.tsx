// components/form/TimeField.tsx

'use client';

import type { ChangeEvent, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

interface TimeFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name: string;
  label: ReactNode;
  helper?: string;
  optional?: boolean;
}

export function TimeField({
  value,
  onChange,
  name,
  label,
  helper,
  optional,
  error,
  disabled,
  id,
}: TimeFieldProps) {
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
        type="time"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'cursor-text focus:ring-primary-500 focus:border-primary-500',
          error && 'border-error-500',
        )}
      />
    </FieldWrapper>
  );
}