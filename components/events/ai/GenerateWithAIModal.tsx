'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useGenerateEventDraftMutation } from '@/lib/store/api/eventsApi';
import type {
  EventType as EventTypeModel,
  GeneratedEventDraft,
  TicketType as TicketTypeModel,
} from '@/lib/types/events';

// ============================================================
// GENERATE WITH AI — MODAL
// ============================================================

type ModalStep = 'prompt' | 'generating' | 'preview' | 'error';

interface GenerateWithAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTypes: EventTypeModel[];
  ticketTypes: TicketTypeModel[];

  /**
   * Called when the user clicks "Edit draft" on the preview. The
   * second argument is the event type the user picked in the modal —
   * the AI does not echo it back, so the parent needs it to complete
   * the payload.
   */
  onEditDraft: (draft: GeneratedEventDraft, eventTypeId: string) => void;

  /**
   * Called when the user clicks "Publish as-is" on the preview. The
   * parent performs the create/publish call and closes the modal on
   * success. Return a rejected promise to keep the modal open with an
   * error.
   */
  onPublishDraft: (
    draft: GeneratedEventDraft,
    eventTypeId: string,
  ) => Promise<void>;
}

// ============================================================
// FORM DEFAULTS
// ============================================================

interface PromptFormState {
  prompt: string;
  eventTypeId: string;
  ticketTypeIds: string[];
  language: string;
  timezone: string;
  currency: string;
  minCapacity: number | null;
  maxCapacity: number | null;
}

const INITIAL_FORM: PromptFormState = {
  prompt: '',
  eventTypeId: '',
  ticketTypeIds: [],
  language: 'en',
  timezone: 'Africa/Nairobi',
  currency: 'KES',
  minCapacity: null,
  maxCapacity: null,
};

const PROMPT_MAX = 500;

// ============================================================
// COMPONENT
// ============================================================

export function GenerateWithAIModal({
  open,
  onOpenChange,
  eventTypes,
  ticketTypes,
  onEditDraft,
  onPublishDraft,
}: GenerateWithAIModalProps) {
  const [step, setStep] = useState<ModalStep>('prompt');
  const [form, setForm] = useState<PromptFormState>(INITIAL_FORM);
  const [draft, setDraft] = useState<GeneratedEventDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [generateDraft, { isLoading: isGenerating }] =
    useGenerateEventDraftMutation();

  // ---- Reset on close ----
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep('prompt');
      setDraft(null);
      setError(null);
      setIsPublishing(false);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  // ---- Field helpers ----
  const update = <K extends keyof PromptFormState>(
    key: K,
    value: PromptFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTicketType = (id: string) => {
    setForm((prev) => {
      const has = prev.ticketTypeIds.includes(id);
      if (has) {
        return {
          ...prev,
          ticketTypeIds: prev.ticketTypeIds.filter((x) => x !== id),
        };
      }
      if (prev.ticketTypeIds.length >= 10) {
        toast.error('You can pick up to 10 ticket types.');
        return prev;
      }
      return { ...prev, ticketTypeIds: [...prev.ticketTypeIds, id] };
    });
  };

  // ---- Validation ----
  const canGenerate = useMemo(() => {
    return (
      form.prompt.trim().length >= 10 &&
      form.prompt.length <= PROMPT_MAX &&
      !!form.eventTypeId &&
      form.ticketTypeIds.length > 0
    );
  }, [form]);

  // ---- Generate ----
  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setStep('generating');
    setError(null);
    setDraft(null);

    try {
      const response = await generateDraft({
        prompt: form.prompt.trim(),
        event_type_id: form.eventTypeId,
        ticket_type_ids: form.ticketTypeIds,
        language: form.language || undefined,
        timezone: form.timezone || undefined,
        currency: form.currency || undefined,
        min_capacity: form.minCapacity ?? undefined,
        max_capacity: form.maxCapacity ?? undefined,
      }).unwrap();

      const { draft: generatedDraft, warnings } = response.data;

      if (warnings?.length) {
        toast.warning(
          `Draft generated with ${warnings.length} correction${
            warnings.length === 1 ? '' : 's'
          }`,
          { description: warnings.slice(0, 3).join(' • ') },
        );
      }

      setDraft(generatedDraft);
      setStep('preview');
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: {
          message?: string;
          errors?: {
            reason?: string;
            validation_errors?: string[];
          };
        };
      };

      const status = apiErr?.status;
      const errorData = apiErr?.data?.errors;

      let message: string;
      if (status === 422 && errorData?.validation_errors?.length) {
        message =
          errorData.reason ?? 'AI output could not be made publishable';
      } else if (status === 503) {
        message = 'AI service is not configured on the server.';
      } else if (status === 502) {
        message = 'The AI provider returned an error. Try again in a moment.';
      } else {
        message =
          apiErr?.data?.message ??
          'Failed to generate a draft. Try again.';
      }

      setError(message);
      setStep('error');
    }
  }, [canGenerate, form, generateDraft]);

  // ---- Preview actions ----
  const handleEditDraft = useCallback(() => {
    if (!draft) return;
    onEditDraft(draft, form.eventTypeId);
    onOpenChange(false);
  }, [draft, form.eventTypeId, onEditDraft, onOpenChange]);

  const handlePublishDraft = useCallback(async () => {
    if (!draft) return;
    setIsPublishing(true);
    try {
      await onPublishDraft(draft, form.eventTypeId);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to publish the AI-generated event.';
      setError(message);
      setStep('error');
    } finally {
      setIsPublishing(false);
    }
  }, [draft, form.eventTypeId, onOpenChange, onPublishDraft]);

  // ---- Retry ----
  const handleRetry = useCallback(() => {
    setError(null);
    setStep('prompt');
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-dark">
            <div className="relative p-1.5 rounded-lg bg-primary/10">
              {step === 'generating' && (
                <span className="absolute inset-0 rounded-lg bg-primary/20 animate-ping opacity-75" />
              )}
              <Wand2 className="h-4 w-4 text-primary relative z-10" />
            </div>
            Generate event with AI
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-medium border-primary/30 text-primary bg-primary/5',
                step === 'generating' && 'animate-pulse',
              )}
            >
              Beta
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-neutral-gray">
            {step === 'prompt' &&
              'Describe your event. The AI drafts the name, description, schedule, venue, and tickets.'}
            {step === 'generating' &&
              'Generating your draft. This usually takes a few seconds.'}
            {step === 'preview' &&
              'Review what the AI produced. Edit details in the wizard or publish directly.'}
            {step === 'error' && 'Something went wrong.'}
          </DialogDescription>
        </DialogHeader>

        {/* ==================================================== */}
        {/* STEP: PROMPT                                          */}
        {/* ==================================================== */}
        {step === 'prompt' && (
          <div className="space-y-5 py-2">
            {/* Prompt */}
            <div className="space-y-1.5">
              <Label htmlFor="ai-prompt-input" className="cursor-pointer text-sm font-medium text-neutral-dark">
                What are you planning? <span className="text-error-500">*</span>
              </Label>
              <Textarea
                id="ai-prompt-input"
                value={form.prompt}
                onChange={(e) => update('prompt', e.target.value)}
                placeholder="A two-day Kubernetes workshop in Nairobi for 60 engineers, hybrid, with a virtual stream and both in-person and remote tickets…"
                className="min-h-[120px] resize-none cursor-text bg-white/60 placeholder:text-gray-400 focus-visible:ring-primary/20 transition-all"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-gray">
                  A sentence or two is plenty.
                </span>
                <span
                  className={cn(
                    'tabular-nums font-mono text-[11px]',
                    form.prompt.length > PROMPT_MAX
                      ? 'text-error-500 font-semibold'
                      : 'text-neutral-gray',
                  )}
                >
                  {form.prompt.length} / {PROMPT_MAX}
                </span>
              </div>
            </div>

            {/* Event type */}
            <div className="space-y-1.5">
              <Label className="cursor-pointer text-sm font-medium text-neutral-dark">
                Event Type <span className="text-error-500">*</span>
              </Label>
              <Select
                value={form.eventTypeId}
                onValueChange={(v) => update('eventTypeId', v)}
              >
                <SelectTrigger className="cursor-pointer bg-white/60">
                  <SelectValue placeholder="Choose event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                      className="cursor-pointer"
                    >
                      {t.display_name || t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticket types */}
            <div className="space-y-1.5">
              <Label className="cursor-pointer text-sm font-medium text-neutral-dark">
                Ticket Types <span className="text-error-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-light bg-neutral-50/50 p-2.5">
                {ticketTypes.length === 0 && (
                  <p className="text-xs text-neutral-gray animate-pulse py-1">
                    Loading ticket types…
                  </p>
                )}
                {ticketTypes.map((tt) => {
                  const selected = form.ticketTypeIds.includes(tt.id);
                  return (
                    <button
                      key={tt.id}
                      type="button"
                      onClick={() => toggleTicketType(tt.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30',
                        selected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-neutral-gray border-neutral-light hover:border-primary/50 hover:bg-primary/5 hover:text-neutral-dark',
                      )}
                    >
                      {selected && <Check className="h-3 w-3 shrink-0" />}
                      <span>{tt.display_name || tt.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-gray">
                Pick the ticket types the AI should use. Up to 10.
              </p>
            </div>

            {/* Advanced options */}
            <details className="group rounded-lg border border-neutral-light overflow-hidden transition-all">
              <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-sm font-medium text-neutral-dark hover:bg-neutral-50 select-none transition-colors">
                <span>Advanced options</span>
                <ChevronDown className="h-4 w-4 text-neutral-gray transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="p-3.5 pt-2 space-y-3 border-t border-neutral-light bg-neutral-50/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-neutral-gray">
                      Language
                    </Label>
                    <Input
                      value={form.language}
                      onChange={(e) => update('language', e.target.value)}
                      placeholder="en"
                      className="cursor-text bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-neutral-gray">
                      Timezone
                    </Label>
                    <Input
                      value={form.timezone}
                      onChange={(e) => update('timezone', e.target.value)}
                      placeholder="Africa/Nairobi"
                      className="cursor-text bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-neutral-gray">
                      Currency
                    </Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value)}
                      placeholder="KES"
                      className="cursor-text bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-neutral-gray">
                      Min capacity
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.minCapacity ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        update(
                          'minCapacity',
                          v === '' ? null : parseInt(v, 10) || null,
                        );
                      }}
                      placeholder="e.g., 10"
                      className="cursor-text bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-neutral-gray">
                      Max capacity
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxCapacity ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        update(
                          'maxCapacity',
                          v === '' ? null : parseInt(v, 10) || null,
                        );
                      }}
                      placeholder="e.g., 500"
                      className="cursor-text bg-white"
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP: GENERATING                                      */}
        {/* ==================================================== */}
        {step === 'generating' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="relative">
              {/* Pulsing ambient outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-dark animate-pulse">
                Generating your event…
              </p>
              <p className="text-xs text-neutral-gray mt-1">
                Drafting the name, schedule, description, and tickets.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP: PREVIEW                                         */}
        {/* ==================================================== */}
        {step === 'preview' && draft && (
          <div className="py-2">
            <DraftPreview draft={draft} currency={form.currency || 'KES'} />
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP: ERROR                                           */}
        {/* ==================================================== */}
        {step === 'error' && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-error-50 border border-error-100 animate-pulse">
              <AlertCircle className="h-7 w-7 text-error-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-dark">
                Generation failed
              </p>
              <p className="text-xs text-neutral-gray mt-1 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* FOOTER                                                */}
        {/* ==================================================== */}
        <DialogFooter className="gap-2 sm:gap-2">
          {step === 'prompt' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className={cn(
                  'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]',
                  isGenerating && 'animate-pulse',
                )}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate draft
              </Button>
            </>
          )}

          {step === 'generating' && (
            <Button disabled className="cursor-wait animate-pulse">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating…
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRetry}
                disabled={isPublishing}
                className="cursor-pointer mr-auto disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleEditDraft}
                disabled={isPublishing}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Edit draft
              </Button>
              <Button
                type="button"
                onClick={handlePublishDraft}
                disabled={isPublishing}
                className={cn(
                  'bg-primary hover:bg-primary-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]',
                  isPublishing && 'animate-pulse cursor-wait',
                )}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish as-is
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'error' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button type="button" onClick={handleRetry} className="cursor-pointer">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// DRAFT PREVIEW
// ============================================================

function DraftPreview({
  draft,
  currency,
}: {
  draft: GeneratedEventDraft;
  currency: string;
}) {
  const schedule = draft.schedules?.[0];

  return (
    <div className="space-y-4">
      {/* Name + short description */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-dark leading-snug">
          {draft.name}
        </h3>
        {draft.short_description && (
          <p className="text-sm text-neutral-gray mt-1 leading-relaxed">
            {draft.short_description}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {schedule?.start_date && (
          <Badge variant="outline" className="text-neutral-gray font-normal">
            {formatDate(schedule.start_date)}
            {schedule.start_time && ` · ${schedule.start_time}`}
            {schedule.end_time && `–${schedule.end_time}`}
          </Badge>
        )}
        {draft.is_virtual ? (
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 font-medium"
          >
            Virtual
          </Badge>
        ) : (
          <Badge variant="outline" className="text-neutral-gray font-normal">
            In-person
          </Badge>
        )}
        {draft.is_hybrid && (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-200 bg-amber-50 font-medium"
          >
            Hybrid
          </Badge>
        )}
        {draft.tags?.slice(0, 4).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-neutral-gray border-neutral-light bg-neutral-light/50 font-normal"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Description */}
      {draft.description && (
        <div className="rounded-lg border border-neutral-light bg-neutral-50/50 p-3">
          <p className="text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-1">
            Description
          </p>
          <p className="text-sm text-neutral-dark whitespace-pre-wrap line-clamp-4 leading-relaxed">
            {draft.description}
          </p>
        </div>
      )}

      {/* Venue */}
      {(draft.venue_name ||
        draft.venue_city ||
        draft.in_person_location) && (
        <div className="rounded-lg border border-neutral-light p-3">
          <p className="text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-1">
            Venue
          </p>
          <p className="text-sm text-neutral-dark">
            {draft.venue_name || draft.in_person_location}
            {draft.venue_city && `, ${draft.venue_city}`}
            {draft.venue_country && `, ${draft.venue_country}`}
          </p>
        </div>
      )}

      {/* Tickets */}
      {draft.tickets && draft.tickets.length > 0 && (
        <div className="rounded-lg border border-neutral-light p-3">
          <p className="text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
            Tickets ({draft.tickets.length})
          </p>
          <div className="space-y-2">
            {draft.tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm border-t border-neutral-light/60 pt-2 first:border-0 first:pt-0"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-neutral-dark truncate">
                    {t.name || `Ticket ${i + 1}`}
                  </p>
                  {t.description && (
                    <p className="text-xs text-neutral-gray truncate">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-neutral-dark tabular-nums">
                    {t.price === 0 ? 'Free' : `${t.price} ${currency}`}
                  </p>
                  <p className="text-xs text-neutral-gray tabular-nums">
                    {t.quantity} available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}