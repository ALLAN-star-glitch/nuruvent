// app/(public)/events/[slug]/not-found.tsx

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Event Not Found</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          The event you are looking for does not exist, has been made private,
          or was removed.
        </p>
        <Button asChild className="cursor-pointer">
          <Link href="/">Explore Events</Link>
        </Button>
      </div>
    </div>
  );
}