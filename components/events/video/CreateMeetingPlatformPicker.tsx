// components/events/video/CreateMeetingPlatformPicker.tsx

'use client';

import Image from 'next/image';
import { Loader2, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';

import type { PlatformMeta } from './PlatformPickerModal';

export interface CreateMeetingPlatformPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: PlatformMeta[];
  onPick: (platform: VideoPlatform) => void;
  running: boolean;
}

export function CreateMeetingPlatformPicker({
  open,
  onOpenChange,
  platforms,
  onPick,
  running,
}: CreateMeetingPlatformPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            Choose a video platform
          </DialogTitle>
          <DialogDescription>
            We&apos;ll create a meeting for every session that doesn&apos;t
            have one yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {platforms.map((p) => {
            const disabled = running;
            return (
              <button
                key={p.platform}
                type="button"
                disabled={disabled}
                onClick={() => onPick(p.platform)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer',
                )}
              >
                <div className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-background border border-border overflow-hidden p-1.5">
                  <Image
                    src={p.logo}
                    alt={`${p.label} logo`}
                    width={40}
                    unoptimized
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {p.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create on {p.label}
                  </p>
                </div>
                {running && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={running}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}