// components/form/TextField.tsx

'use client';

import type { ChangeEvent, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

interface TextFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name: string;
  label: ReactNode;
  placeholder?: string;
  helper?: string;
  optional?: boolean;

  maxLength?: number;
  showCounter?: boolean;

  type?: 'text' | 'email' | 'url' | 'password';
  inputMode?: 'text' | 'email' | 'url' | 'numeric';
  autoComplete?: string;
}

export function TextField({
  value,
  onChange,
  name,
  label,
  placeholder,
  helper,
  optional,
  maxLength,
  showCounter,
  type = 'text',
  inputMode,
  autoComplete,
  error,
  disabled,
  id,
}: TextFieldProps) {
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
      counter={
        showCounter && maxLength
          ? { current: value.length, max: maxLength }
          : undefined
      }
    >
      <Input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'cursor-text focus:ring-primary-500 focus:border-primary-500',
          error && 'border-error-500',
        )}
      />
    </FieldWrapper>
  );
}