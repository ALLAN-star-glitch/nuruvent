'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  Loader2,
  Save,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  useDeleteEventMutation,
  useGetEventTypesQuery,
  useGetTicketTypesQuery,
  usePublishEventMutation,
  useUpdateEventMutation,
} from '@/lib/store/api/eventsApi';
import type {
  EventType as EventTypeModel,
  GeneratedEventDraft,
} from '@/lib/types/events';

import {
  STEPS,
  defaultFormData,
  mapAIDraftToForm,
} from '@/components/events/new';
import { GenerateWithAIModal } from '@/components/events/ai/GenerateWithAIModal';
import { draftToPublishPayload } from '@/components/events/ai/draftToPublishPayload';

import { useEventFormState } from './new/hooks/useEventFormState';
import { useEventDraft } from './new/hooks/useEventDraft';
import { useEventImage } from './new/hooks/useEventImage';
import { useEventValidation } from './new/hooks/useEventValidation';
import { useAutoSave } from './new/hooks/useAutoSave';
import { useEventSubmit } from './new/hooks/useEventSubmit';
import { useEventHydration } from './new/hooks/useEventHydration';

import { BasicInfoStep } from './new/steps/BasicInfoStep';
import { TicketStep } from './new/steps/TicketStep';
import { DetailsStep } from './new/steps/DetailsStep';
import { ContentStep } from './new/steps/ContentStep';
import { ReviewStep } from './new/steps/ReviewStep';

import { EventPreviewCard } from './new/EventPreviewCard';
import { PreviewModal } from './new/PreviewModal';
import { SaveStatusIndicator } from './new/SaveStatusIndicator';
import { SaveSuccessDialog } from './new/SaveSuccessDialog';
import { Stepper } from './new/Stepper';

// ============================================================
// EDIT EVENT WIZARD
// ============================================================

const TOTAL_STEPS = 5;

interface EditEventWizardProps {
  eventId: string;
}

export function EditEventWizard({ eventId }: EditEventWizardProps) {
  const router = useRouter();

  // ---- Wizard-level state ----
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(eventId);
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIConfirmReplaceOpen, setIsAIConfirmReplaceOpen] = useState(false);
  const [pendingAIDraft, setPendingAIDraft] = useState<{
    draft: GeneratedEventDraft;
    eventTypeId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitInFlightRef = useRef(false);

  // ---- Remote data ----
  const { data: typesResponse } = useGetEventTypesQuery();
  const { data: ticketTypesResponse } = useGetTicketTypesQuery();
  const eventTypes = typesResponse?.data ?? [];
  const ticketTypes = ticketTypesResponse?.data ?? [];

  // ---- Mutations ----
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [publishEvent] = usePublishEventMutation();

  // ---- Hooks ----
  const formState = useEventFormState(defaultFormData);
  const draft = useEventDraft({
    persistence: false,
    initialId: eventId,
  });
  const image = useEventImage(formState.setErrors);
  const validation = useEventValidation(formState.formData);

  const hydration = useEventHydration(
    eventId,
    (mapped) => {
      formState.setFormData(mapped);
    },
    (mapped) => {
      // eslint-disable-next-line react-hooks/immutability
      autoSave.setLastSavedData(mapped);
      autoSave.setSaveStatus('saved');
    },
  );

  const autoSave = useAutoSave({
    formData: formState.formData,
    draft,
    image,
    submitInFlightRef,
    onDraftCreated: setCreatedEventId,
  });

  const submit = useEventSubmit({
    formData: formState.formData,
    draft,
    image,
    validateStep: validation.validateStep,
    isPublishReady: validation.isPublishReady,
    setValidationErrors: formState.setValidationErrors,
    setError,
    onCreated: setCreatedEventId,
    onSuccess: (published) => {
      setIsPublished(published);
      setIsSaveDialogOpen(true);
    },
    onDraftReset: () => {
      // Edit mode: don't reset.
    },
    setLastSavedData: autoSave.setLastSavedData,
    setSaveStatus: autoSave.setSaveStatus,
    submitInFlightRef,
  });

  // ---- Mobile detection ----
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ---- Hydration status ----
  const isLoading = hydration.isLoading;
  const notFound = hydration.notFound;
  const hydrationError = hydration.error;

  // ---- Derived: published status ----
  const event = hydration.event;
  const isPublishedStatus =
    !!event?.published_at || event?.event_status?.slug === 'published';

  const statusLabel =
    event?.event_status?.display_name ||
    event?.event_status?.name ||
    (isPublishedStatus ? 'Published' : 'Draft');

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleFieldChange = formState.handleFieldChange;

  const handleNext = useCallback(() => {
    const errs = validation.validateStep(currentStep);
    formState.setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstField = Object.keys(errs)[0];
      const el = document.getElementById(`field-${firstField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      toast.error('Please fix all errors before proceeding');
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      formState.setValidationErrors({});
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formState, validation]);

  const handlePrev = useCallback(() => {
    formState.setValidationErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [formState]);

  const handleAIDraft = useCallback(
    (draftData: GeneratedEventDraft) => {
      const mapped = mapAIDraftToForm(draftData);

      formState.setFormData((prev) => {
        const next = { ...prev };
        (Object.keys(mapped) as Array<keyof typeof mapped>).forEach((k) => {
          const v = mapped[k];
          if (v !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (next as any)[k] = v;
          }
        });
        return next;
      });

      formState.setValidationErrors({});
      setError(null);
      autoSave.setSaveStatus('saving');
      toast.success('Draft applied. Review the fields below.');
    },
    [autoSave, formState],
  );

  const handleEditAIDraft = useCallback(
    (draftData: GeneratedEventDraft, eventTypeId: string) => {
      setPendingAIDraft({ draft: draftData, eventTypeId });
      setIsAIConfirmReplaceOpen(true);
    },
    [],
  );

  const confirmReplaceWithAIDraft = useCallback(() => {
    if (!pendingAIDraft) return;

    const { draft: draftData, eventTypeId } = pendingAIDraft;
    const mapped = mapAIDraftToForm(draftData);

    formState.setFormData((prev) => {
      const next = { ...prev };
      (Object.keys(mapped) as Array<keyof typeof mapped>).forEach((k) => {
        const v = mapped[k];
        if (v !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (next as any)[k] = v;
        }
      });
      if (eventTypeId) {
        next.event_type_id = eventTypeId;
      }
      return next;
    });

    formState.setValidationErrors({});
    setError(null);
    setCurrentStep(1);
    autoSave.setSaveStatus('saving');

    toast.success('AI draft loaded. Your previous edits have been replaced.');

    setPendingAIDraft(null);
    setIsAIConfirmReplaceOpen(false);
  }, [autoSave, formState, pendingAIDraft]);

  const handlePublishAIDraft = useCallback(
    async (draftData: GeneratedEventDraft, eventTypeId: string) => {
      if (isPublishedStatus) {
        throw new Error('This event is already published.');
      }

      const payload = draftToPublishPayload(draftData, eventTypeId);

      await updateEvent({
        id: eventId,
        data: payload,
      }).unwrap();

      await publishEvent(eventId).unwrap();

      setIsPublished(true);
      setIsSaveDialogOpen(true);
    },
    [eventId, isPublishedStatus, publishEvent, updateEvent],
  );

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      image.handleImageSelect(e);
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          formState.handleFieldChange(
            'imagePreview',
            reader.result as string,
          );
        };
        reader.readAsDataURL(file);
      }
    },
    [formState, image],
  );

  const handleImageRemove = useCallback(() => {
    image.clearImage();
    formState.handleFieldChange('imagePreview', '');
  }, [formState, image]);

  const handleManualSave = useCallback(() => {
    if (autoSave.hasChanges) {
      autoSave.performAutoSave();
    } else {
      toast.info('No changes to save');
    }
  }, [autoSave]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteEvent(eventId).unwrap();
      setIsDeleteDialogOpen(false);
      toast.success('Event deleted');
      router.push('/dashboard/events');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete event.';
      toast.error(message);
    }
  }, [deleteEvent, eventId, router]);

  const handleEventTypeTouched = useCallback(() => {
    formState.setTouched((prev) => ({ ...prev, event_type_id: true }));
  }, [formState]);

  // ============================================================
  // DERIVED
  // ============================================================

  const selectedEventType: EventTypeModel | undefined = eventTypes.find(
    (t) => t.id === formState.formData.event_type_id,
  );

  const isLoadingFlow =
    submit.isSaving || autoSave.isAutoSaving || isDeleting;

  const stepMeta = useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Basic Information',
          description: 'Name, type, schedule, and description.',
        };
      case 2:
        return {
          title: 'Tickets',
          description: 'Ticket options, capacity, and waitlist settings.',
        };
      case 3:
        return {
          title: 'Event Details',
          description: 'Certificate, venue, recurrence, access, and image.',
        };
      case 4:
        return {
          title: 'Content',
          description: 'Speakers, materials, and SEO.',
        };
      case 5:
        return {
          title: 'Review & Publish',
          description: 'Review your event before saving.',
        };
      default:
        return { title: '', description: '' };
    }
  }, [currentStep]);

  // ============================================================
  // LOADING / ERROR STATES
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-neutral-gray">Loading event…</p>
        </div>
      </div>
    );
  }

  if (notFound || hydrationError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-dark mb-2">
            {notFound ? 'Event Not Found' : 'Could not load event'}
          </h2>
          <p className="text-sm text-neutral-gray mb-6">
            {notFound
              ? "The event you're trying to edit doesn't exist or you don't have permission to view it."
              : hydrationError}
          </p>
          <Button
            onClick={() => router.push('/dashboard/events')}
            className="w-full sm:w-auto cursor-pointer"
          >
            Go to Events
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-gray" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-dark truncate">
                Edit Event
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0',
                  isPublishedStatus
                    ? 'text-tertiary-600 border-tertiary-200 bg-tertiary-50'
                    : 'text-neutral-gray border-neutral-light bg-neutral-light',
                )}
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-neutral-gray mt-1 line-clamp-1 sm:line-clamp-none">
              Edit your event details. Changes are saved automatically.
            </p>
          </div>
        </div>

        {/* Action button bar with responsive wrapping */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 mb-1 sm:mb-0">
            <SaveStatusIndicator status={autoSave.saveStatus} />
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewModalOpen(true)}
                className="cursor-pointer text-xs h-9 px-3"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {!isPublishedStatus && (
              <Button
                onClick={() => setIsAIModalOpen(true)}
                className={cn(
                  'relative group overflow-hidden cursor-pointer border border-primary-300/40 text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4',
                  'bg-gradient-to-r from-primary-700 via-primary-500 to-primary-400 hover:from-primary-600 hover:via-primary-400 hover:to-primary-300 ring-2 ring-primary-400/30',
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"
                />
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-primary-100 animate-pulse transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                <span className="font-semibold tracking-wide truncate">
                  Edit with AI
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleManualSave}
              disabled={isLoadingFlow || !autoSave.hasChanges}
              className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 shrink-0" />
              Save
            </Button>

            {!isPublishedStatus && (
              <Button
                className="col-span-2 sm:col-span-1 bg-primary hover:bg-primary-600 text-white cursor-pointer disabled:opacity-50 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                onClick={() => submit.submit('published')}
                disabled={!validation.isPublishReady || isLoadingFlow}
                title={
                  !validation.isPublishReady
                    ? 'Complete all required fields in every step'
                    : undefined
                }
              >
                {isLoadingFlow ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 animate-spin shrink-0" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 shrink-0" />
                    Publish
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoadingFlow}
              className="col-span-2 sm:col-span-1 cursor-pointer text-error-500 hover:text-error-600 hover:bg-error-50 border-error-200 h-9 sm:h-10 px-3"
              aria-label="Delete event"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
              <span className="sm:hidden text-xs">Delete Event</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Responsive horizontal Stepper container */}
      <div className="py-2 sm:py-4 overflow-x-auto no-scrollbar">
        <Stepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* ---- Two-column layout: content + sidebar preview ---- */}
      <div
        className={cn(
          'grid gap-6 mt-2 sm:mt-4',
          !isMobile && currentStep < TOTAL_STEPS
            ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)]'
            : 'grid-cols-1',
        )}
      >
        {/* Left column: step content + nav */}
        <div className="min-w-0">
          {currentStep < TOTAL_STEPS ? (
            <Card className="border border-neutral-light">
              <CardHeader className="px-4 py-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-neutral-dark">
                  {stepMeta.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-neutral-gray">
                  {stepMeta.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
                {currentStep === 1 && (
                  <BasicInfoStep
                    formData={formState.formData}
                    validationErrors={formState.validationErrors}
                    eventTypes={eventTypes}
                    onFieldChange={handleFieldChange}
                    onAIDraft={handleAIDraft}
                    onEventTypeTouched={handleEventTypeTouched}
                  />
                )}
                {currentStep === 2 && (
                  <TicketStep
                    formData={formState.formData}
                    validationErrors={formState.validationErrors}
                    onFieldChange={handleFieldChange}
                  />
                )}
                {currentStep === 3 && (
                  <DetailsStep
                    formData={formState.formData}
                    validationErrors={formState.validationErrors}
                    errors={formState.errors}
                    imagePreview={image.imagePreview}
                    onFieldChange={handleFieldChange}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                  />
                )}
                {currentStep === 4 && (
                  <ContentStep
                    formData={formState.formData}
                    validationErrors={formState.validationErrors}
                    onFieldChange={handleFieldChange}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <ReviewStep
              formData={formState.formData}
              selectedEventType={selectedEventType}
            />
          )}

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {Object.keys(formState.validationErrors).length > 0 ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-error-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Please fix {Object.keys(formState.validationErrors).length}{' '}
                  error(s) before proceeding
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-tertiary-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {autoSave.hasChanges
                    ? 'Unsaved changes'
                    : 'All changes saved'}
                </span>
              </div>
            )}
          </div>

          {/* Bottom nav buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="w-full sm:w-auto cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white cursor-pointer"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => submit.submit('draft')}
                  disabled={isLoadingFlow}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                {!isPublishedStatus && (
                  <Button
                    className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white cursor-pointer disabled:opacity-50"
                    onClick={() => submit.submit('published')}
                    disabled={!validation.isPublishReady || isLoadingFlow}
                  >
                    {isLoadingFlow ? (
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
              </div>
            )}
          </div>
        </div>

        {/* Right column: live preview (hidden on mobile and step 5) */}
        {!isMobile && currentStep < TOTAL_STEPS && (
          <div className="sticky top-24 h-fit space-y-4">
            <Card className="border border-neutral-light">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-dark">
                  Live Preview
                </CardTitle>
                <CardDescription className="text-neutral-gray">
                  Real-time preview of your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventPreviewCard
                  data={formState.formData}
                  eventType={selectedEventType}
                />
              </CardContent>
            </Card>

            <Card
              className={cn(
                'border',
                validation.isPublishReady
                  ? 'border-tertiary-200 bg-tertiary-50'
                  : 'border-neutral-light',
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {validation.isPublishReady ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
                      <span className="text-tertiary-700">
                        {isPublishedStatus
                          ? 'Event is published'
                          : 'Ready to publish'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">
                        Complete all required fields to publish
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}
      <PreviewModal
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        formData={formState.formData}
        selectedEventType={selectedEventType}
      />

      <SaveSuccessDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        isPublished={isPublished}
        createdEventId={createdEventId}
        formData={formState.formData}
        selectedEventType={selectedEventType}
        onGoToEvents={() => {
          setIsSaveDialogOpen(false);
          router.push('/dashboard/events');
        }}
        onViewEvent={() => {
          setIsSaveDialogOpen(false);
          if (createdEventId) {
            router.push(`/dashboard/events/${createdEventId}`);
          }
        }}
        onDismiss={() => setIsSaveDialogOpen(false)}
      />

      {/* AI modal */}
      <GenerateWithAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        eventTypes={eventTypes}
        ticketTypes={ticketTypes}
        onEditDraft={handleEditAIDraft}
        onPublishDraft={handlePublishAIDraft}
      />

      {/* AI draft replace confirmation */}
      <Dialog
        open={isAIConfirmReplaceOpen}
        onOpenChange={setIsAIConfirmReplaceOpen}
      >
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-dark text-base sm:text-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              Replace current form data?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-neutral-gray">
              The AI-generated draft will overwrite everything currently in
              the form. Any edits you&apos;ve made will be lost. Do you want
              to continue?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAIConfirmReplaceOpen(false);
                setPendingAIDraft(null);
              }}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReplaceWithAIDraft}
              className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white cursor-pointer"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Replace form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error-600 text-base sm:text-lg">
              <Trash2 className="h-5 w-5 shrink-0" />
              Delete Event
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-neutral-gray">
              Are you sure you want to delete this event? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {event && (
            <div className="py-2 sm:py-4">
              <div className="flex items-center gap-3 p-3 bg-error-50 rounded-lg border border-error-100">
                <div className="p-2 bg-error-100 rounded-full shrink-0">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-dark text-sm truncate">
                    {event.name}
                  </p>
                  {formState.formData.schedules[0]?.start_date && (
                    <p className="text-xs sm:text-sm text-neutral-gray">
                      {formState.formData.schedules[0].start_date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}