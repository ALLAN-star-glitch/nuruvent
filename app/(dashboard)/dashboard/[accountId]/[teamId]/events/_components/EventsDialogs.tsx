'use client';

import { AlertCircle, Edit3, RotateCcw, Trash, Trash2, XCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from 'lucide-react';

import type { UIEvent } from './types';

// ---------- Move to trash ----------
interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: UIEvent | null;
  onConfirm: () => void;
}

export function MoveToTrashDialog({
  open,
  onOpenChange,
  event,
  onConfirm,
}: TrashDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to Trash</DialogTitle>
          <DialogDescription>
            Move this event to trash? You can restore it later.
          </DialogDescription>
        </DialogHeader>
        {event && (
          <div className="py-4">
            <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-950/40">
                <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
            onClick={onConfirm}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Permanent delete ----------
interface PermanentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: UIEvent | null;
  onConfirm: () => void;
}

export function PermanentDeleteDialog({
  open,
  onOpenChange,
  event,
  onConfirm,
}: PermanentDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Permanently delete event?
          </DialogTitle>
          <DialogDescription>
            This can&rsquo;t be undone. All registrations, payments, and
            attendance records will be removed.
          </DialogDescription>
        </DialogHeader>
        {event && (
          <div className="py-4">
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
              <div className="rounded-full bg-destructive/20 p-2">
                <Trash className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={onConfirm}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Restore ----------
interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: UIEvent | null;
  onConfirm: () => void;
}

export function RestoreEventDialog({
  open,
  onOpenChange,
  event,
  onConfirm,
}: RestoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 dark:text-emerald-400">
            Restore event?
          </DialogTitle>
          <DialogDescription>
            This event will be restored and visible again.
          </DialogDescription>
        </DialogHeader>
        {event && (
          <div className="py-4">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-950/50">
                <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={onConfirm}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Publish error ----------
interface PublishErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: { message: string; details: string[] } | null;
  onEdit: () => void;
}

export function PublishErrorDialog({
  open,
  onOpenChange,
  error,
  onEdit,
}: PublishErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" /> Cannot publish event
          </DialogTitle>
          <DialogDescription className="text-destructive">
            {error?.message || 'Failed to publish event'}
          </DialogDescription>
        </DialogHeader>

        {error?.details && error.details.length > 0 && (
          <div className="py-4">
            <p className="mb-2 text-sm font-medium text-foreground">
              Please fix the following:
            </p>
            <ul className="space-y-2">
              {error.details.map((detail, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full cursor-pointer sm:w-auto"
          >
            Close
          </Button>
          <Button
            className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            onClick={onEdit}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Bulk action confirm ----------
interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  selectedIds: string[];
  uiEvents: UIEvent[];
  onConfirm: () => void;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  action,
  selectedIds,
  uiEvents,
  onConfirm,
}: BulkActionDialogProps) {
  const title = {
    publish: 'Publish Events',
    duplicate: 'Duplicate Events',
    delete: 'Move to Trash',
    permanentDelete: 'Permanently Delete Events',
    restore: 'Restore Events',
  }[action] ?? 'Confirm Action';

  const verb = {
    publish: 'publish',
    duplicate: 'duplicate',
    delete: 'move to trash',
    permanentDelete: 'permanently delete',
    restore: 'restore',
  }[action] ?? 'act on';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to {verb} <strong>{selectedIds.length}</strong>{' '}
            event{selectedIds.length > 1 ? 's' : ''}
            {action === 'permanentDelete'
              ? '. This action cannot be undone.'
              : '.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <ScrollArea className="h-32 rounded-lg border border-border p-2">
            {selectedIds.map((id) => {
              const event = uiEvents.find((e) => e.id === id);
              return event ? (
                <div key={id} className="flex items-center gap-2 py-1 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{event.title}</span>
                  <span className="text-muted-foreground">—</span>
                  <Badge variant="outline" className="text-xs">
                    {event.isDeleted ? 'Trashed' : event.statusDisplayName}
                  </Badge>
                </div>
              ) : null;
            })}
          </ScrollArea>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`cursor-pointer ${
              action === 'permanentDelete' || action === 'delete'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : action === 'restore'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            onClick={onConfirm}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}