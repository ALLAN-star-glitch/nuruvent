'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useGenerateEventDraftMutation } from '@/lib/store/api/eventsApi';
import type {
  EventType as EventTypeModel,
  GeneratedEventDraft,
  RecurrenceInput,
  TicketType as TicketTypeModel,
} from '@/lib/types/events';

// ============================================================
// TYPES
// ============================================================

type ModalStep = 'prompt' | 'generating' | 'preview' | 'error';

interface GenerateWithAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTypes: EventTypeModel[];
  ticketTypes: TicketTypeModel[];
  onEditDraft: (draft: GeneratedEventDraft, eventTypeId: string) => void;
  onPublishDraft: (
    draft: GeneratedEventDraft,
    eventTypeId: string,
  ) => Promise<void>;
}

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

interface RecurrenceFormState {
  enabled: boolean;
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number | null;
  daysOfWeek: string[];
  dayOfMonth: number | null;
  weekOfMonth: string;
  endsOn: string;
  occurrences: number | null;
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

const INITIAL_RECURRENCE: RecurrenceFormState = {
  enabled: false,
  pattern: 'weekly',
  interval: 1,
  daysOfWeek: [],
  dayOfMonth: null,
  weekOfMonth: '',
  endsOn: '',
  occurrences: null,
};

const WEEKDAYS: { value: string; label: string }[] = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

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
  const [recurrence, setRecurrence] =
    useState<RecurrenceFormState>(INITIAL_RECURRENCE);
  const [draft, setDraft] = useState<GeneratedEventDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [generateDraft, { isLoading: isGenerating }] =
    useGenerateEventDraftMutation();

  // Reset on close
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

  const update = <K extends keyof PromptFormState>(
    key: K,
    value: PromptFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRec = <K extends keyof RecurrenceFormState>(
    key: K,
    value: RecurrenceFormState[K],
  ) => {
    setRecurrence((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWeekday = (day: string) => {
    setRecurrence((prev) => {
      const has = prev.daysOfWeek.includes(day);
      return {
        ...prev,
        daysOfWeek: has
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day],
      };
    });
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

  // ---- Recurrence validation (block submit until complete) ----

  const recurrenceValid = useMemo(() => {
    if (!recurrence.enabled) return true;

    if (recurrence.pattern === 'weekly' || recurrence.pattern === 'custom') {
      if (recurrence.daysOfWeek.length === 0) return false;
    }
    if (recurrence.pattern === 'monthly') {
      if (recurrence.dayOfMonth == null && !recurrence.weekOfMonth) return false;
    }
    if (!recurrence.endsOn && !recurrence.occurrences) return false;

    return true;
  }, [recurrence]);

  const canGenerate = useMemo(() => {
    return (
      form.prompt.trim().length >= 10 &&
      form.prompt.length <= PROMPT_MAX &&
      !!form.eventTypeId &&
      form.ticketTypeIds.length > 0 &&
      recurrenceValid
    );
  }, [form, recurrenceValid]);

  const buildRecurrenceInput = useCallback((): RecurrenceInput | null => {
    if (!recurrence.enabled) return null;

    const base: RecurrenceInput = {
      pattern: recurrence.pattern,
      interval: recurrence.interval ?? 1,
    };

    if (recurrence.pattern === 'weekly' || recurrence.pattern === 'custom') {
      base.days_of_week = recurrence.daysOfWeek;
    }
    if (recurrence.pattern === 'monthly' || recurrence.pattern === 'custom') {
      if (recurrence.dayOfMonth != null) base.day_of_month = recurrence.dayOfMonth;
      if (recurrence.weekOfMonth) base.week_of_month = recurrence.weekOfMonth;
    }

    if (recurrence.endsOn) base.ends_on = recurrence.endsOn;
    else if (recurrence.occurrences != null)
      base.occurrences = recurrence.occurrences;

    return base;
  }, [recurrence]);

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
        recurrence: buildRecurrenceInput(),
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
          apiErr?.data?.message ?? 'Failed to generate a draft. Try again.';
      }

      setError(message);
      setStep('error');
    }
  }, [canGenerate, form, buildRecurrenceInput, generateDraft]);

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

  const handleRetry = useCallback(() => {
    setError(null);
    setStep('prompt');
  }, []);

  // ---- Render ----

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
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
          <DialogDescription className="text-muted-foreground">
            {step === 'prompt' &&
              'Describe your event. The AI drafts the name, description, schedule, venue, and tickets.'}
            {step === 'generating' &&
              'Generating your draft. This usually takes a few seconds.'}
            {step === 'preview' &&
              'Review what the AI produced. Edit details in the wizard or publish directly.'}
            {step === 'error' && 'Something went wrong.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'prompt' && (
          <div className="space-y-5 py-2">
            {/* Prompt */}
            <div className="space-y-1.5">
              <Label
                htmlFor="ai-prompt-input"
                className="cursor-pointer text-sm font-medium text-foreground"
              >
                What are you planning? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ai-prompt-input"
                value={form.prompt}
                onChange={(e) => update('prompt', e.target.value)}
                placeholder="A two-day Kubernetes workshop in Nairobi for 60 engineers, hybrid, with a virtual stream and both in-person and remote tickets…"
                className="min-h-[110px] resize-none cursor-text bg-muted/40 placeholder:text-muted-foreground focus-visible:ring-primary/20 transition-all"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Describe the content. Use the toggle below for recurrence.
                </span>
                <span
                  className={cn(
                    'tabular-nums font-mono text-[11px]',
                    form.prompt.length > PROMPT_MAX
                      ? 'text-destructive font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {form.prompt.length} / {PROMPT_MAX}
                </span>
              </div>
            </div>

            {/* Event type */}
            <div className="space-y-1.5">
              <Label className="cursor-pointer text-sm font-medium text-foreground">
                Event Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.eventTypeId}
                onValueChange={(v) => update('eventTypeId', v)}
              >
                <SelectTrigger className="cursor-pointer bg-muted/40">
                  <SelectValue placeholder="Choose event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                      {t.display_name || t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticket types */}
            <div className="space-y-1.5">
              <Label className="cursor-pointer text-sm font-medium text-foreground">
                Ticket Types <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                {ticketTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground animate-pulse py-1">
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
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground',
                      )}
                    >
                      {selected && <Check className="h-3 w-3 shrink-0" />}
                      <span>{tt.display_name || tt.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Pick the ticket types the AI should use. Up to 10.
              </p>
            </div>

            {/* ========================================================= */}
            {/* Recurrence                                                */}
            {/* ========================================================= */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between p-3.5 bg-muted/30">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <Label className="text-sm font-medium text-foreground cursor-pointer">
                      This event repeats
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Turn on to specify the recurrence pattern explicitly.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={recurrence.enabled}
                  onCheckedChange={(c) => updateRec('enabled', c)}
                  disabled={isGenerating}
                  className="cursor-pointer"
                />
              </div>

              {recurrence.enabled && (
                <div className="p-3.5 pt-3 space-y-3 border-t border-border bg-background">
                  {/* Pattern + interval */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Pattern
                      </Label>
                      <Select
                        value={recurrence.pattern}
                        onValueChange={(v) =>
                          updateRec(
                            'pattern',
                            v as RecurrenceFormState['pattern'],
                          )
                        }
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily" className="cursor-pointer">
                            Daily
                          </SelectItem>
                          <SelectItem value="weekly" className="cursor-pointer">
                            Weekly
                          </SelectItem>
                          <SelectItem value="monthly" className="cursor-pointer">
                            Monthly
                          </SelectItem>
                          <SelectItem value="custom" className="cursor-pointer">
                            Custom
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Interval
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={recurrence.interval ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateRec(
                            'interval',
                            v === '' ? null : parseInt(v, 10) || 1,
                          );
                        }}
                        disabled={isGenerating}
                        className="cursor-text"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {recurrence.pattern === 'daily'
                          ? 'Every N day(s)'
                          : recurrence.pattern === 'weekly'
                            ? 'Every N week(s)'
                            : recurrence.pattern === 'monthly'
                              ? 'Every N month(s)'
                              : 'Custom interval'}
                      </p>
                    </div>
                  </div>

                  {/* Weekdays */}
                  {(recurrence.pattern === 'weekly' ||
                    recurrence.pattern === 'custom') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        On days <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {WEEKDAYS.map((d) => {
                          const selected = recurrence.daysOfWeek.includes(d.value);
                          return (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleWeekday(d.value)}
                              disabled={isGenerating}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                                selected
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-muted-foreground border-border hover:border-primary/40',
                                isGenerating && 'opacity-60 cursor-not-allowed',
                              )}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                      {recurrence.daysOfWeek.length === 0 && (
                        <p className="text-[11px] text-destructive">
                          Pick at least one day.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Monthly */}
                  {(recurrence.pattern === 'monthly' ||
                    recurrence.pattern === 'custom') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Day of month
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="e.g., 15"
                          value={recurrence.dayOfMonth ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateRec(
                              'dayOfMonth',
                              v === '' ? null : parseInt(v, 10) || null,
                            );
                          }}
                          disabled={isGenerating}
                          className="cursor-text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Or week of month
                        </Label>
                        <Select
                          value={recurrence.weekOfMonth || '__none__'}
                          onValueChange={(v) =>
                            updateRec('weekOfMonth', v === '__none__' ? '' : v)
                          }
                          disabled={isGenerating}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" className="cursor-pointer">
                              None
                            </SelectItem>
                            <SelectItem value="first" className="cursor-pointer">First</SelectItem>
                            <SelectItem value="second" className="cursor-pointer">Second</SelectItem>
                            <SelectItem value="third" className="cursor-pointer">Third</SelectItem>
                            <SelectItem value="fourth" className="cursor-pointer">Fourth</SelectItem>
                            <SelectItem value="last" className="cursor-pointer">Last</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Ends */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Ends <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          On date
                        </Label>
                        <Input
                          type="date"
                          value={recurrence.endsOn}
                          onChange={(e) => {
                            updateRec('endsOn', e.target.value);
                            if (e.target.value) updateRec('occurrences', null);
                          }}
                          disabled={isGenerating}
                          className="cursor-text mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          After occurrences
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g., 4"
                          value={recurrence.occurrences ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateRec(
                              'occurrences',
                              v === '' ? null : parseInt(v, 10) || null,
                            );
                            if (v) updateRec('endsOn', '');
                          }}
                          disabled={isGenerating}
                          className="cursor-text mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Set one. Leave the other blank.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced options (unchanged) */}
            <details className="group rounded-lg border border-border overflow-hidden transition-all">
              <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-sm font-medium text-foreground hover:bg-muted/50 select-none transition-colors">
                <span>Advanced options</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="p-3.5 pt-2 space-y-3 border-t border-border bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-muted-foreground">
                      Language
                    </Label>
                    <Input
                      value={form.language}
                      onChange={(e) => update('language', e.target.value)}
                      placeholder="en"
                      className="cursor-text bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-muted-foreground">
                      Timezone
                    </Label>
                    <Input
                      value={form.timezone}
                      onChange={(e) => update('timezone', e.target.value)}
                      placeholder="Africa/Nairobi"
                      className="cursor-text bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-muted-foreground">
                      Currency
                    </Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value)}
                      placeholder="KES"
                      className="cursor-text bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-muted-foreground">
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
                      className="cursor-text bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="cursor-pointer text-xs text-muted-foreground">
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
                      className="cursor-text bg-background"
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {step === 'generating' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground animate-pulse">
                Generating your event…
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drafting the name, schedule, description, and tickets.
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && draft && (
          <div className="py-2">
            <DraftPreview draft={draft} currency={form.currency || 'KES'} />
          </div>
        )}

        {step === 'error' && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20 animate-pulse">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Generation failed
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

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
                  'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]',
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
                  'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]',
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
              <Button
                type="button"
                onClick={handleRetry}
                className="cursor-pointer"
              >
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
// DRAFT PREVIEW (unchanged from your version)
// ============================================================

function DraftPreview({
  draft,
  currency,
}: {
  draft: GeneratedEventDraft;
  currency: string;
}) {
  const schedule = draft.schedules?.[0];
  const isVirtual = schedule?.is_virtual ?? false;
  const locationLabel = schedule?.location ?? '';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground leading-snug">
          {draft.name}
        </h3>
        {draft.short_description && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {draft.short_description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {schedule?.start_date && (
          <Badge variant="outline" className="text-muted-foreground font-normal">
            {formatDate(schedule.start_date)}
            {schedule.start_time && ` · ${schedule.start_time}`}
            {schedule.end_time && `–${schedule.end_time}`}
          </Badge>
        )}
        {isVirtual ? (
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 font-medium"
          >
            Virtual
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground font-normal">
            In-person
          </Badge>
        )}
        {draft.is_recurring && draft.recurrence && (
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 font-medium"
          >
            <CalendarClock className="h-3 w-3 mr-1" />
            {formatRecurrence(draft.recurrence)}
          </Badge>
        )}
        {draft.tags?.slice(0, 4).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-muted-foreground border-border bg-muted/50 font-normal"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {draft.description && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Description
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed">
            {draft.description}
          </p>
        </div>
      )}

      {locationLabel && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {isVirtual ? 'Location' : 'Venue'}
          </p>
          <p className="text-sm text-foreground">{locationLabel}</p>
        </div>
      )}

      {draft.tickets && draft.tickets.length > 0 && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tickets ({draft.tickets.length})
          </p>
          <div className="space-y-2">
            {draft.tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm border-t border-border/60 pt-2 first:border-0 first:pt-0"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-foreground truncate">
                    {t.name || `Ticket ${i + 1}`}
                  </p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-foreground tabular-nums">
                    {t.price === 0 ? 'Free' : `${t.price} ${currency}`}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
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

function formatRecurrence(r: {
  pattern: string;
  interval?: number;
  days_of_week?: string[];
  ends_on?: string | null;
  occurrences?: number | null;
}): string {
  const every = r.interval && r.interval > 1 ? `Every ${r.interval} ` : 'Every ';
  const unit =
    r.pattern === 'daily'
      ? r.interval && r.interval > 1 ? 'days' : 'day'
      : r.pattern === 'weekly'
        ? r.interval && r.interval > 1 ? 'weeks' : 'week'
        : r.pattern === 'monthly'
          ? r.interval && r.interval > 1 ? 'months' : 'month'
          : 'period';

  let label = `${every}${unit}`;

  if (r.pattern === 'weekly' && r.days_of_week?.length) {
    label += ` on ${r.days_of_week.map((d) => d.slice(0, 3)).join(', ')}`;
  }

  if (r.ends_on) {
    label += ` until ${r.ends_on}`;
  } else if (r.occurrences) {
    label += ` · ${r.occurrences} times`;
  }

  return label;
}