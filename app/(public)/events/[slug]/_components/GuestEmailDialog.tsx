// app/(public)/events/[slug]/_components/GuestEmailDialog.tsx

'use client';

import { Mail, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OpenEmailButton } from '@/components/email/OpenEmailButton';

interface GuestEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  eventName: string;
  registrationNumber?: string;
}

export function GuestEmailDialog({
  open,
  onOpenChange,
  email,
  eventName,
  registrationNumber,
}: GuestEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex justify-center sm:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Check your inbox
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            We&apos;ve sent your ticket and join link for{' '}
            <span className="font-medium text-foreground">{eventName}</span>
            {email ? (
              <>
                {' '}to{' '}
                <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              <> to your registered email.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Registration summary */}
        {registrationNumber && (
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Registration confirmed</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Ref #{registrationNumber}
            </p>
          </div>
        )}

        {/* What to do next */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What happens next</p>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed">
            <li>Your ticket with the QR pass is in the email</li>
            <li>Join links are attached for each session</li>
            <li>Reminders will arrive before the event starts</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {email ? (
            <OpenEmailButton
              email={email}
              className="h-11 w-full cursor-pointer rounded-xl"
            />
          ) : null}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}