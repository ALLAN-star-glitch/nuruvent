// components/registration/StepIndicator.tsx

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number; // 1-based index (0 means hidden)
  labels: string[];
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  if (currentStep === 0 || labels.length === 0) return null;

  const totalSteps = labels.length;
  
  // Calculate percentage (e.g., step 1 of 2 = 0%, step 2 of 2 = 100%)
  // We use (currentStep - 1) so that step 1 is empty, step 2 is half, etc.
  const progressPercentage = totalSteps > 1 
    ? ((currentStep - 1) / (totalSteps - 1)) * 100 
    : 0;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Progress Bar Track */}
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        {/* Animated Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mt-3 px-1">
        {labels.map((label, index) => {
          const isActive = index + 1 <= currentStep;
          const isCurrent = index + 1 === currentStep;

          return (
            <span
              key={label}
              className={cn(
                'text-xs font-medium transition-colors duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground',
                isCurrent && 'font-bold'
              )}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}