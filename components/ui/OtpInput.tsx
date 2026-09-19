// components/ui/OtpInput.tsx

'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  id?: string;
  onComplete?: (value: string) => void;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  placeholder = 'Enter OTP',
  disabled = false,
  error = null,
  className = '',
  inputClassName = '',
  autoFocus = false,
  id = 'otp-input',
  onComplete,
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(val);

    if (val.length === length && onComplete) {
      onComplete(val);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    onChange(pasted);
    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === length && onComplete) {
      onComplete(value);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 transition-all',
            'bg-background text-foreground placeholder:text-muted-foreground',
            'text-center text-lg font-mono tracking-widest',
            error
              ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
            disabled && 'opacity-60 cursor-not-allowed',
            inputClassName,
          )}
        />

        {/* Character counter — hidden when the input is empty, so the
            placeholder isn't crowded. */}
        {value.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {value.length}/{length}
          </span>
        )}
      </div>

      {/* Error message — suppressed when the input already shows the
          destructive border? No: keep both. The border is a visual
          cue, the text is the explanation. */}
      {error && (
        <p className="text-xs text-destructive mt-1.5">{error}</p>
      )}

      {/* Hint */}
      <p className="text-xs text-muted-foreground mt-1.5">
        Enter the {length}-digit code sent to your email
      </p>
    </div>
  );
}