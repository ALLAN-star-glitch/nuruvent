// components/layout/VideoConnectionListener.tsx

'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Listens for the `video_connected=true` query parameter after an OAuth
 * redirect, shows a success toast, and cleans the URL so the toast
 * doesn't fire again on refresh.
 *
 * Must be wrapped in a <Suspense> boundary in the layout that renders it,
 * because it uses `useSearchParams()`.
 */
export function VideoConnectionListener() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('video_connected') === 'true') {
      toast.success('Video platform connected successfully!');

      // Clean up the URL without triggering a full page reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete('video_connected');

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}