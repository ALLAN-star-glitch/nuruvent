// components/ui/OtpInput.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
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
  id?: string;  // ✅ Added id prop
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
  id = 'otp-input',  // ✅ Default id
  onComplete,
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(val);
    
    // Call onComplete when full OTP is entered
    if (val.length === length && onComplete) {
      onComplete(val);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  // Handle key down (for Enter key)
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
          id={id}  // ✅ Pass id to input
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
            "w-full px-4 py-3 rounded-xl border-2 transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 text-center text-lg font-mono tracking-widest",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#1A73E8]",
            disabled && "opacity-60 cursor-not-allowed",
            inputClassName
          )}
        />
        {/* Character counter */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {value.length}/{length}
        </span>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
      
      {/* Hint about OTP format */}
      <p className="text-xs text-gray-400 mt-1.5">
        Enter the {length}-digit code sent to your email
      </p>
    </div>
  );
}