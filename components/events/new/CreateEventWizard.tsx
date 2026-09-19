// components/events/new/CreateEventWizard.tsx

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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  useCreateEventMutation,
  useGetEventTypesQuery,
  useGetTicketTypesQuery,
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

import { useEventFormState } from './hooks/useEventFormState';
import { useEventDraft } from './hooks/useEventDraft';
import { useEventImage } from './hooks/useEventImage';
import { useEventValidation } from './hooks/useEventValidation';
import { useAutoSave } from './hooks/useAutoSave';
import { useEventSubmit } from './hooks/useEventSubmit';

import { BasicInfoStep } from './steps/BasicInfoStep';
import { TicketStep } from './steps/TicketStep';
import { DetailsStep } from './steps/DetailsStep';
import { ContentStep } from './steps/ContentStep';
import { ReviewStep } from './steps/ReviewStep';

import { EventPreviewCard } from './EventPreviewCard';
import { PreviewModal } from './PreviewModal';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { SaveSuccessDialog } from './SaveSuccessDialog';
import { Stepper } from './Stepper';

// ============================================================
// CREATE EVENT WIZARD
// ============================================================

const TOTAL_STEPS = 5;

const AI_DRAFT_STORAGE_KEY = 'nuruvent_ai_draft';

export function CreateEventWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInFlightRef = useRef(false);

  const { data: typesResponse } = useGetEventTypesQuery();
  const { data: ticketTypesResponse } = useGetTicketTypesQuery();
  const eventTypes = typesResponse?.data ?? [];
  const ticketTypes = ticketTypesResponse?.data ?? [];

  const [createEvent] = useCreateEventMutation();

  const formState = useEventFormState(defaultFormData);
  const draft = useEventDraft();
  const image = useEventImage(formState.setErrors);
  const validation = useEventValidation(formState.formData);

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
    onDraftReset: handleDraftReset,
    setLastSavedData: autoSave.setLastSavedData,
    setSaveStatus: autoSave.setSaveStatus,
    submitInFlightRef,
  });

  function handleDraftReset() {
    draft.clearDraftId();
    formState.reset(defaultFormData);
    image.clearImage();
    autoSave.setLastSavedData(null);
    autoSave.setSaveStatus('idle');
    setCreatedEventId(null);
    setCurrentStep(1);
    setError(null);
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const savedId = draft.draftId;
    const first = formState.formData.schedules?.[0];
    const hasAnyData =
      formState.formData.name ||
      formState.formData.event_type_id ||
      first?.start_date;
    if (savedId && !hasAnyData) {
      draft.clearDraftId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      toast.success('AI draft loaded into the form. Review and edit as needed.');
    },
    [autoSave, formState],
  );

  const handlePublishAIDraft = useCallback(
    async (draftData: GeneratedEventDraft, eventTypeId: string) => {
      const payload = draftToPublishPayload(draftData, eventTypeId);
      const response = await createEvent(payload).unwrap();

      setCreatedEventId(response.data.id);
      setIsPublished(true);
      setIsSaveDialogOpen(true);
    },
    [createEvent],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'ai') return;

    const eventTypeId = params.get('event_type_id') ?? '';

    window.history.replaceState({}, '', '/dashboard/events/new');

    const raw = sessionStorage.getItem(AI_DRAFT_STORAGE_KEY);
    if (!raw) return;

    try {
      const draftData = JSON.parse(raw) as GeneratedEventDraft;
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleEditAIDraft(draftData, eventTypeId);
    } catch (err) {
      console.error('Failed to load AI draft from sessionStorage:', err);
      sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    }
  }, [autoSave]);

  const handleCreateAnother = useCallback(() => {
    handleDraftReset();
    setIsSaveDialogOpen(false);
    setTimeout(() => router.push('/dashboard/events/new'), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleEventTypeTouched = useCallback(() => {
    formState.setTouched((prev) => ({ ...prev, event_type_id: true }));
  }, [formState]);

  const selectedEventType: EventTypeModel | undefined = eventTypes.find(
    (t) => t.id === formState.formData.event_type_id,
  );

  const isLoadingFlow = submit.isSaving || autoSave.isAutoSaving;

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
          description:
            'Certificate, venue, recurrence, access, and image.',
        };
      case 4:
        return {
          title: 'Content',
          description: 'Speakers, materials, and SEO.',
        };
      case 5:
        return {
          title: 'Review & Publish',
          description: 'Review your event before publishing.',
        };
      default:
        return { title: '', description: '' };
    }
  }, [currentStep]);

  return (
    <div className="w-full px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Create Event
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
              Create a new training event, workshop, or webinar.
            </p>
          </div>
        </div>

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
                Create with AI
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={handleManualSave}
              disabled={isLoadingFlow || !autoSave.hasChanges}
              className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 shrink-0" />
              Save
            </Button>

            <Button
              className="col-span-2 sm:col-span-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
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
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-primary-foreground shrink-0" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="py-2 sm:py-4 overflow-x-auto no-scrollbar">
        <Stepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Two-column layout */}
      <div
        className={cn(
          'grid gap-6 mt-2 sm:mt-4',
          !isMobile && currentStep < TOTAL_STEPS
            ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)]'
            : 'grid-cols-1',
        )}
      >
        <div className="min-w-0">
          {currentStep < TOTAL_STEPS ? (
            <Card className="border border-border">
              <CardHeader className="px-4 py-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-foreground">
                  {stepMeta.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
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

          <div className="flex items-center gap-2 mt-4">
            {Object.keys(formState.validationErrors).length > 0 ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Please fix {Object.keys(formState.validationErrors).length}{' '}
                  error(s) before proceeding
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-tertiary-600 dark:text-tertiary-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>All fields are valid</span>
              </div>
            )}
          </div>

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
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
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
                <Button
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50"
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
                      <Send className="h-4 w-4 mr-2 text-primary-foreground" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right column — live preview */}
        {!isMobile && currentStep < TOTAL_STEPS && (
          <div className="sticky top-24 h-fit space-y-4">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Live Preview
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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
                  ? 'border-tertiary-200 dark:border-tertiary-900/50 bg-tertiary-50 dark:bg-tertiary-950/30'
                  : 'border-border',
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {validation.isPublishReady ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
                      <span className="text-tertiary-700 dark:text-tertiary-300">
                        Ready to publish
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700 dark:text-amber-300">
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

      {/* Modals */}
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
          handleDraftReset();
          setIsSaveDialogOpen(false);
          router.push('/dashboard/events');
        }}
        onViewEvent={() => {
          setIsSaveDialogOpen(false);
          if (createdEventId) {
            router.push(`/dashboard/events/${createdEventId}`);
          }
        }}
        onDismiss={handleCreateAnother}
      />

      <GenerateWithAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        eventTypes={eventTypes}
        ticketTypes={ticketTypes}
        onEditDraft={handleEditAIDraft}
        onPublishDraft={handlePublishAIDraft}
      />
    </div>
  );
}