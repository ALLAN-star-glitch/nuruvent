// components/registration/constants.ts

import type {
  StepMeta,
  SignupStep,
  SignupAccountType,
  InstitutionTypeOption,
} from './types';

import type { ProfessionalType } from '../../lib/types/auth';

// ============================================================
// TIMING
// ============================================================

/** Seconds the user must wait before they can resend the OTP. */
export const RESEND_OTP_COOLDOWN_SECONDS = 60;

// ============================================================
// STEP LABELS
// ============================================================

/** Stepper labels for the personal signup flow. */
// Personal: Details -> Verify
const PERSONAL_STEP_LABELS = ['Details', 'Verify'] as const;

/** Stepper labels for the institution signup flow. */
// Institution: Admin -> Organization -> Verify
const INSTITUTION_STEP_LABELS = [
  'Admin',
  'Organization',
  'Verify',
] as const;

// ============================================================
// STEP META
// ============================================================

/**
 * Compute the step metadata (number, total, labels, title, description)
 * for the current point in the flow.
 */
export function getStepMeta(
  step: SignupStep,
  accountType: SignupAccountType | null,
): StepMeta {
  const isInstitution = accountType === 'account_type_institution';

  // We exclude 'account-type' and 'success' from the progress bar labels
  const labels: string[] = isInstitution
    ? [...INSTITUTION_STEP_LABELS]
    : [...PERSONAL_STEP_LABELS];

  const total = labels.length;

  const { title, description, number } = describeStep(step, accountType);

  return { number, total, labels, title, description };
}

/**
 * Map a step to its 1-based number (matching the progress bar) and its card header text.
 */
function describeStep(
  step: SignupStep,
  accountType: SignupAccountType | null,
): { number: number; title: string; description: string } {
  const isInstitution = accountType === 'account_type_institution';

  switch (step) {
    case 'account-type':
      return {
        number: 0, // 0 means don't show the progress bar
        title: 'Choose Your Account Type',
        description: 'Select how you want to use Nuruvent',
      };

    case 'details':
      return isInstitution
        ? {
            number: 1, // Admin step (1 of 3)
            title: 'Admin Details',
            description: 'Enter the administrator information',
          }
        : {
            number: 1, // Details step (1 of 2)
            title: 'Personal Details',
            description: 'Enter your personal information',
          };

    case 'institution-details':
      return {
        number: 2, // Organization step (2 of 3)
        title: 'Organization Details',
        description: 'Enter your organization details',
      };

    case 'otp':
      return {
        number: isInstitution ? 3 : 2,
        title: 'Verify Your Email',
        description: "We've sent a code to your email",
      };

    case 'success':
      return {
        number: 0, // Don't show progress bar on success
        title: 'Account Created!',
        description: 'Welcome to Nuruvent',
      };
  }
}

// ============================================================
// INSTITUTION TYPES
// ============================================================

export const INSTITUTION_TYPES_FALLBACK: InstitutionTypeOption[] = [
  { value: 'institution_type_company', label: 'Company' },
  { value: 'institution_type_institute', label: 'Institute' },
  { value: 'institution_type_association', label: 'Association' },
  { value: 'institution_type_school', label: 'School' },
  { value: 'institution_type_university', label: 'University' },
];

// ============================================================
// STEP -> ANIMATION KEY
// ============================================================

export function stepAnimationKey(
  step: SignupStep,
  accountType: SignupAccountType | null,
): string {
  if (step === 'details' && accountType === 'account_type_institution') {
    return 'details-institution';
  }
  return step;
}

export interface ProfessionalTypeOption {
  value: ProfessionalType;
  label: string;
}

export const PROFESSIONAL_TYPES_FALLBACK: ProfessionalTypeOption[] = [
  { value: 'professional_type_trainer', label: 'Trainer' },
  { value: 'professional_type_coach', label: 'Coach' },
  { value: 'professional_type_consultant', label: 'Consultant' },
  { value: 'professional_type_freelancer', label: 'Freelancer' },
];