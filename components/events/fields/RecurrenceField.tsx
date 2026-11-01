// components/events/fields/RecurrenceField.tsx

'use client';

import { Repeat } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { FieldBaseProps, fieldId } from '@/components/form/types';
import { RecurrenceForm, WEEKDAY_CODES, WEEKDAY_LABELS } from '../new';
import { makeEmptyRecurrence, WeekdayCode } from '../types';

// ============================================================
// RECURRENCE FIELD (events)
// ============================================================

interface RecurrenceFieldProps extends FieldBaseProps {
  enabled: boolean;
  value: RecurrenceForm | null;
  onEnabledChange: (enabled: boolean) => void;
  onChange: (value: RecurrenceForm) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
}

type Pattern = RecurrenceForm['pattern'];

const PATTERNS: { value: Pattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const WEEK_OF_MONTH = [
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second' },
  { value: 'third', label: 'Third' },
  { value: 'fourth', label: 'Fourth' },
  { value: 'last', label: 'Last' },
];

export function RecurrenceField({
  enabled,
  value,
  onEnabledChange,
  onChange,
  startDate,
  onStartDateChange,
  error,
  disabled,
  id,
}: RecurrenceFieldProps) {
  const recur: RecurrenceForm = value ?? makeEmptyRecurrence();

  const update = <K extends keyof RecurrenceForm>(
    key: K,
    v: RecurrenceForm[K],
  ) => {
    onChange({ ...recur, [key]: v });
  };

  const toggleWeekday = (day: WeekdayCode) => {
    const has = recur.days_of_week.includes(day);
    const next = has
      ? recur.days_of_week.filter((d) => d !== day)
      : [...recur.days_of_week, day];
    update('days_of_week', next);
  };

  const showWeeklyDays = recur.pattern === 'weekly';
  const showMonthlyFields = recur.pattern === 'monthly';

  return (
    <FieldWrapper
      id={fieldId('recurrence', id)}
      label="Recurrence"
      helper={
        enabled
          ? 'This event will generate multiple sessions based on these rules.'
          : 'Set a recurrence pattern for repeated sessions.'
      }
      error={error}
    >
      <div className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" />
              This event repeats
            </Label>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => {
              onEnabledChange(checked);
              if (checked && !value) {
                onChange(makeEmptyRecurrence());
              }
            }}
            disabled={disabled}
            className="cursor-pointer"
          />
        </div>

        {/* Editor */}
        {enabled && (
          <div className="space-y-4 border border-border rounded-lg p-4 bg-card">
            {/* Series Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Starts on <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                disabled={disabled}
                className="cursor-text"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  How often? <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={recur.pattern}
                  onValueChange={(v) => update('pattern', v as Pattern)}
                  disabled={disabled}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Choose frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATTERNS.map((p) => (
                      <SelectItem
                        key={p.value}
                        value={p.value}
                        className="cursor-pointer"
                      >
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Repeat every
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={recur.interval ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    update('interval', v === '' ? null : parseInt(v, 10) || 1);
                  }}
                  disabled={disabled}
                  className="cursor-text"
                />
                <p className="text-[11px] text-muted-foreground">
                  {recur.pattern === 'daily'
                    ? 'Number of days between sessions'
                    : recur.pattern === 'weekly'
                      ? 'Number of weeks between sessions'
                      : 'Number of months between sessions'}
                </p>
              </div>
            </div>

            {showWeeklyDays && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  On which days?
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAY_CODES.map((code) => {
                    const selected = recur.days_of_week.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleWeekday(code)}
                        disabled={disabled}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                          selected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/40',
                          disabled && 'opacity-60 cursor-not-allowed',
                        )}
                      >
                        {WEEKDAY_LABELS[code]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showMonthlyFields && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Day of month
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="e.g., 15"
                    value={recur.day_of_month ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      update(
                        'day_of_month',
                        v === '' ? null : parseInt(v, 10) || null,
                      );
                    }}
                    disabled={disabled}
                    className="cursor-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Or week of month
                  </Label>
                  <Select
                    value={recur.week_of_month || '__none__'}
                    onValueChange={(v) =>
                      update('week_of_month', v === '__none__' ? '' : v)
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="cursor-pointer">
                        None
                      </SelectItem>
                      {WEEK_OF_MONTH.map((w) => (
                        <SelectItem
                          key={w.value}
                          value={w.value}
                          className="cursor-pointer"
                        >
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4 mt-2">
              <Label className="text-xs font-medium text-foreground">
                When should it stop?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">
                    On a specific date
                  </Label>
                  <Input
                    type="date"
                    value={recur.ends_on || ''}
                    min={startDate || undefined}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      onChange({
                        ...recur,
                        ends_on: newDate,
                        occurrences: newDate ? null : recur.occurrences,
                      });
                    }}
                    disabled={disabled}
                    className="cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">
                    After a number of sessions
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g., 10"
                    value={recur.occurrences ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      const count = v === '' ? null : parseInt(v, 10) || null;
                      onChange({
                        ...recur,
                        occurrences: count,
                        ends_on: count ? '' : recur.ends_on,
                      });
                    }}
                    disabled={disabled}
                    className="cursor-text"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pick one. If you leave both blank, it will repeat forever.
              </p>
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}