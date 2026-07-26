// components/shared/Logo.tsx

import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center shrink-0 cursor-pointer">
      <Image
        src="/logo.png"
        alt="Nuruvent"
        width={160}
        height={50}
        className="h-20 sm:h-20 md:h-30 lg:h-30 w-auto"
        priority
      />
    </Link>
  );
}