// app/(public)/events/[slug]/_components/DetailTopBar.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, HeartOff, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DetailTopBarProps {
  /** Title used when invoking `navigator.share`. */
  shareTitle: string;
}

/**
 * Sticky top bar: back navigation, save (local only), share.
 *
 * `handleShare` prefers the native share sheet and falls back to
 * clipboard copy. The "Copied!" feedback auto-dismisses after 3s.
 */
export function DetailTopBar({ shareTitle }: DetailTopBarProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch {
        /* user dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 3000);
    } catch {
      /* clipboard denied */
    }
  };

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <button
            onClick={handleBack}
            className="group inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent text-sm text-muted-foreground transition-all hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden font-medium sm:inline">
              Back to Events
            </span>
            <span className="font-medium sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 cursor-pointer rounded-full p-0"
              onClick={() => setIsSaved(!isSaved)}
              type="button"
              aria-label="Save Event"
            >
              {isSaved ? (
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              ) : (
                <HeartOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 cursor-pointer rounded-full px-3"
              onClick={handleShare}
              type="button"
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              <span className="text-xs font-medium">
                {isShared ? 'Copied!' : 'Share'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}