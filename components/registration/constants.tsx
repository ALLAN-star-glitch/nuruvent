// components/registration/constants.ts

import type {
  StepMeta,
  SignupStep,
  SignupAccountType,
  InstitutionTypeOption,
} from './types';

import type {ProfessionalType} from '../../lib/types/auth';

// ============================================================
// TIMING
// ============================================================

/** Seconds the user must wait before they can resend the OTP. */
export const RESEND_OTP_COOLDOWN_SECONDS = 60;

// ============================================================
// STEP LABELS
// ============================================================

/** Stepper labels for the personal signup flow. */
const PERSONAL_STEP_LABELS = ['Type', 'Details', 'OTP', 'Done'] as const;

/** Stepper labels for the institution signup flow. */
const INSTITUTION_STEP_LABELS = [
  'Type',
  'Admin',
  'Inst.',
  'OTP',
  'Done',
] as const;

// ============================================================
// STEP META
// ============================================================

/**
 * Compute the step metadata (number, total, labels, title, description)
 * for the current point in the flow.
 *
 * The step number and total depend on which flow we're in:
 *   - personal:    account-type(1) -> details(2) -> otp(3) -> success(4)
 *   - institution: account-type(1) -> details(2) -> institution-details(3)
 *                  -> otp(4) -> success(5)
 */
export function getStepMeta(
  step: SignupStep,
  accountType: SignupAccountType | null,
): StepMeta {
  const isInstitution = accountType === 'account_type_institution';

  const labels: string[] = isInstitution
    ? [...INSTITUTION_STEP_LABELS]
    : [...PERSONAL_STEP_LABELS];

  const total = labels.length;

  const { title, description, number } = describeStep(step, accountType);

  return { number, total, labels, title, description };
}

/**
 * Map a step to its 1-based number and its card header text.
 */
function describeStep(
  step: SignupStep,
  accountType: SignupAccountType | null,
): { number: number; title: string; description: string } {
  const isInstitution = accountType === 'account_type_institution';

  switch (step) {
    case 'account-type':
      return {
        number: 1,
        title: 'Choose Your Account Type',
        description: 'Select how you want to use Nuruvent',
      };

    case 'details':
      return isInstitution
        ? {
            number: 2,
            title: 'Personal Details',
            description: 'Enter your personal details',
          }
        : {
            number: 2,
            title: 'Personal Details',
            description: 'Enter your personal information',
          };

    case 'institution-details':
      return {
        number: 3,
        title: 'Institution Details',
        description: 'Enter your organization details',
      };

    case 'otp':
      return {
        number: isInstitution ? 4 : 3,
        title: 'Verify Your Email',
        description: "We've sent a code to your email",
      };

    case 'success':
      return {
        number: isInstitution ? 5 : 4,
        title: 'Account Created!',
        description: 'Welcome to Nuruvent',
      };
  }
}

// ============================================================
// INSTITUTION TYPES
// ============================================================
//
// Fallback list used until the reference-data endpoint is available.
// Once `GET /api/v1/institution-types` exists, replace the
// `institutionTypes` prop in the form with a fetch from
// `referenceApi.ts` and delete this constant.
//
// The values below mirror the backend `institution_types` table:
//   name         -> value
//   display_name -> label

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

/**
 * A stable key for the current step, used as the `key` prop on the
 * AnimatePresence wrapper so exit/enter animations run correctly.
 *
 * The `details` step renders two different forms depending on the
 * account type. This collapses them into distinct keys so the animation
 * replays when the user switches context.
 */
export function stepAnimationKey(
  step: SignupStep,
  accountType: SignupAccountType | null,
): string {
  if (step === 'details' && accountType === 'account_type_institution') {
    return 'details-institution';
  }
  return step;
}

/**
 * A single option for the professional-type dropdown. `value` matches
 * `professional_types.name`, `label` matches `professional_types.display_name`.
 */
export interface ProfessionalTypeOption {
  value: ProfessionalType;
  label: string;
}

/**
 * Fallback list used until `GET /api/v1/professional-types` is wired up.
 * Values mirror the `professional_types` table.
 */
export const PROFESSIONAL_TYPES_FALLBACK: ProfessionalTypeOption[] = [
  { value: 'professional_type_trainer', label: 'Trainer' },
  { value: 'professional_type_coach', label: 'Coach' },
  { value: 'professional_type_consultant', label: 'Consultant' },
  { value: 'professional_type_freelancer', label: 'Freelancer' },
  
];