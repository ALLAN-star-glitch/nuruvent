/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Loader2, Lock } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetEventAttendeesQuery } from '@/lib/store/api/attendanceApi';
import {
  useIssueCertificatesMutation,
  useListCertificateTemplatesQuery,
} from '@/lib/store/api/certificatesApi';
import type { EventAttendeeRow } from '@/lib/types/attendance';

import { IssueBatchCostSummary } from './IssueBatchCostSummary';
import { IssueBatchRecipientSelector } from './IssueBatchRecipientSelector';
import type { SelectedRecipient } from './types';

function attendeeToRecipient(a: EventAttendeeRow): SelectedRecipient {
  return {
    attendee_id: a.attendee_id,
    name: a.display_name,
    email: a.email,
    completed_at: a.last_activity_at || a.registered_at,
    is_host: a.is_host,
    is_auto: true,
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  teamId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventDuration?: string;
  issuerName?: string;
  onIssued?: () => void;
}

export function IssueBatchDialog({
  open,
  onOpenChange,
  accountId,
  teamId,
  eventId,
  eventTitle,
  eventDate,
  eventDuration,
  issuerName = 'Nuruvent',
  onIssued,
}: Props) {
  const router = useRouter();

  const { data: templatesData, isLoading: templatesLoading } =
    useListCertificateTemplatesQuery(accountId, { skip: !open });

  const {
    data: attendeesData,
    isLoading: attendeesLoading,
    isFetching: attendeesFetching,
  } = useGetEventAttendeesQuery(
    {
      eventId,
      params: {
        status: 'confirmed,full,partial,joined',
        page: 1,
        page_size: 100,
      },
    },
    { skip: !open },
  );

  const [issueCertificates, { isLoading: issuing }] =
    useIssueCertificatesMutation();

  const [templateId, setTemplateId] = useState<string>('');
  const [autoRecipients, setAutoRecipients] = useState<SelectedRecipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualRecipients, setManualRecipients] = useState<SelectedRecipient[]>([]);

  // Redirect loading state — keeps the dialog open with a visible
  // overlay while Next.js transitions to the payment page.
  const [redirecting, setRedirecting] = useState(false);

  const templates = templatesData?.data?.templates ?? [];

  useEffect(() => {
    if (!open) {
      setManualRecipients([]);
      setRedirecting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!attendeesData?.data?.attendees) return;
    const recs = attendeesData.data.attendees
      .filter((a) => !a.is_host)
      .map(attendeeToRecipient);
    setAutoRecipients(recs);
    setSelectedIds(new Set(recs.map((r) => r.attendee_id)));
  }, [attendeesData]);

  useEffect(() => {
    if (!templateId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) ?? templates[0];
      setTemplateId(def.id);
    }
  }, [templates, templateId]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  const pricePerCertMinor = selectedTemplate?.price_minor ?? 0;

  const selectedAuto = useMemo(
    () => autoRecipients.filter((r) => selectedIds.has(r.attendee_id)),
    [autoRecipients, selectedIds],
  );

  const finalRecipients = useMemo(
    () => [...selectedAuto, ...manualRecipients],
    [selectedAuto, manualRecipients],
  );

  const totalMinor = pricePerCertMinor * finalRecipients.length;
  const isFree = pricePerCertMinor === 0;
  const hasRemoved = selectedAuto.length < autoRecipients.length;
  const hasManual = manualRecipients.length > 0;

  const effectiveMode: 'add' | 'replace' =
    !hasRemoved && !hasManual ? 'add' : 'replace';

  const toggleOne = (attendeeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(attendeeId)) next.delete(attendeeId);
      else next.add(attendeeId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === autoRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(autoRecipients.map((r) => r.attendee_id)));
    }
  };

  const addManual = (r: SelectedRecipient) => {
    setManualRecipients((prev) => [...prev, { ...r, is_auto: false }]);
  };

  const removeManual = (attendeeId: string) => {
    setManualRecipients((prev) =>
      prev.filter((r) => r.attendee_id !== attendeeId),
    );
  };

  const handleIssue = async () => {
    if (!templateId) {
      toast.error('Select a template');
      return;
    }
    if (finalRecipients.length === 0) {
      toast.error('Select at least one recipient');
      return;
    }

    try {
      const body =
        effectiveMode === 'add'
          ? {
              account_id: accountId,
              template_id: templateId,
              event_title: eventTitle,
              event_date: eventDate,
              event_duration: eventDuration,
              issuer_name: issuerName,
              mode: 'add' as const,
              recipients: [],
            }
          : {
              account_id: accountId,
              template_id: templateId,
              event_title: eventTitle,
              event_date: eventDate,
              event_duration: eventDuration,
              issuer_name: issuerName,
              mode: 'replace' as const,
              recipients: finalRecipients.map((r) => ({
                name: r.name,
                email: r.email,
                completed_at: r.completed_at,
              })),
            };

      const res = await issueCertificates({ eventId, body }).unwrap();
      const data = res.data;

      // ---- Free path: issue immediately, small loader, then close ----
      if (data.type === 'free') {
        toast.success(
          `${data.issued} certificate${data.issued === 1 ? '' : 's'} issued${
            data.reused > 0 ? ` (${data.reused} already had one)` : ''
          }`,
        );
        setRedirecting(true);
        await new Promise((r) => setTimeout(r, 200));
        onOpenChange(false);
        onIssued?.();
        return;
      }

      // ---- Paid path: show loader, then navigate ----
      toast.success('Batch order created — opening payment page…');
      setRedirecting(true);

      // Give the browser a frame to paint the overlay. Next.js may
      // also compile the payment route here in dev; the loader
      // makes that wait visible.
      await new Promise((r) => setTimeout(r, 150));

      router.push(
        `/dashboard/${accountId}/${teamId}/events/${eventId}/pay/${data.order_id}`,
      );

      // Don't close the dialog — it unmounts when the route changes.
      // If navigation somehow fails, the overlay stays visible.
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to issue certificates';
      toast.error(msg);
      setRedirecting(false);
    }
  };

  const loading = templatesLoading || attendeesLoading;
  const busy = issuing || redirecting;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Prevent closing during active work or redirect.
        if (busy) return;
        onOpenChange(v);
      }}
    >
<DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Issue certificates
          </DialogTitle>
          <DialogDescription>
            Choose a template and confirm recipients. Attendees with
            qualifying attendance are pre-selected.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Certificate template
              </Label>
              <Select
                value={templateId}
                onValueChange={setTemplateId}
                disabled={busy}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Choose a template…" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => {
                    const price = t.price_minor ?? 0;
                    return (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="cursor-pointer"
                      >
                        {t.name}
                        {' — '}
                        {price === 0
                          ? 'Free'
                          : `KES ${(price / 100).toFixed(2)}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <IssueBatchRecipientSelector
              autoRecipients={autoRecipients}
              selectedIds={selectedIds}
              manualRecipients={manualRecipients}
              attendeesLoading={attendeesFetching}
              disabled={busy}
              onToggleOne={toggleOne}
              onToggleAll={toggleAll}
              onAddManual={addManual}
              onRemoveManual={removeManual}
            />

            <IssueBatchCostSummary
              pricePerCertMinor={pricePerCertMinor}
              recipientCount={finalRecipients.length}
              totalMinor={totalMinor}
              currency="KES"
              isFree={isFree}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleIssue}
            disabled={busy || finalRecipients.length === 0 || !templateId}
          >
            {issuing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing…
              </>
            ) : redirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : isFree ? (
              <>
                <Award className="mr-2 h-4 w-4" />
                Issue {finalRecipients.length} free
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay & issue
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Full-dialog loading overlay during redirect */}
        {redirecting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/95 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Preparing payment…
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                You&apos;ll be redirected to the checkout page shortly.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}