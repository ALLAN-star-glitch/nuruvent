// components/shared/Logo.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Skip the wrapping <Link> when the parent already handles navigation. */
  asLink?: boolean;
  /**
   * Size hint for the rendered logo. Defaults to the desktop size (120×28).
   * Pass a smaller value (e.g. 90) for tight header slots on mobile.
   */
  width?: number;
  className?: string;
}

export function Logo({
  asLink = true,
  width = 120,
  className,
}: LogoProps) {
  const theme = useAppSelector((s) => s.theme.theme);
  const isDark = theme === 'dark';

  const height = Math.round((width / 120) * 28);

  const inner = (
    <Image
      src={isDark ? '/dark-theme-logo.png' : '/logo.png'}
      alt="Nuruvent"
      width={width}
      height={height}
      priority
      loading="eager"
      className={cn('w-auto h-auto', className)}
    />
  );

  if (!asLink) {
    return <span className="inline-flex items-center shrink-0">{inner}</span>;
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center shrink-0 w-max h-auto pointer-events-auto"
      aria-label="Nuruvent home"
    >
      {inner}
    </Link>
  );
}