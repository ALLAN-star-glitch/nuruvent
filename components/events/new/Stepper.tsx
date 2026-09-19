// components/events/new/Stepper.tsx

'use client';

import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

// ============================================================
// STEPPER
// ============================================================

interface StepperProps {
  currentStep: number;
  steps: readonly string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isCompleted && 'bg-tertiary-500 text-white',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  isActive && 'text-foreground',
                  isCompleted && 'text-muted-foreground',
                  !isActive && !isCompleted && 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-muted">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    isCompleted ? 'w-full bg-tertiary-500' : 'w-0 bg-primary',
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