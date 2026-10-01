'use client';

import { AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

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

import { PLATFORMS } from './PlatformPickerModal';
import type { VideoPlatform } from '@/lib/types/events';

// ============================================================
// TYPES
// ============================================================

export type PlatformChangeKind =
  | 'switch-platform' // Zoom ↔ Meet on an existing meeting
  | 'go-in-person'; // virtual → in-person on an existing meeting

export interface PlatformChangeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: PlatformChangeKind;
  /** Current platform (may be undefined if the session had no meeting). */
  fromPlatform?: VideoPlatform;
  /** Target platform (undefined for 'go-in-person'). */
  toPlatform?: VideoPlatform;
  /** Session name shown in the body so the user knows which row. */
  sessionName?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// ============================================================
// HELPERS
// ============================================================

function platformLabel(p?: VideoPlatform): string {
  if (!p) return 'the current platform';
  return PLATFORMS.find((m) => m.platform === p)?.label ?? p;
}

function copyFor(kind: PlatformChangeKind, from?: VideoPlatform, to?: VideoPlatform) {
  if (kind === 'go-in-person') {
    return {
      title: 'Make this session in-person?',
      description:
        `This will delete the existing ${platformLabel(from)} meeting for this session. ` +
        'The join link will stop working — anyone who already has it will not be able to join.',
      confirmLabel: 'Delete meeting',
      confirmIcon: Trash2,
    };
  }

  // switch-platform
  return {
    title: `Switch to ${platformLabel(to)}?`,
    description:
      `This will delete the existing ${platformLabel(from)} meeting and create a new ` +
      `${platformLabel(to)} meeting. The current join link will stop working — ` +
      'attendees who already have it will not be able to join.',
    confirmLabel: 'Delete and switch',
    confirmIcon: Trash2,
  };
}

// ============================================================
// DIALOG
// ============================================================

export function PlatformChangeConfirmDialog({
  open,
  onOpenChange,
  kind,
  fromPlatform,
  toPlatform,
  sessionName,
  onConfirm,
  onCancel,
}: PlatformChangeConfirmDialogProps) {
  const { title, description, confirmLabel, confirmIcon: ConfirmIcon } =
    copyFor(kind, fromPlatform, toPlatform);

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-base sm:text-lg">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Transition visual: current platform → new platform */}
        <div className="py-2">
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
            <span className="text-sm font-medium text-foreground">
              {platformLabel(fromPlatform)}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {kind === 'go-in-person' ? 'In-person' : platformLabel(toPlatform)}
            </span>
          </div>

          {sessionName && (
            <p className="text-xs text-muted-foreground mt-2 text-center break-words">
              Session: <span className="font-medium text-foreground">{sessionName}</span>
            </p>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto cursor-pointer"
          >
            Keep {platformLabel(fromPlatform)}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              'w-full sm:w-auto cursor-pointer',
              'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
            )}
          >
            <ConfirmIcon className="h-4 w-4 mr-2" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}