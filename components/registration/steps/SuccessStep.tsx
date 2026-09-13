// components/registration/steps/SuccessStep.tsx

'use client';

import { ArrowRight, Building2, CheckCircle, Mail, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { SignupAccountType } from '../types';

// ============================================================
// PROPS
// ============================================================

interface SuccessStepProps {
  /** Which type of account was just created. */
  accountType: SignupAccountType;

  /**
   * The primary email address of the created account.
   * For personal accounts this is `formData.email`; for institution
   * accounts it's `formData.adminEmail` (the admin's email, not the
   * org's).
   */
  email: string;

  /**
   * The name to greet the user with.
   * Personal: `formData.name`.
   * Institution: `formData.adminName`.
   */
  displayName: string;

  /**
   * The institution name, only for institution accounts.
   * Undefined for personal accounts.
   */
  institutionName?: string;

  /** Called when the user clicks "Go to Dashboard". */
  onGoToDashboard: () => void;

  /** Called when the user clicks "Explore Events". */
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
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Account Created!
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Welcome to Nuruvent,{' '}
          <span className="font-medium text-gray-900">{displayName}</span>
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          Manage Your Events. Get Paid. Build Your Brand.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-left space-y-1.5 sm:space-y-2 border border-gray-100">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-500">Email:</span>
          <span className="font-medium text-gray-900 truncate">{email}</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-500">Account Type:</span>
          <span className="font-medium text-gray-900">{accountLabel}</span>
        </div>

        {isInstitution && institutionName && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">Institution:</span>
            <span className="font-medium text-gray-900 truncate">
              {institutionName}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          onClick={onGoToDashboard}
          className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={onExploreEvents}
          className="w-full border-gray-200 hover:border-[#1A73E8]/50 text-gray-600 hover:text-[#1A73E8] font-medium py-4 sm:py-5 text-sm sm:text-base rounded-xl transition-all duration-300 cursor-pointer"
        >
          Explore Events
        </Button>
      </div>
    </div>
  );
}