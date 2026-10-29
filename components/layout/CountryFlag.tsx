'use client';

import { useState, useEffect } from 'react';
import { detectDefaultCountry } from '@/components/registration/countries';

function flagEmoji(iso: string): string {
  if (iso.length !== 2) return '';
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function CountryFlag() {
  const [country, setCountry] = useState<string>('');

  useEffect(() => {
    // Detect only on the client side to prevent hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountry(detectDefaultCountry());
  }, []);

  if (!country) {
    // Return a placeholder of the same size to prevent layout shift
    return <div className="h-9 w-9" />;
  }

  return (
    <div 
      className="flex items-center justify-center h-9 w-9 rounded-full bg-muted/50 cursor-help"
      title={`Detected region: ${country}`}
    >
      <span aria-hidden className="text-lg leading-none">
        {flagEmoji(country)}
      </span>
    </div>
  );
}