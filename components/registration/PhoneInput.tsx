'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { parsePhoneNumber } from 'libphonenumber-js';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from './countries';

type Props = {
  value: string; // E.164 string
  onChange: (e164: string) => void;
  className?: string;
  hasError?: boolean;
};

function flagEmoji(iso: string): string {
  if (iso.length !== 2) return '';
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function PhoneInput({ value, onChange, className, hasError }: Props) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync from parent to local state (e.g. if form resets)
  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNational('');
      return;
    }
    try {
      const parsed = parsePhoneNumber(value);
      if (parsed?.country) setCountry(parsed.country);
      if (parsed) setNational(parsed.nationalNumber);
    } catch {
      // ignore
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = useMemo<Country | undefined>(
    () => COUNTRIES.find((c) => c.iso === country),
    [country],
  );

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.iso.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [search]);

  // Handle typing in the input
  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); // digits only
    setNational(raw); // Always update local state so the user can type
    
    // Push to parent
    const dial = selected?.dial ?? '+254';
    onChange(raw ? `${dial}${raw}` : '');
  };

  const handleCountrySelect = (iso: string) => {
    const c = COUNTRIES.find((x) => x.iso === iso);
    if (!c) return;
    setCountry(iso);
    // Retain the national number but change the dial code
    onChange(national ? `${c.dial}${national}` : '');
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={cn('flex gap-2', className)} ref={dropdownRef}>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={cn(
            'w-[108px] sm:w-[124px] h-9 sm:h-10 px-2 justify-between text-sm font-normal cursor-pointer',
            hasError && 'border-destructive',
          )}
        >
          <span className="flex items-center gap-1 truncate">
            <span aria-hidden>{flagEmoji(country)}</span>
            <span className="font-medium">{country}</span>
            <span className="text-muted-foreground">
              {selected?.dial ?? ''}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-[280px] rounded-md border bg-popover shadow-lg">
            <div className="p-2">
              <Input
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No country found.
                </div>
              ) : (
                filtered.map((c) => (
                  <div
                    key={c.iso}
                    onClick={() => handleCountrySelect(c.iso)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent"
                  >
                    <span aria-hidden>{flagEmoji(c.iso)}</span>
                    <span className="font-medium">{c.iso}</span>
                    <span className="text-muted-foreground text-xs truncate">
                      {c.name}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {c.dial}
                    </span>
                    {country === c.iso && <Check className="h-4 w-4" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Input
        inputMode="numeric"
        value={national}
        onChange={handleNationalChange}
        placeholder="712345678"
        className={cn(
          'flex-1 h-9 sm:h-10 text-sm',
          hasError && 'border-destructive',
        )}
      />
    </div>
  );
}