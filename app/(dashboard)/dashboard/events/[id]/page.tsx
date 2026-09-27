// app/(dashboard)/dashboard/events/[id]/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
  Plug,
  Send,
  Star,
  Trash2,
  User,
  Building2,
  BadgeCheck,
  XCircle,
  Video,
  Link2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  useDeleteEventMutation,
  useGetEventByIdQuery,
  usePublishEventMutation,
  useCreateEventMeetingMutation,
  useDeleteEventMeetingMutation,
  useRegenerateEventMeetingMutation,
  useUpdateEventMutation,
} from '@/lib/store/api/eventsApi';
import type { Event, Schedule, VideoPlatform } from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventHostName,
  getEventLocation,
  getEventMinPrice,
  getEventStartTime,
  getEventStatusName,
  isEventDraft,
  isEventPublished,
  isHostInstitution,
} from '@/lib/utils/eventDisplay';

import { PlatformPickerModal } from '@/components/events/video/PlatformPickerModal';
import { useVideoConnection } from '@/components/events/video/useVideoConnection';

import {
  EditMeetingDialog,
  type EditMeetingFormValues,
} from '@/components/meeting/EditMeetingDialog';
import { ShareMeetingDialog } from '@/components/meeting/ShareMeetingDialog';
import { DeleteMeetingDialog } from '@/components/meeting/DeleteMeetingDialog';
import { MeetingActions } from '@/components/meeting/MeetingActions';

// ============================================================
// HELPERS
// ============================================================

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://nuruvent.com';

function getPublicEventUrl(slug: string): string {
  return `${PUBLIC_SITE_URL}/events/${slug}`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusConfig(statusName: string) {
  const map: Record<string, { color: string; dot: string; label: string }> = {
    Draft: {
      color: 'text-muted-foreground bg-muted border-border',
      dot: 'bg-muted-foreground',
      label: 'Draft',
    },
    Published: {
      color: 'text-primary bg-primary/10 border-primary/30',
      dot: 'bg-primary',
      label: 'Published',
    },
    Cancelled: {
      color: 'text-destructive bg-destructive/10 border-destructive/30',
      dot: 'bg-destructive',
      label: 'Cancelled',
    },
    Completed: {
      color: 'text-primary bg-primary/10 border-primary/30',
      dot: 'bg-primary',
      label: 'Completed',
    },
  };
  return map[statusName] ?? map.Draft;
}

function getPrimaryMeetingLink(event: Event): string | undefined {
  const virtualSchedule = event.schedules?.find(
    (s) => s.is_virtual && (s.zoom_link || s.meet_link),
  );
  if (virtualSchedule) {
    return virtualSchedule.zoom_link || virtualSchedule.meet_link || undefined;
  }
  return event.zoom_link || event.meet_link || undefined;
}

function getMeetingPlatformLabel(event: Event): string {
  if (!event.is_virtual) return 'In-Person';
  if (event.zoom_link) return 'Zoom';
  if (event.meet_link) return 'Google Meet';
  return 'Virtual';
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function isScheduleVirtualWithMeeting(s: Schedule): boolean {
  return !!(s.is_virtual && (s.zoom_link || s.meet_link));
}

// ============================================================
// PAGE
// ============================================================

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [eventId, setEventId] = useState<string>('');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMemo(() => {
    // eslint-disable-next-line react-hooks/set-state-in-render
    void (async () => {
      const resolved = await params;
      setEventId(resolved.id);
    })();
  }, [params]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedEvent, setCopiedEvent] = useState(false);
  const [copiedJoin, setCopiedJoin] = useState(false);
  const [publishError, setPublishError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] = useState(false);

  // ---- Meeting management state ----
  const [isMeetingActionRunning, setIsMeetingActionRunning] = useState(false);
  const [isDeleteMeetingDialogOpen, setIsDeleteMeetingDialogOpen] =
    useState(false);
  const [isEditMeetingDialogOpen, setIsEditMeetingDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);

  // ---- Video connection + platform picker ----
  const video = useVideoConnection();
  const [isPlatformPickerOpen, setIsPlatformPickerOpen] = useState(false);
  const [pickedPlatform, setPickedPlatform] = useState<VideoPlatform | null>(
    null,
  );

  const { data: response, isLoading, error, refetch } = useGetEventByIdQuery(
    eventId,
    { skip: !eventId },
  );
  const [publishEvent] = usePublishEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [createEventMeeting] = useCreateEventMeetingMutation();
  const [deleteEventMeeting] = useDeleteEventMeetingMutation();
  const [regenerateEventMeeting] = useRegenerateEventMeetingMutation();
  const [updateEvent] = useUpdateEventMutation();

  const event: Event | undefined = response?.data;

  const publishErrorIsConnectionIssue = !!(
    publishError?.message
      ?.toLowerCase()
      .includes('zoom connection is no longer valid') ||
    publishError?.details?.some((d) =>
      d.toLowerCase().includes('zoom connection is no longer valid'),
    )
  );

  const statusName = event ? getEventStatusName(event) : 'Draft';
  const statusConfig = getStatusConfig(statusName);
  const isDraft = event ? isEventDraft(event) : false;
  const isPublished = event ? isEventPublished(event) : false;

  const zoomConnection = video.getConnection('zoom');
  const hasZoomConnection = !!zoomConnection;

  const openZoomPicker = () => {
    setPickedPlatform('zoom');
    setIsPlatformPickerOpen(true);
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handlePublish = async () => {
    if (!event) return;
    setIsPublishing(true);
    setPublishError(null);

    const loadingToast = toast.loading(
      `Publishing "${event.display_name || event.name}"...`,
    );

    try {
      await publishEvent(event.id).unwrap();

      toast.dismiss(loadingToast);
      toast.success(
        `"${event.display_name || event.name}" published successfully!`,
        { duration: 4000, position: 'top-right' },
      );

      refetch();
    } catch (err: unknown) {
      console.error('Failed to publish event:', err);
      toast.dismiss(loadingToast);

      const errData = (err as { data?: unknown })?.data;

      let errorMessage = 'Failed to publish event';
      let errorDetails: string[] = [];

      if (errData) {
        if (typeof errData === 'string') {
          errorMessage = errData;
        } else if (
          typeof errData === 'object' &&
          errData !== null &&
          'message' in errData
        ) {
          const msg = (errData as { message?: unknown }).message;
          if (typeof msg === 'string') errorMessage = msg;
        }

        if (
          typeof errData === 'object' &&
          errData !== null &&
          'errors' in errData
        ) {
          const errors = (errData as { errors?: unknown }).errors;
          if (typeof errors === 'string') {
            errorDetails = [errors];
          } else if (Array.isArray(errors)) {
            errorDetails = errors.map(String);
          } else if (errors && typeof errors === 'object') {
            errorDetails = Object.values(errors).map(String);
          }
        }

        if (errorDetails.length === 0 && errorMessage) {
          errorDetails = [errorMessage];
        }
      }

      if (errorDetails.length === 0) {
        errorDetails = [
          err instanceof Error ? err.message : 'Failed to publish event',
        ];
      }

      setPublishError({ message: errorMessage, details: errorDetails });
      setIsPublishErrorDialogOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteEvent(event.id).unwrap();
      toast.success('Event moved to trash successfully');
      router.push('/dashboard/events');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to move event to trash';
      toast.error(message);
      setIsDeleting(false);
    }
  };

  const handleCopyEventLink = async () => {
    if (!event) return;
    const url = getPublicEventUrl(event.slug);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedEvent(true);
      toast.success('Event link copied to clipboard');
      setTimeout(() => setCopiedEvent(false), 2000);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const handleCopyJoinLink = async () => {
    if (!event) return;
    const link = getPrimaryMeetingLink(event);
    if (!link) {
      toast.error('No meeting link yet');
      return;
    }
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopiedJoin(true);
      toast.success('Join link copied to clipboard');
      setTimeout(() => setCopiedJoin(false), 2000);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const handleCreateMeeting = async () => {
    if (!event) return;
    setIsMeetingActionRunning(true);
    const t = toast.loading('Creating Zoom meeting…');
    try {
      await createEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meeting created successfully');
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create meeting';
      toast.error(msg);
    } finally {
      setIsMeetingActionRunning(false);
    }
  };

  const handleRegenerateMeeting = async () => {
    if (!event) return;
    setIsMeetingActionRunning(true);
    const t = toast.loading('Regenerating Zoom meeting…');
    try {
      await regenerateEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meeting regenerated — share the new link');
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to regenerate meeting';
      toast.error(msg);
    } finally {
      setIsMeetingActionRunning(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!event) return;
    setIsMeetingActionRunning(true);
    const t = toast.loading('Deleting Zoom meeting…');
    try {
      await deleteEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meeting deleted');
      setIsDeleteMeetingDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete meeting';
      toast.error(msg);
    } finally {
      setIsMeetingActionRunning(false);
    }
  };

  const handleSaveMeeting = async (values: EditMeetingFormValues) => {
    if (!event) return;
    const primary = event.schedules?.[0];
    if (!primary) return;

    setIsSavingMeeting(true);
    const t = toast.loading('Updating meeting…');
    try {
      await updateEvent({
        id: event.id,
        data: {
          schedules: [
            {
              id: primary.id,
              session_name: values.session_name,
              start_date: values.start_date,
              start_time: values.start_time + ':00',
              end_time: values.end_time + ':00',
              timezone: values.timezone,
              is_virtual: true,
            },
          ],
        },
      }).unwrap();
      toast.dismiss(t);
      toast.success('Meeting updated');
      setIsEditMeetingDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update meeting';
      toast.error(msg);
    } finally {
      setIsSavingMeeting(false);
    }
  };

  const handleShareCopy = async () => {
    if (!event) return;
    const link = getPrimaryMeetingLink(event);
    const text = `Join "${event.display_name || event.name}" on Zoom: ${link ?? ''}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success('Join link copied');
      setIsShareDialogOpen(false);
    } else {
      toast.error('Could not copy the link');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading || !eventId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The event you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Button
            onClick={() => router.push('/dashboard/events')}
            className="cursor-pointer"
          >
            Go to Events
          </Button>
        </div>
      </div>
    );
  }

  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);
  const startDate = event.start_date ?? event.schedules?.[0]?.start_date;
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const location = getEventLocation(event);
  const price = getEventMinPrice(event);

  const meetingLink = getPrimaryMeetingLink(event);
  const meetingPlatform = getMeetingPlatformLabel(event);
  const virtualSchedules = (event.schedules ?? []).filter(
    isScheduleVirtualWithMeeting,
  );
  const primaryMeetingId = event.schedules?.[0]?.video_meeting_id;

  const shareText = `Join "${event.display_name || event.name}" on Zoom: ${meetingLink ?? ''}`;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                {event.display_name || event.name}
              </h1>
              <Badge variant="outline" className={`${statusConfig.color} border`}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1 inline-block`}
                />
                {statusConfig.label}
              </Badge>
              {event.is_featured && (
                <Badge className="bg-secondary-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {event.is_private && (
                <Badge
                  variant="outline"
                  className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Event ID: {event.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline" className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {isDraft && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          )}

          {isPublished && (
            <Link href={`/events/${event.slug}`} target="_blank">
              <Button variant="outline" className="cursor-pointer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </Link>
          )}

          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-muted shadow-sm">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.display_name || event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-muted">
                <CalendarDays className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Meeting card */}
          {event.is_virtual && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">
                        Meeting
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30 bg-primary/10 text-xs"
                      >
                        {meetingPlatform}
                      </Badge>
                      {hasZoomConnection && (
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/30 bg-primary/10 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Zoom connected
                        </Badge>
                      )}
                    </div>

                    {meetingLink ? (
                      <>
                        <p className="text-sm text-muted-foreground mt-1">
                          Share this link with your attendees. They can join
                          from any browser.
                        </p>
                        <p className="text-xs font-mono text-foreground/70 mt-2 truncate bg-background/60 rounded px-2 py-1.5 border border-border">
                          {meetingLink}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() =>
                              window.open(
                                meetingLink,
                                '_blank',
                                'noopener,noreferrer',
                              )
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Join Meeting
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={handleCopyJoinLink}
                          >
                            {copiedJoin ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                Copy Link
                              </>
                            )}
                          </Button>
                          {primaryMeetingId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() =>
                                window.open(
                                  `https://zoom.us/meeting/${primaryMeetingId}`,
                                  '_blank',
                                  'noopener,noreferrer',
                                )
                              }
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              View in Zoom
                            </Button>
                          )}
                        </div>

                        {primaryMeetingId && (
                          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Meeting ID
                              </p>
                              <p className="font-mono text-sm text-foreground">
                                {primaryMeetingId}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Platform
                              </p>
                              <p className="text-sm text-foreground">
                                {meetingPlatform}
                              </p>
                            </div>
                          </div>
                        )}

                        <MeetingActions
                          running={isMeetingActionRunning}
                          onEdit={() => setIsEditMeetingDialogOpen(true)}
                          onShare={() => setIsShareDialogOpen(true)}
                          onRegenerate={handleRegenerateMeeting}
                          onDelete={() => setIsDeleteMeetingDialogOpen(true)}
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isDraft
                            ? 'A meeting link will be created automatically when you publish this event.'
                            : 'No meeting link yet. Create one automatically with your connected Zoom account, or paste a link manually in the editor.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {hasZoomConnection ? (
                            <Button
                              size="sm"
                              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={handleCreateMeeting}
                              disabled={isMeetingActionRunning}
                            >
                              {isMeetingActionRunning ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Creating…
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5 mr-1.5" />
                                  Create Meeting
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={openZoomPicker}
                            >
                              <Plug className="h-3.5 w-3.5 mr-1.5" />
                              Manage Connection
                            </Button>
                          )}

                          <Link href={`/dashboard/events/${event.id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                            >
                              <Link2 className="h-3.5 w-3.5 mr-1.5" />
                              Paste a link manually
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* All virtual schedules */}
                {virtualSchedules.length > 1 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        All sessions ({virtualSchedules.length})
                      </p>
                      <div className="space-y-2">
                        {virtualSchedules.map((s) => {
                          const link = s.zoom_link || s.meet_link;
                          const label =
                            s.session_name ||
                            `Session ${s.session_number ?? ''}`.trim();
                          return (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-background/60 border border-border"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {label}
                                </p>
                                {s.start_time && (
                                  <p className="text-xs text-muted-foreground">
                                    {s.start_time}
                                    {s.end_time && ` – ${s.end_time}`}
                                  </p>
                                )}
                              </div>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
                              >
                                <Link2 className="h-3 w-3" />
                                Join
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {event.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary" />
                  About This Event
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(startDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {startTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* More details */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {duration && (
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium text-primary">
                    {formatPrice(price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate</p>
                  <p className="font-medium text-foreground">
                    {event.certificate_enabled &&
                    (event.certificate_price ?? 0) > 0
                      ? formatPrice(event.certificate_price ?? 0)
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium text-foreground">
                    {event.capacity > 0 ? event.capacity : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Attendees</p>
                  <p className="font-medium text-foreground">
                    {event.current_attendees ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">
                    {event.is_virtual
                      ? 'Virtual'
                      : event.is_hybrid
                        ? 'Hybrid'
                        : 'In-Person'}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {new Date(event.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Host card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Event Host
              </h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {hostIsInstitution ? (
                    <Building2 className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    {hostName}
                    {hostIsInstitution && (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hostIsInstitution
                      ? 'Institution Account'
                      : 'Individual Account'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Quick Actions
              </h3>

              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </Link>

              {event.is_virtual && !meetingLink && !hasZoomConnection && (
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  onClick={openZoomPicker}
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Manage Connection
                </Button>
              )}

              {isDraft && (
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish Event'}
                </Button>
              )}

              {isPublished && (
                <Link
                  href={`/events/${event.slug}`}
                  target="_blank"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={handleCopyEventLink}
              >
                {copiedEvent ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Event Link
                  </>
                )}
              </Button>

              {event.is_virtual && meetingLink && (
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer"
                  onClick={handleCopyJoinLink}
                >
                  {copiedJoin ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Copy Join Link
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full justify-start cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Moving to trash...' : 'Move to Trash'}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Event Stats
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attendees</span>
                <span className="font-medium text-foreground">
                  {event.current_attendees ?? 0} /{' '}
                  {event.capacity > 0 ? event.capacity : '∞'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground">
                  {event.is_virtual
                    ? 'Virtual'
                    : event.is_hybrid
                      ? 'Hybrid'
                      : 'In-Person'}
                </span>
              </div>

              {event.is_featured && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Featured</span>
                  <Badge className="bg-secondary-500 text-white border-0 text-xs">
                    Yes
                  </Badge>
                </div>
              )}

              {event.is_private && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Private</span>
                  <Badge
                    variant="outline"
                    className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs"
                  >
                    Yes
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Move to trash dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Trash2 className="h-5 w-5" />
              Move to Trash
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to move this event to trash? You can restore
              it later from the trash section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-full">
                <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {event.display_name || event.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(startDate)} • {startTime}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Moving...' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish error dialog */}
      <Dialog
        open={isPublishErrorDialogOpen}
        onOpenChange={setIsPublishErrorDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {publishErrorIsConnectionIssue
                ? 'Zoom Connection Required'
                : 'Cannot Publish Event'}
            </DialogTitle>
            <DialogDescription className="text-destructive">
              {publishError?.message || 'Failed to publish event'}
            </DialogDescription>
          </DialogHeader>

          {publishError?.details && publishError.details.length > 0 && (
            <div className="py-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Please fix the following issues:
              </p>
              <ul className="space-y-2">
                {publishError.details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsPublishErrorDialogOpen(false)}
              className="w-full sm:w-auto cursor-pointer"
            >
              Close
            </Button>

            {publishErrorIsConnectionIssue ? (
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                onClick={() => {
                  setIsPublishErrorDialogOpen(false);
                  openZoomPicker();
                }}
              >
                <Plug className="h-4 w-4 mr-2" />
                Manage Connection
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                onClick={() => {
                  setIsPublishErrorDialogOpen(false);
                  router.push(`/dashboard/events/${event.id}/edit`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting management dialogs */}
      <EditMeetingDialog
        open={isEditMeetingDialogOpen}
        onOpenChange={setIsEditMeetingDialogOpen}
        schedule={event.schedules?.[0]}
        saving={isSavingMeeting}
        onSave={handleSaveMeeting}
      />

      <ShareMeetingDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        meetingLink={meetingLink}
        shareText={shareText}
        onCopy={handleShareCopy}
      />

      <DeleteMeetingDialog
        open={isDeleteMeetingDialogOpen}
        onOpenChange={setIsDeleteMeetingDialogOpen}
        deleting={isMeetingActionRunning}
        onConfirm={handleDeleteMeeting}
      />

      {/* Platform picker */}
      <PlatformPickerModal
        open={isPlatformPickerOpen}
        onOpenChange={setIsPlatformPickerOpen}
        returnUrl={`/dashboard/events/${event.id}`}
        initialPlatform={pickedPlatform}
      />
    </div>
  );
}