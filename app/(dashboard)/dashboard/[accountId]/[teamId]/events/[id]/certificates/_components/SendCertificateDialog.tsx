// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/SendCertificateDialog.tsx

'use client';

import { Loader2, Send } from 'lucide-react';
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
import { useSendCertificateMutation } from '@/lib/store/api/certificatesApi';
import { Certificate } from '@/lib/types/certificates';


interface Props {
  cert: Certificate | null;
  onOpenChange: (v: boolean) => void;
  onSent?: () => void;
}

export function SendCertificateDialog({ cert, onOpenChange, onSent }: Props) {
  const [send, { isLoading }] = useSendCertificateMutation();

  const handleSend = async () => {
    if (!cert) return;
    try {
      await send(cert.id).unwrap();
      toast.success(`Email queued for ${cert.recipient_email}`);
      onOpenChange(false);
      onSent?.();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to send certificate';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={!!cert} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Resend certificate email
          </DialogTitle>
          <DialogDescription>
            A fresh download link will be generated and emailed to the
            recipient.
          </DialogDescription>
        </DialogHeader>

        {cert && (
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">{cert.recipient_name}</p>
            <p className="text-xs text-muted-foreground">
              {cert.recipient_email}
            </p>
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
            className="cursor-pointer"
            onClick={handleSend}
            disabled={isLoading || !cert}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}