// components/registration/steps/SuccessStep.tsx

'use client';

import { ArrowRight, Building2, CheckCircle, Mail, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { SignupAccountType } from '../types';

// ============================================================
// PROPS
// ============================================================

interface SuccessStepProps {
  accountType: SignupAccountType;
  email: string;
  displayName: string;
  institutionName?: string;
  onGoToDashboard: () => void;
  onExploreEvents: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function SuccessStep({
  accountType,
  email,
  displayName,
  institutionName,
  onGoToDashboard,
  onExploreEvents,
}: SuccessStepProps) {
  const isInstitution = accountType === 'account_type_institution';
  const accountLabel = isInstitution ? 'Institution' : 'Personal';

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Checkmark */}
      <div className="flex justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-tertiary-500/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-tertiary-500" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Account Created!
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Welcome to Nuruvent,{' '}
          <span className="font-medium text-foreground">{displayName}</span>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage Your Events. Get Paid. Build Your Brand.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-muted rounded-xl p-3 sm:p-4 text-left space-y-1.5 sm:space-y-2 border border-border">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium text-foreground truncate">{email}</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Account Type:</span>
          <span className="font-medium text-foreground">{accountLabel}</span>
        </div>

        {isInstitution && institutionName && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Institution:</span>
            <span className="font-medium text-foreground truncate">
              {institutionName}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          onClick={onGoToDashboard}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={onExploreEvents}
          className="w-full border-border hover:border-primary/50 text-muted-foreground hover:text-primary font-medium py-4 sm:py-5 text-sm sm:text-base rounded-xl transition-all duration-300 cursor-pointer"
        >
          Explore Events
        </Button>
      </div>
    </div>
  );
}