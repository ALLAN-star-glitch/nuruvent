/* eslint-disable react-hooks/set-state-in-render */
// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
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
  DollarSign,
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
  platformMeetingCode,
  schedulePlatform,
} from '@/lib/utils/meetingUrl';

import {
  PlatformPickerModal,
  PLATFORMS,
  type PlatformMeta,
} from '@/components/events/video/PlatformPickerModal';
import { MeetingCard } from '@/components/events/video/MeetingCard';
import { MeetingCardReadOnly } from '@/components/events/video/MeetingCardReadOnly';
import { useVideoConnection } from '@/components/events/video/useVideoConnection';
import { AddMeetingDialog } from '@/components/events/video/AddMeetingDialog';

import {
  EditMeetingDialog,
  type EditMeetingFormValues,
} from '@/components/meeting/EditMeetingDialog';
import { DeleteMeetingDialog } from '@/components/meeting/DeleteMeetingDialog';

import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';
import { AttendanceCard } from '@/components/events/attendance/AttendanceCard';
import {
  useGetEventAttendanceSummaryQuery,
  useLazyExportSessionAttendanceQuery,
} from '@/lib/store/api/attendanceApi';
import { useFetchAttendanceMutation } from '@/lib/store/api/videoApi';
import { CreateMeetingPlatformPicker } from '@/components/events/video/CreateMeetingPlatformPicker';
import { EventDetailSkeleton } from '@/components/registrations/skeleton-loaders';

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

function schedulePlatformMeta(s: Schedule): PlatformMeta | undefined {
  const p = schedulePlatform(s);
  if (!p) return undefined;
  return PLATFORMS.find((m) => m.platform === p);
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
// PAGE
// ============================================================

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const routeParams = useParams<{ accountId: string; teamId: string }>();
  const accountId = routeParams.accountId;
  const teamId = routeParams.teamId;

  const user = useAppSelector(selectUser);

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
  const [publishError, setPublishError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] =
    useState(false);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [runningSessionId, setRunningSessionId] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<
    'create' | 'edit' | 'regenerate' | 'delete' | 'add' | null
  >(null);

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

  const {
    data: attendanceResponse,
    isLoading: isAttendanceLoading,
    error: attendanceError,
  } = useGetEventAttendanceSummaryQuery(eventId, { skip: !eventId });

  const attendanceSummary = attendanceResponse?.data ?? null;

  const [fetchAttendance] = useFetchAttendanceMutation();
  const [triggerExport] = useLazyExportSessionAttendanceQuery();

  const [fetchingSessionIds, setFetchingSessionIds] = useState<string[]>([]);

  const attendanceErrorMessage = (() => {
    if (!attendanceError) return null;
    const msg = (attendanceError as { data?: { message?: string } })?.data
      ?.message;
    return msg ?? 'Failed to load attendance';
  })();

  const handleFetchAttendance = async (
    videoMeetingId: string,
    sessionId: string,
  ) => {
    if (!event) return;
    setFetchingSessionIds((ids) => [...ids, sessionId]);
    const t = toast.loading('Fetching attendance from Google Meet…');
    try {
      await fetchAttendance({
        meetingId: videoMeetingId,
        sessionId,
        eventId: event.id,
      }).unwrap();
      toast.dismiss(t);
      toast.success('Attendance fetched');
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to fetch attendance';
      toast.error(msg);
    } finally {
      setFetchingSessionIds((ids) => ids.filter((id) => id !== sessionId));
    }
  };

  const handleExportAll = async () => {
    if (!attendanceSummary) return;
    const sessionsWithData = attendanceSummary.sessions.filter(
      (s) => s.has_attendance_data,
    );
    if (sessionsWithData.length === 0) {
      toast.info('Nothing to export yet');
      return;
    }

    const t = toast.loading('Preparing CSV…');
    try {
      for (const s of sessionsWithData) {
        const blob = await triggerExport(s.session_id).unwrap();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${(s.title || s.session_id).replace(/\s+/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      toast.dismiss(t);
      toast.success(
        sessionsWithData.length === 1
          ? 'CSV downloaded'
          : `${sessionsWithData.length} CSVs downloaded`,
      );
    } catch {
      toast.dismiss(t);
      toast.error('Failed to export attendance');
    }
  };

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

  const isHost = !!user?.id && event?.creator?.id === user.id;

  const hasZoomConnection = !!video.getConnection('zoom');
  const hasMeetConnection = !!video.getConnection('google_meet');
  const hasAnyConnection = hasZoomConnection || hasMeetConnection;

  const connectedPlatformMetas: PlatformMeta[] = PLATFORMS.filter(
    (p) => p.available && !!video.getConnection(p.platform),
  );

  const editingSession = event?.schedules?.find(
    (s) => s.id === editingSessionId,
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
      router.push(`/dashboard/${accountId}/${teamId}/events`);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to move event to trash';
      toast.error(message);
      setIsDeleting(false);
    }
  };

  const handleJoinLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleEditSession = (sessionId: string) => {
    setEditingSessionId(sessionId);
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
    const t = toast.loading('Updating session…');

    try {
      const wasVirtual = editingSession.is_virtual;
      const wasPlatform = editingSession.platform as VideoPlatform | undefined;
      const wasMeetingId = editingSession.video_meeting_id;

      const willBeVirtual = values.is_virtual;
      const willPlatform = values.platform;

      const platformChanged =
        wasVirtual && willBeVirtual &&
        wasPlatform !== undefined && willPlatform !== undefined &&
        wasPlatform !== willPlatform;

      const goingVirtual = willBeVirtual && !wasVirtual;
      const goingInPerson = !willBeVirtual && wasVirtual;

      const shouldDeleteMeeting =
        wasMeetingId !== undefined && (platformChanged || goingInPerson);
      const shouldCreateMeeting =
        willPlatform !== undefined && (goingVirtual || platformChanged);

      const clearingMeeting = platformChanged || goingInPerson;

      const schedules = (event.schedules ?? []).map((s) => {
        if (s.id !== editingSession.id) {
          return {
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
          };
        }

        return {
          id: s.id,
          session_name: values.session_name,
          session_number: s.session_number,
          start_date: values.start_date,
          end_date: values.end_date ?? s.end_date,
          start_time: values.start_time + ':00',
          end_time: values.end_time + ':00',
          timezone: values.timezone,
          location: willBeVirtual ? s.location : values.location,
          is_virtual: willBeVirtual,
          platform: willBeVirtual ? willPlatform ?? s.platform : undefined,
          zoom_link: clearingMeeting ? '' : s.zoom_link,
          meet_link: clearingMeeting ? '' : s.meet_link,
          max_attendees: s.max_attendees,
        };
      });

      if (shouldDeleteMeeting) {
        try {
          await deleteEventMeeting(event.id).unwrap();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('Failed to delete existing meeting:', err);
        }
      }

      await updateEvent({
        id: event.id,
        data: { schedules },
      }).unwrap();

      if (shouldCreateMeeting && willPlatform) {
        await createEventMeeting({
          eventId: event.id,
          platform: willPlatform,
        }).unwrap();
      }

      toast.dismiss(t);
      toast.success('Session updated');
      setEditingSessionId(null);
      refetch();
    } catch (err: unknown) {
      toast.dismiss(t);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update session';
      toast.error(msg);
    } finally {
      setRunningSessionId(null);
      setRunningAction(null);
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

  const handleStartMeeting = (session: Schedule) => {
    if (!event) return;

    const platform = schedulePlatform(session);
    if (!platform) {
      toast.error('This session has no meeting yet.');
      return;
    }

    const code = platformMeetingCode(session, platform);
    if (!code) {
      toast.error('This session has no meeting yet.');
      return;
    }

    const label = event.display_name || event.name;
    const hostName = getEventHostName(event);

    const urlParams = new URLSearchParams({
      name: label,
      host: hostName,
      return: `/dashboard/${accountId}/${teamId}/events/${event.id}`,
      platform,
    });

    router.push(`/meeting/${code}?${urlParams.toString()}`);
  };

  if (isLoading || !eventId) {
    return <EventDetailSkeleton />;
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
            onClick={() =>
              router.push(`/dashboard/${accountId}/${teamId}/events`)
            }
            className="cursor-pointer px-5 py-2.5"
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

  const organizerLogo = event.organizer?.avatar_url;
  const organizerName =
    event.organizer?.display_name || event.organizer?.name || hostName;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/${accountId}/${teamId}/events`}
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>

          {/* Organizer logo */}
          {organizerLogo ? (
            <div className="relative h-11 w-11 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
              <Image
                src={organizerLogo}
                alt={organizerName}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full border border-border bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
              {hostIsInstitution ? (
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              ) : (
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              )}
            </div>
          )}

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
              {organizerName} · Event ID: {event.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {isHost && (
            <Link
              href={`/dashboard/${accountId}/${teamId}/events/${event.id}/edit`}
            >
              <Button
                variant="outline"
                className="cursor-pointer px-5 py-2.5 h-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}

          {isHost && isDraft && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors px-5 py-2.5 h-auto"
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
              <Button
                variant="outline"
                className="cursor-pointer px-5 py-2.5 h-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </Link>
          )}

          {isHost && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer px-5 py-2.5 h-auto"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-muted">
                <CalendarDays className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Meeting card */}
          {(event.is_virtual || event.is_hybrid) &&
            (isHost ? (
              <MeetingCard
                event={event}
                isDraft={isDraft}
                currentUserId={user?.id}
                hasZoomConnection={hasZoomConnection}
                hasMeetConnection={hasMeetConnection}
                hasAnyConnection={hasAnyConnection}
                connectedPlatforms={connectedPlatformMetas}
                runningSessionId={runningSessionId}
                runningAction={runningAction}
                onCreateMeetings={handleCreateMeetings}
                onOpenPlatformPicker={openPlatformPicker}
                onAddMeeting={() => setIsAddMeetingDialogOpen(true)}
                onJoinLink={handleJoinLink}
                onEditSession={handleEditSession}
                onRegenerateSession={handleRegenerateSession}
                onDeleteSession={handleDeleteSession}
                onStartMeeting={handleStartMeeting}
                onRegenerateAll={handleRegenerateAll}
                onDeleteAll={handleDeleteAll}
                editEventHref={`/dashboard/${accountId}/${teamId}/events/${event.id}/edit`}
              />
            ) : (
              <MeetingCardReadOnly
                event={event}
                ticketsHref={`/dashboard/${accountId}/${teamId}/tickets`}
              />
            ))}

          {/* Attendance — host only */}
          {isHost && (
            <AttendanceCard
              eventId={event.id}
              summary={attendanceSummary}
              loading={isAttendanceLoading}
              error={attendanceErrorMessage}
              fetchingSessionIds={fetchingSessionIds}
              onFetchAttendance={handleFetchAttendance}
              onExportAll={handleExportAll}
            />
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
                {organizerLogo ? (
                  <div className="relative h-11 w-11 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                    <Image
                      src={organizerLogo}
                      alt={organizerName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-primary/10 rounded-full shrink-0">
                    {hostIsInstitution ? (
                      <Building2 className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                )}
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

              {isPublished && (
                <Link
                  href={`/events/${event.slug}`}
                  target="_blank"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer px-4 py-2.5 h-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Register Event
                  </Button>
                </Link>
              )}

              {isHost && (
                <>
                  <Link
                    href={`/dashboard/${accountId}/${teamId}/events/${event.id}/edit`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start cursor-pointer px-4 py-2.5 h-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                  </Link>

                  <Link
                    href={`/dashboard/${accountId}/${teamId}/events/${event.id}/payments`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start cursor-pointer px-4 py-2.5 h-auto"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Payments
                    </Button>
                  </Link>

                  {event.is_virtual && (
                    <Button
                      className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-4 py-2.5 h-auto"
                      onClick={openPlatformPicker}
                    >
                      <Plug className="h-4 w-4 mr-2" />
                      Manage Connection
                    </Button>
                  )}

                  {isDraft && (
                    <Button
                      className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors px-4 py-2.5 h-auto"
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

                  <Button
                    variant="destructive"
                    className="w-full justify-start cursor-pointer px-4 py-2.5 h-auto"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Moving to trash...' : 'Move to Trash'}
                  </Button>
                </>
              )}
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
              className="cursor-pointer w-full sm:w-auto px-5 py-2.5 h-auto"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer w-full sm:w-auto text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-5 py-2.5 h-auto"
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
              className="w-full sm:w-auto cursor-pointer px-5 py-2.5 h-auto"
            >
              Close
            </Button>

            {publishErrorIsConnectionIssue ? (
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-5 py-2.5 h-auto"
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
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-5 py-2.5 h-auto"
                onClick={() => {
                  setIsPublishErrorDialogOpen(false);
                  router.push(
                    `/dashboard/${accountId}/${teamId}/events/${event.id}/edit`,
                  );
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
        platforms={connectedPlatformMetas}
        onSave={handleSaveMeeting}
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
        returnUrl={`/dashboard/${accountId}/${teamId}/events/${event.id}`}
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