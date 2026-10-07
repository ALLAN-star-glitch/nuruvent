'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { useCancelRegistrationMutation } from '@/lib/store/api/registrationsApi';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventName: string;
  onCancelled?: () => void;
}

export function CancelRegistrationDialog({
  open,
  onOpenChange,
  registrationId,
  eventName,
  onCancelled,
}: Props) {
  const [reason, setReason] = useState('');
  const [cancel, { isLoading }] = useCancelRegistrationMutation();

  const handleConfirm = async () => {
    try {
      await cancel({
        id: registrationId,
        reason: reason.trim() || undefined,
      }).unwrap();
      toast.success('Registration cancelled');
      onOpenChange(false);
      setReason('');
      onCancelled?.();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to cancel registration';
      toast.error(msg);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return;
    if (!next) setReason('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Cancel registration?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            You&rsquo;ll be removed from{' '}
            <span className="font-medium text-foreground">{eventName}</span>.
            This can&rsquo;t be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          <Label
            htmlFor="cancel-reason"
            className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            Reason{' '}
            <span className="normal-case tracking-normal">(optional)</span>
          </Label>
          <textarea
            id="cancel-reason"
            placeholder="Let the organizer know why…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isLoading}
            className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            className="w-full rounded-xl cursor-pointer sm:w-auto"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Keep registration
          </Button>
          <Button
            variant="destructive"
            className="w-full rounded-xl cursor-pointer sm:w-auto"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling…
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel registration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}