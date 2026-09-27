'use client';

import { Copy, Mail, MessageCircle, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShareMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingLink: string | undefined;
  shareText: string;
  onCopy: () => void;
}

export function ShareMeetingDialog({
  open,
  onOpenChange,
  meetingLink,
  shareText,
  onCopy,
}: ShareMeetingDialogProps) {
  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Event Join Link');
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Meeting
          </DialogTitle>
          <DialogDescription>
            Send the join link to your attendees.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label>Join Link</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly
                value={meetingLink ?? ''}
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onCopy}
                className="cursor-pointer shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="cursor-pointer justify-start"
            >
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="cursor-pointer justify-start"
            >
              <Mail className="h-4 w-4 mr-2 text-primary" />
              Email
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            The Zoom meeting info (ID, password) is not included in the share
            text. Attendees join via the link directly.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}