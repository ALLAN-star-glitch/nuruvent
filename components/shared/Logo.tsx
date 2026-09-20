'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';

export function Logo() {
  const theme = useAppSelector((s) => s.theme.theme);
  const isDark = theme === 'dark';

  return (
    <Link
      href="/"
      className="inline-flex items-center shrink-0 w-max h-auto pointer-events-auto"
    >
      <Image
        src={isDark ? '/dark-theme-logo.png' : '/logo.png'}
        alt="Nuruvent"
        width={120}
        height={28}
        priority
      />
    </Link>
  );
}