// components/registration/StepIndicator.tsx

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  /** 1-based index of the current step. */
  currentStep: number;
  /**
   * Ordered labels, one per step. The length determines the total
   * number of steps, so `labels.length` is the source of truth for
   * "how many steps are there" — the caller doesn't need to pass it
   * separately.
   */
  labels: string[];
}

/**
 * Progress indicator for the signup flow.
 *
 * Renders one circle per step, connected by a horizontal line. Steps
 * before `currentStep` show a checkmark; the current step is
 * highlighted; future steps are dimmed.
 *
 * Responsive:
 *   - Mobile (default):  small circles, no labels, tight spacing
 *   - Small screens+:    small labels visible
 *   - Tablet and up:     full circles and labels
 *
 * Renders nothing if `labels` is empty — avoids a stray empty row.
 */
export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  const totalSteps = labels.length;

  if (totalSteps === 0) return null;

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-1 sm:px-2">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <div
            key={label}
            className={cn(
              'flex items-center flex-1 min-w-0',
              isLast && 'flex-none',
            )}
          >
            {/* Circle + label */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div
                className={cn(
                  'w-6 h-6 sm:w-8 sm:h-8 rounded-full',
                  'flex items-center justify-center flex-shrink-0',
                  'text-[10px] sm:text-sm font-medium transition-all',
                  isActive &&
                    'bg-[#1A73E8] text-white ring-2 sm:ring-4 ring-[#1A73E8]/20',
                  isCompleted && 'bg-green-500 text-white',
                  !isActive && !isCompleted && 'bg-gray-200 text-gray-500',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  stepNumber
                )}
              </div>

              <span
                className={cn(
                  'text-[8px] sm:text-xs font-medium hidden xs:block truncate',
                  'max-w-[40px] sm:max-w-none',
                  isActive && 'text-gray-900',
                  isCompleted && 'text-gray-600',
                  !isActive && !isCompleted && 'text-gray-400',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not rendered after the last step) */}
            {!isLast && (
              <div className="flex-1 mx-1 sm:mx-2 h-0.5 bg-gray-200 min-w-[10px]">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    isCompleted ? 'w-full bg-green-500' : 'w-0 bg-[#1A73E8]',
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}