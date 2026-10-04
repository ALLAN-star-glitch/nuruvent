'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
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
  open, onOpenChange, registrationId, eventName, onCancelled,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel registration?</DialogTitle>
          <DialogDescription>
            You will be removed from{' '}
            <span className="font-medium text-foreground">{eventName}</span>.
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-reason" className="text-sm">
            Reason <span className="text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id="cancel-reason"
            placeholder="Let the organizer know why…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep registration
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto cursor-pointer"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling…
              </>
            ) : (
              'Cancel registration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}