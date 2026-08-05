'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center shrink-0 w-max h-auto pointer-events-auto">
      <Image
        src="/logo.png"
        alt="Nuruvent"
        width={120}
        height={28}

        priority
      />
    </Link>
  );
}