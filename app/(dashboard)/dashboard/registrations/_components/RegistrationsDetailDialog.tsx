'use client';

import { ArrowRight, Calendar, Phone } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';


import type { CrossEventRegistration } from '@/lib/types/registration';
import { StatusBadge } from '@/components/registrations/status_badge';

function initials(name?: string): string {
  const n = (name ?? '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: CrossEventRegistration | null;
  onGoToEvent: (eventId: string) => void;
  onGoToEventRegistrations: (eventId: string) => void;
}

export function RegistrationsDetailDialog({
  open,
  onOpenChange,
  registration,
  onGoToEvent,
  onGoToEventRegistrations,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Registration Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            Registration for one event.
          </DialogDescription>
        </DialogHeader>

        {registration && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                <AvatarFallback className="bg-primary/10 text-base text-primary sm:text-lg">
                  {initials(registration.attendee_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words text-base font-semibold sm:text-lg">
                    {registration.attendee_name || '—'}
                  </h3>
                  {registration.is_guest && (
                    <Badge variant="outline" className="text-[10px]">
                      Guest
                    </Badge>
                  )}
                </div>
                <p className="break-all text-xs text-muted-foreground sm:text-sm">
                  {registration.email || 'No email on file'}
                </p>
                {registration.phone && (
                  <p className="flex items-center gap-1.5 break-words text-xs text-muted-foreground sm:text-sm">
                    <Phone className="h-3 w-3 shrink-0" />
                    {registration.phone}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0 space-y-1">
                <Label className="text-xs text-muted-foreground">Event</Label>
                <p className="break-words text-sm font-medium sm:text-base">
                  {registration.event_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(registration.event_start_date)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <StatusBadge
                    status={registration.status}
                    label={registration.status_label}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Registration #
                </Label>
                <p className="break-all font-mono text-sm">
                  {registration.registration_number}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ticket</Label>
                <p className="break-words text-sm">
                  {registration.ticket_name || '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Format</Label>
                <p className="text-sm">
                  {registration.is_hybrid
                    ? 'Hybrid'
                    : registration.is_virtual
                    ? 'Virtual'
                    : 'In person'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="break-words text-sm">
                  {registration.is_virtual && !registration.is_hybrid
                    ? 'Online'
                    : registration.in_person_location ||
                      [
                        registration.venue_name,
                        registration.venue_city,
                        registration.venue_country,
                      ]
                        .filter(Boolean)
                        .join(', ') ||
                      '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Registered
                </Label>
                <p className="text-sm">{formatDate(registration.created_at)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Attendee type
                </Label>
                <p className="text-sm">
                  {registration.is_guest ? 'Guest' : 'Account'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full cursor-pointer justify-start text-sm"
                onClick={() => onGoToEventRegistrations(registration.event_id)}
              >
                <ArrowRight className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words text-left">
                  Event Registrations
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer justify-start text-sm"
                onClick={() => onGoToEvent(registration.event_id)}
              >
                <Calendar className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words text-left">Go to Event</span>
              </Button>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full cursor-pointer sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}