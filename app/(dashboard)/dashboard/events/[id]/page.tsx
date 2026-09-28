/* eslint-disable react-hooks/set-state-in-render */
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
  MoreVertical,
  Plus,
  Plug,
  RefreshCw,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import {
  PlatformPickerModal,
  PLATFORMS,
  type PlatformMeta,
} from '@/components/events/video/PlatformPickerModal';
import { useVideoConnection } from '@/components/events/video/useVideoConnection';
import { AddMeetingDialog } from '@/components/events/video/AddMeetingDialog';

import {
  EditMeetingDialog,
  type EditMeetingFormValues,
} from '@/components/meeting/EditMeetingDialog';
import { ShareMeetingDialog } from '@/components/meeting/ShareMeetingDialog';
import { DeleteMeetingDialog } from '@/components/meeting/DeleteMeetingDialog';

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

function schedulePlatform(s: Schedule): VideoPlatform | undefined {
  if (s.platform) return s.platform;
  if (s.zoom_link) return 'zoom';
  if (s.meet_link) return 'google_meet';
  return undefined;
}

function schedulePlatformMeta(s: Schedule): PlatformMeta | undefined {
  const p = schedulePlatform(s);
  if (!p) return undefined;
  return PLATFORMS.find((m) => m.platform === p);
}

function scheduleMeetingLink(s: Schedule): string | undefined {
  return s.zoom_link || s.meet_link || undefined;
}

function isSessionWithMeeting(s: Schedule): boolean {
  return !!(s.is_virtual && (s.platform || scheduleMeetingLink(s)));
}

function sessionLabel(s: Schedule, index: number): string {
  return s.session_name?.trim() || `Session ${index + 1}`;
}

function sessionTimeLabel(s: Schedule): string {
  const parts: string[] = [];
  if (s.start_date) parts.push(s.start_date);
  if (s.start_time && s.end_time) parts.push(`${s.start_time} – ${s.end_time}`);
  else if (s.start_time) parts.push(s.start_time);
  return parts.join(' · ');
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
    // fall through
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

// ============================================================
// CREATE MEETING PLATFORM PICKER
// ============================================================

interface CreateMeetingPlatformPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: PlatformMeta[];
  onPick: (platform: VideoPlatform) => void;
  running: boolean;
}

function CreateMeetingPlatformPicker({
  open,
  onOpenChange,
  platforms,
  onPick,
  running,
}: CreateMeetingPlatformPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            Choose a video platform
          </DialogTitle>
          <DialogDescription>
            We&apos;ll create a meeting for every session that doesn&apos;t
            have one yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {platforms.map((p) => {
            const disabled = running;
            return (
              <button
                key={p.platform}
                type="button"
                disabled={disabled}
                onClick={() => onPick(p.platform)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer',
                )}
              >
                <div className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-background border border-border overflow-hidden p-1.5">
                  <Image
                    src={p.logo}
                    alt={`${p.label} logo`}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {p.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create on {p.label}
                  </p>
                </div>
                {running && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={running}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// SESSION ROW
// ============================================================

interface SessionRowProps {
  session: Schedule;
  index: number;
  meta: PlatformMeta | undefined;
  link: string | undefined;
  running: boolean;
  copied: boolean;
  onCopy: (sessionId: string, link: string) => void;
  onJoin: (link: string) => void;
  onEdit: (sessionId: string) => void;
  onShare: (sessionId: string) => void;
  onRegenerate: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

function SessionRow({
  session,
  index,
  meta,
  link,
  running,
  copied,
  onCopy,
  onJoin,
  onEdit,
  onShare,
  onRegenerate,
  onDelete,
}: SessionRowProps) {
  const label = sessionLabel(session, index);
  const time = sessionTimeLabel(session);

  return (
    <div className="rounded-lg border border-border bg-background/70 overflow-hidden">
      <div className="p-3 sm:p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {index === 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  Primary
                </span>
              )}
              <p className="text-sm font-semibold text-foreground break-words">
                {label}
              </p>
            </div>

            {time && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span className="break-words">{time}</span>
              </p>
            )}
          </div>

          {meta && (
            <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background">
              <div className="h-4 w-4">
                <Image
                  src={meta.logo}
                  alt={`${meta.label} logo`}
                  width={16}
                  height={16}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:inline">
                {meta.label}
              </span>
            </div>
          )}
        </div>

        {link ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs font-mono text-foreground/80 truncate flex-1 min-w-0">
              {link}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5">
            <AlertCircle className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">No meeting yet</p>
          </div>
        )}
      </div>

      <div className="border-t border-border px-3 sm:px-4 py-2 flex items-center gap-1.5 flex-wrap bg-muted/20">
        {link ? (
          <>
            <Button
              size="sm"
              className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => onJoin(link)}
              disabled={running}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Join
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer h-8 text-xs"
              onClick={() => onCopy(session.id, link)}
              disabled={running}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer h-8 text-xs"
                onClick={() => onEdit(session.id)}
                disabled={running}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer h-8 text-xs"
                onClick={() => onShare(session.id)}
                disabled={running}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
            </div>

            <div className="sm:hidden ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer h-8 w-8 p-0"
                    disabled={running}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEdit(session.id)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onShare(session.id)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onRegenerate(session.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden sm:block ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer h-8 w-8 p-0"
                    disabled={running}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onRegenerate(session.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={() => onEdit(session.id)}
            disabled={running}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit session
          </Button>
        )}

        {running && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-2" />
        )}
      </div>
    </div>
  );
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
  const [publishError, setPublishError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] =
    useState(false);

  // ---- Session-scoped state ----
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sharingSessionId, setSharingSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [runningSessionId, setRunningSessionId] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<
    'create' | 'edit' | 'share' | 'regenerate' | 'delete' | 'add' | null
  >(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // ---- Video connection + platform pickers ----
  const video = useVideoConnection();
  const [isPlatformPickerOpen, setIsPlatformPickerOpen] = useState(false);
  const [pickedPlatform, setPickedPlatform] = useState<VideoPlatform | null>(
    null,
  );
  const [isCreatePickerOpen, setIsCreatePickerOpen] = useState(false);
  const [isAddMeetingDialogOpen, setIsAddMeetingDialogOpen] = useState(false);

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

  const statusName = event ? getEventStatusName(event) : 'Draft';
  const statusConfig = getStatusConfig(statusName);
  const isDraft = event ? isEventDraft(event) : false;
  const isPublished = event ? isEventPublished(event) : false;

  const hasZoomConnection = !!video.getConnection('zoom');
  const hasMeetConnection = !!video.getConnection('google_meet');
  const hasAnyConnection = hasZoomConnection || hasMeetConnection;

  const connectedPlatformMetas: PlatformMeta[] = PLATFORMS.filter(
    (p) => p.available && !!video.getConnection(p.platform),
  );

  const editingSession = event?.schedules?.find(
    (s) => s.id === editingSessionId,
  );
  const sharingSession = event?.schedules?.find(
    (s) => s.id === sharingSessionId,
  );

  const openPlatformPicker = () => {
    setPickedPlatform(null);
    setIsPlatformPickerOpen(true);
  };

  const publishErrorIsConnectionIssue = (() => {
    const patterns = [
      'connection is no longer valid',
      'not connected',
      'reconnect',
    ];
    const haystack = [
      publishError?.message ?? '',
      ...(publishError?.details ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return patterns.some((p) => haystack.includes(p));
  })();

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

  const handleCopySessionLink = async (sessionId: string, link: string) => {
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopiedSessionId(sessionId);
      toast.success('Join link copied');
      setTimeout(() => setCopiedSessionId(null), 2000);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const handleJoinLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleEditSession = (sessionId: string) => {
    setEditingSessionId(sessionId);
  };

  const handleShareSession = (sessionId: string) => {
    setSharingSessionId(sessionId);
  };

  const handleRegenerateSession = async (sessionId: string) => {
    if (!event) return;
    setRunningSessionId(sessionId);
    setRunningAction('regenerate');
    const t = toast.loading('Regenerating meeting…');
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
      setRunningSessionId(null);
      setRunningAction(null);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);
  };

  const handleDeleteMeeting = async () => {
    if (!event) return;
    setRunningSessionId(deletingSessionId);
    setRunningAction('delete');
    const t = toast.loading('Deleting meeting…');
    try {
      await deleteEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meeting deleted');
      setDeletingSessionId(null);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete meeting';
      toast.error(msg);
    } finally {
      setRunningAction(null);
      setRunningSessionId(null);
    }
  };

  const handleSaveMeeting = async (values: EditMeetingFormValues) => {
    if (!event || !editingSession) return;

    setRunningSessionId(editingSession.id);
    setRunningAction('edit');
    const t = toast.loading('Updating meeting…');
    try {
      await updateEvent({
        id: event.id,
        data: {
          schedules: [
            {
              id: editingSession.id,
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
      setEditingSessionId(null);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update meeting';
      toast.error(msg);
    } finally {
      setRunningSessionId(null);
      setRunningAction(null);
    }
  };

  const handleShareCopy = async () => {
    if (!event || !sharingSession) return;
    const link = scheduleMeetingLink(sharingSession);
    const platformLabel = schedulePlatformMeta(sharingSession)?.label ?? 'video';
    const label = sessionLabel(sharingSession, 0);
    const text = `Join "${label}" on ${platformLabel}: ${link ?? ''}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success('Join link copied');
      setSharingSessionId(null);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const handleRegenerateAll = async () => {
    if (!event) return;
    setRunningAction('regenerate');
    const t = toast.loading('Regenerating all meetings…');
    try {
      await regenerateEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meetings regenerated');
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to regenerate meetings';
      toast.error(msg);
    } finally {
      setRunningAction(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!event) return;
    setRunningAction('delete');
    const t = toast.loading('Deleting all meetings…');
    try {
      await deleteEventMeeting(event.id).unwrap();
      toast.dismiss(t);
      toast.success('Meetings deleted');
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete meetings';
      toast.error(msg);
    } finally {
      setRunningAction(null);
    }
  };

  const handleCreateMeetings = async () => {
    if (!event) return;
    if (connectedPlatformMetas.length === 1) {
      await createMeetingOnPlatform(connectedPlatformMetas[0].platform);
      return;
    }
    setIsCreatePickerOpen(true);
  };

  const createMeetingOnPlatform = async (platform: VideoPlatform) => {
    if (!event) return;
    setRunningAction('create');
    const label =
      PLATFORMS.find((p) => p.platform === platform)?.label ?? platform;
    const t = toast.loading(`Creating ${label} meetings…`);
    try {
      await createEventMeeting({
        eventId: event.id,
        platform,
      }).unwrap();
      toast.dismiss(t);
      toast.success('Meetings created successfully');
      setIsCreatePickerOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create meetings';
      toast.error(msg);
    } finally {
      setRunningAction(null);
    }
  };

  // ------------------------------------------------------------
  // ADD MEETING
  // ------------------------------------------------------------

  const handleAddMeeting = async (values: {
    session_name: string;
    start_date: string;
    start_time: string;
    end_time: string;
    timezone: string;
    platform: VideoPlatform;
  }) => {
    if (!event) return;

    setRunningAction('add');
    const platformLabel =
      PLATFORMS.find((p) => p.platform === values.platform)?.label ??
      values.platform;
    const t = toast.loading(`Adding meeting on ${platformLabel}…`);

    try {
      const existingSchedules = event.schedules ?? [];
      const nextSessionNumber = existingSchedules.length + 1;

      const nextSchedules = [
        ...existingSchedules.map((s) => ({
          id: s.id,
          session_name: s.session_name,
          session_number: s.session_number,
          start_date: s.start_date,
          end_date: s.end_date,
          start_time: s.start_time,
          end_time: s.end_time,
          timezone: s.timezone,
          location: s.location,
          is_virtual: s.is_virtual,
          platform: s.platform,
          zoom_link: s.zoom_link,
          meet_link: s.meet_link,
          max_attendees: s.max_attendees,
        })),
        {
          session_name: values.session_name,
          session_number: nextSessionNumber,
          start_date: values.start_date,
          end_date: undefined,
          start_time: values.start_time + ':00',
          end_time: values.end_time + ':00',
          timezone: values.timezone,
          location: '',
          is_virtual: true,
          platform: values.platform,
          zoom_link: '',
          meet_link: '',
          max_attendees: undefined,
        },
      ];

      await updateEvent({
        id: event.id,
        data: { schedules: nextSchedules },
      }).unwrap();

      await createEventMeeting({
        eventId: event.id,
        platform: values.platform,
      }).unwrap();

      toast.dismiss(t);
      toast.success('Meeting added');
      setIsAddMeetingDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to add meeting';
      toast.error(msg);
    } finally {
      setRunningAction(null);
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
          <p className="text-sm text-muted-foreground">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md px-4">
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

  const virtualSchedulesWithMeeting = (event.schedules ?? []).filter(
    isSessionWithMeeting,
  );
  const virtualSchedulesMissingMeeting = (event.schedules ?? []).filter(
    (s) => s.is_virtual && !isSessionWithMeeting(s),
  );
  const hasAnyMeeting = virtualSchedulesWithMeeting.length > 0;
  const allSessionsHaveMeetings =
    virtualSchedulesMissingMeeting.length === 0 &&
    virtualSchedulesWithMeeting.length > 0;

  const platformsUsed = new Set(
    virtualSchedulesWithMeeting
      .map((s) => schedulePlatform(s))
      .filter(Boolean),
  );

  const meetingSummary = (() => {
    const totalVirtual = (event.schedules ?? []).filter(
      (s) => s.is_virtual,
    ).length;
    if (totalVirtual === 0) return 'No virtual sessions.';
    if (!hasAnyMeeting) return 'No meetings created yet.';
    if (platformsUsed.size === 1) {
      const p = Array.from(platformsUsed)[0];
      const label = PLATFORMS.find((m) => m.platform === p)?.label ?? 'video';
      return `${virtualSchedulesWithMeeting.length} ${
        virtualSchedulesWithMeeting.length === 1 ? 'session' : 'sessions'
      } on ${label}.`;
    }
    return `${virtualSchedulesWithMeeting.length} sessions on mixed platforms.`;
  })();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                {event.display_name || event.name}
              </h1>
              <Badge
                variant="outline"
                className={`${statusConfig.color} border`}
              >
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
                      <Video className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          Meeting
                        </h3>

                        {hasZoomConnection && (
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/30 bg-primary/10 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Zoom
                          </Badge>
                        )}
                        {hasMeetConnection && (
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/30 bg-primary/10 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Google Meet
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {meetingSummary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {hasAnyConnection ? (
                      <Button
                        size="sm"
                        className="cursor-pointer w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setIsAddMeetingDialogOpen(true)}
                        disabled={runningAction === 'add'}
                      >
                        {runningAction === 'add' ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Adding…
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add meeting
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer w-full sm:w-auto"
                        onClick={openPlatformPicker}
                      >
                        <Plug className="h-3.5 w-3.5 mr-1.5" />
                        Connect platform
                      </Button>
                    )}
                  </div>
                </div>

                {/* Empty state */}
                {!hasAnyMeeting &&
                  (event.schedules ?? []).filter((s) => s.is_virtual).length >
                    0 && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <Plug className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            No meetings created yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isDraft
                              ? 'A meeting will be created automatically for each virtual session when you publish.'
                              : hasAnyConnection
                                ? `Create meetings for all ${
                                    (event.schedules ?? []).filter(
                                      (s) => s.is_virtual,
                                    ).length
                                  } virtual sessions with one click, add a new session with a meeting, or paste links in the editor.`
                                : 'Connect a video platform to create meetings automatically, or paste links in the editor.'}
                          </p>
                        </div>
                      </div>

                      {!isDraft && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {hasAnyConnection ? (
                            <>
                              <Button
                                size="sm"
                                className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={handleCreateMeetings}
                                disabled={runningAction === 'create'}
                              >
                                {runningAction === 'create' ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Creating…
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    Create meetings
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => setIsAddMeetingDialogOpen(true)}
                                disabled={runningAction === 'add'}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add meeting
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={openPlatformPicker}
                            >
                              <Plug className="h-3.5 w-3.5 mr-1.5" />
                              Connect a platform
                            </Button>
                          )}
                          <Link href={`/dashboard/events/${event.id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                            >
                              <Link2 className="h-3.5 w-3.5 mr-1.5" />
                              Paste links manually
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                {/* Session list */}
                {hasAnyMeeting && (
                  <div className="mt-4 space-y-3">
                    {virtualSchedulesWithMeeting.map((s, i) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        index={i}
                        meta={schedulePlatformMeta(s)}
                        link={scheduleMeetingLink(s)}
                        running={runningSessionId === s.id}
                        copied={copiedSessionId === s.id}
                        onCopy={handleCopySessionLink}
                        onJoin={handleJoinLink}
                        onEdit={handleEditSession}
                        onShare={handleShareSession}
                        onRegenerate={handleRegenerateSession}
                        onDelete={handleDeleteSession}
                      />
                    ))}
                  </div>
                )}

                {/* Partial state */}
                {hasAnyMeeting && virtualSchedulesMissingMeeting.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="rounded-lg border border-dashed border-border bg-background/60 p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {virtualSchedulesMissingMeeting.length}{' '}
                            {virtualSchedulesMissingMeeting.length === 1
                              ? 'session has no meeting yet'
                              : 'sessions have no meeting yet'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Create them automatically or paste links in the
                            editor.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {hasAnyConnection ? (
                          <Button
                            size="sm"
                            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleCreateMeetings}
                            disabled={runningAction === 'create'}
                          >
                            {runningAction === 'create' ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Creating…
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                Create meetings
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={openPlatformPicker}
                          >
                            <Plug className="h-3.5 w-3.5 mr-1.5" />
                            Connect a platform
                          </Button>
                        )}
                        <Link href={`/dashboard/events/${event.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                          >
                            <Link2 className="h-3.5 w-3.5 mr-1.5" />
                            Paste links manually
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {/* Bulk actions */}
                {allSessionsHaveMeetings &&
                  virtualSchedulesWithMeeting.length > 1 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={handleRegenerateAll}
                          disabled={runningAction === 'regenerate'}
                        >
                          {runningAction === 'regenerate' ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Regenerating all…
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                              Regenerate all
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={handleDeleteAll}
                          disabled={runningAction === 'delete'}
                        >
                          {runningAction === 'delete' ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Deleting all…
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete all
                            </>
                          )}
                        </Button>
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
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-foreground break-words">
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
                  <div className="min-w-0">
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

            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-foreground break-words">
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
                <div className="min-w-0">
                  <p className="font-medium text-foreground flex items-center gap-1.5 flex-wrap">
                    {hostName}
                    {hostIsInstitution && (
                      <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
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

              {event.is_virtual && !hasAnyMeeting && !hasAnyConnection && (
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  onClick={openPlatformPicker}
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
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Trash2 className="h-5 w-5" />
              Move to Trash
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to move this event to trash? You can
              restore it later from the trash section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-full shrink-0">
                <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground break-words">
                  {event.display_name || event.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(startDate)} • {startTime}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer w-full sm:w-auto text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
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
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {publishErrorIsConnectionIssue
                ? 'Video Connection Required'
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
                    <span className="break-words">{detail}</span>
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
                  openPlatformPicker();
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

      {/* Session-scoped dialogs */}
      <EditMeetingDialog
        open={editingSessionId !== null}
        onOpenChange={(open) => !open && setEditingSessionId(null)}
        schedule={editingSession}
        saving={runningAction === 'edit'}
        onSave={handleSaveMeeting}
      />

      <ShareMeetingDialog
        open={sharingSessionId !== null}
        onOpenChange={(open) => !open && setSharingSessionId(null)}
        meetingLink={
          sharingSession ? scheduleMeetingLink(sharingSession) : undefined
        }
        shareText={
          sharingSession
            ? `Join "${sessionLabel(sharingSession, 0)}" on ${
                schedulePlatformMeta(sharingSession)?.label ?? 'video'
              }: ${scheduleMeetingLink(sharingSession) ?? ''}`
            : ''
        }
        onCopy={handleShareCopy}
      />

      <DeleteMeetingDialog
        open={deletingSessionId !== null}
        onOpenChange={(open) => !open && setDeletingSessionId(null)}
        deleting={runningAction === 'delete'}
        onConfirm={handleDeleteMeeting}
      />

      {/* Platform picker */}
      <PlatformPickerModal
        open={isPlatformPickerOpen}
        onOpenChange={setIsPlatformPickerOpen}
        returnUrl={`/dashboard/events/${event.id}`}
        initialPlatform={pickedPlatform}
      />

      {/* Create-meeting platform picker */}
      <CreateMeetingPlatformPicker
        open={isCreatePickerOpen}
        onOpenChange={setIsCreatePickerOpen}
        platforms={connectedPlatformMetas}
        onPick={createMeetingOnPlatform}
        running={runningAction === 'create'}
      />

      {/* Add-meeting dialog — imported, platform-first layout */}
      <AddMeetingDialog
        open={isAddMeetingDialogOpen}
        onOpenChange={setIsAddMeetingDialogOpen}
        platforms={connectedPlatformMetas}
        saving={runningAction === 'add'}
        onSave={handleAddMeeting}
      />
    </div>
  );
}