// components/form/NumberField.tsx

'use client';

import type { ChangeEvent, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

interface NumberFieldProps extends FieldBaseProps {
  value: number | null;
  onChange: (value: number | null) => void;

  name: string;
  label: ReactNode;
  placeholder?: string;
  helper?: string;
  optional?: boolean;

  min?: number;
  max?: number;
  step?: number | string;
  decimal?: boolean;
  suffix?: string;
}

export function NumberField({
  value,
  onChange,
  name,
  label,
  placeholder,
  helper,
  optional,
  min,
  max,
  step,
  decimal,
  suffix,
  error,
  disabled,
  id,
}: NumberFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(null);
      return;
    }
    const parsed = decimal ? parseFloat(raw) : parseInt(raw, 10);
    onChange(isNaN(parsed) ? null : parsed);
  };

  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={
        suffix ? (
          <>
            {label}{' '}
            <span className="text-muted-foreground text-xs">({suffix})</span>
          </>
        ) : (
          label
        )
      }
      helper={helper}
      error={error}
      optional={optional}
    >
      <Input
        type="number"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'cursor-text focus:ring-primary focus:border-primary',
          error && 'border-destructive',
        )}
      />
    </FieldWrapper>
  );
}