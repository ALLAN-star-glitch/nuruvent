// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/RevokeCertificateDialog.tsx

'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRevokeCertificateMutation } from '@/lib/store/api/certificatesApi';
import { Certificate } from '@/lib/types/certificates';


interface Props {
  cert: Certificate | null;
  onOpenChange: (v: boolean) => void;
  onRevoked?: () => void;
}

export function RevokeCertificateDialog({
  cert,
  onOpenChange,
  onRevoked,
}: Props) {
  const [reason, setReason] = useState('');
  const [revoke, { isLoading }] = useRevokeCertificateMutation();

  const handleRevoke = async () => {
    if (!cert) return;
    try {
      await revoke({ certificateId: cert.id, reason }).unwrap();
      toast.success('Certificate revoked');
      onOpenChange(false);
      setReason('');
      onRevoked?.();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to revoke certificate';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={!!cert} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Revoke certificate
          </DialogTitle>
          <DialogDescription>
            This cannot be undone. The certificate will fail verification
            immediately.
          </DialogDescription>
        </DialogHeader>

        {cert && (
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">
                {cert.recipient_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {cert.recipient_email}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {cert.verification_code}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Reason (optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this being revoked?"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleRevoke}
            disabled={isLoading || !cert}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Revoke certificate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}