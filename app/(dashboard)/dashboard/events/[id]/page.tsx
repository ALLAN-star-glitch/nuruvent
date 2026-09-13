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
  Send,
  Star,
  Trash2,
  User,
  Building2,
  BadgeCheck,
  XCircle,
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
} from '@/lib/store/api/eventsApi';
import type { Event } from '@/lib/types/events';
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

// ============================================================
// HELPERS
// ============================================================

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
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      dot: 'bg-gray-400',
      label: 'Draft',
    },
    Published: {
      color: 'text-green-600 bg-green-50 border-green-200',
      dot: 'bg-green-500',
      label: 'Published',
    },
    Cancelled: {
      color: 'text-red-600 bg-red-50 border-red-200',
      dot: 'bg-red-500',
      label: 'Cancelled',
    },
    Completed: {
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Completed',
    },
  };
  return map[statusName] ?? map.Draft;
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

  // Next 15 wraps dynamic params in a Promise; unwrap it.
  // (Kept outside a hook because this component runs on the client.)
  const [eventId, setEventId] = useState<string>('');

  // Await the params once.
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
  const [copied, setCopied] = useState(false);
  const [publishError, setPublishError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] = useState(false);

  const { data: response, isLoading, error, refetch } = useGetEventByIdQuery(
    eventId,
    { skip: !eventId },
  );
  const [publishEvent] = usePublishEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const event: Event | undefined = response?.data;

  const statusName = event ? getEventStatusName(event) : 'Draft';
  const statusConfig = getStatusConfig(statusName);
  const isDraft = event ? isEventDraft(event) : false;
  const isPublished = event ? isEventPublished(event) : false;

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

  const handleCopyLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/events/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Event link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  // ---- Loading / error ----

  if (isLoading || !eventId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
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

  // ---- Derived values ----

  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);
  const startDate = event.start_date ?? event.schedules?.[0]?.start_date;
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const location = getEventLocation(event);
  const price = getEventMinPrice(event);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-gray" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-neutral-900">
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
                  className="text-amber-600 border-amber-200 bg-amber-50"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Event ID: {event.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button
              variant="outline"
              className="cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {isDraft && (
            <Button
              className="bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors"
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
                className="cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
              >
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
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-neutral-100 shadow-sm">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.display_name || event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-neutral-100">
                <CalendarDays className="h-16 w-16 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary-500" />
                  About This Event
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
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
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {formatDate(startDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Clock className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {startTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
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
                    <p className="text-neutral-500">Duration</p>
                    <p className="font-medium text-neutral-900">{duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-500">Price</p>
                  <p className="font-medium text-primary-600">
                    {formatPrice(price)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Certificate</p>
                  <p className="font-medium text-neutral-900">
                    {event.certificate_enabled && (event.certificate_price ?? 0) > 0
                      ? formatPrice(event.certificate_price ?? 0)
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Capacity</p>
                  <p className="font-medium text-neutral-900">
                    {event.capacity > 0 ? event.capacity : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Current Attendees</p>
                  <p className="font-medium text-neutral-900">
                    {event.current_attendees ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Format</p>
                  <p className="font-medium text-neutral-900">
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
                  <p className="text-neutral-500">Created</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Last Updated</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(event.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {event.zoom_link && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-neutral-500 text-sm">Zoom Link</p>
                    <a
                      href={event.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium truncate block"
                    >
                      {event.zoom_link}
                    </a>
                  </div>
                </>
              )}

              {event.meet_link && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-neutral-500 text-sm">Google Meet Link</p>
                    <a
                      href={event.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium truncate block"
                    >
                      {event.meet_link}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Host card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Event Host
              </h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  {hostIsInstitution ? (
                    <Building2 className="h-5 w-5 text-primary-500" />
                  ) : (
                    <User className="h-5 w-5 text-primary-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 flex items-center gap-1.5">
                    {hostName}
                    {hostIsInstitution && (
                      <BadgeCheck className="h-4 w-4 text-primary-500" />
                    )}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {hostIsInstitution ? 'Institution Account' : 'Individual Account'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Quick Actions
              </h3>

              <Link href={`/dashboard/events/${event.id}/edit`}>
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </Link>

              {isDraft && (
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors"
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
                <Link href={`/events/${event.slug}`} target="_blank">
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
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
              <h3 className="text-sm font-semibold text-neutral-900">
                Event Stats
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <Badge variant="outline" className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Attendees</span>
                <span className="font-medium text-neutral-900">
                  {event.current_attendees ?? 0} /{' '}
                  {event.capacity > 0 ? event.capacity : '∞'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Format</span>
                <span className="font-medium text-neutral-900">
                  {event.is_virtual
                    ? 'Virtual'
                    : event.is_hybrid
                      ? 'Hybrid'
                      : 'In-Person'}
                </span>
              </div>

              {event.is_featured && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Featured</span>
                  <Badge className="bg-secondary-500 text-white border-0 text-xs">
                    Yes
                  </Badge>
                </div>
              )}

              {event.is_private && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Private</span>
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-200 bg-amber-50 text-xs"
                  >
                    Yes
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardContent className="p-6">
              <Button
                variant="outline"
                className="w-full cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Event Link
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Move to trash dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Trash2 className="h-5 w-5" />
              Move to Trash
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to move this event to trash? You can restore
              it later from the trash section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="p-2 bg-amber-100 rounded-full">
                <Trash2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {event.display_name || event.name}
                </p>
                <p className="text-sm text-gray-500">
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
              className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
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
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Cannot Publish Event
            </DialogTitle>
            <DialogDescription className="text-red-600">
              {publishError?.message || 'Failed to publish event'}
            </DialogDescription>
          </DialogHeader>

          {publishError?.details && publishError.details.length > 0 && (
            <div className="py-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Please fix the following issues:
              </p>
              <ul className="space-y-2">
                {publishError.details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
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
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={() => {
                setIsPublishErrorDialogOpen(false);
                router.push(`/dashboard/events/${event.id}/edit`);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}