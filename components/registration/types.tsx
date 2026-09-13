// components/registration/types.ts

import type {
  AccountType,
  ProfessionalType,
  InstitutionType,
} from '../../lib/types/auth';

// ============================================================
// FLOW STEPS
// ============================================================

/**
 * The step machine for the signup flow.
 *
 * Personal account path:
 *   account-type -> details -> otp -> success
 *
 * Institution account path:
 *   account-type -> details -> institution-details -> otp -> success
 *
 * The `details` step renders different fields depending on `accountType`:
 *   - personal:     personal details form
 *   - institution:  admin details form
 */
export type SignupStep =
  | 'account-type'
  | 'details'
  | 'institution-details'
  | 'otp'
  | 'success';

// ============================================================
// ACCOUNT TYPE
// ============================================================

/**
 * The type of account being created. `null` until the user picks one
 * on the first step.
 *
 * Note: this is a narrower type than the full `AccountType` union —
 * `account_type_invited` is not a valid choice here (invited users
 * arrive via a different flow entirely).
 */
export type SignupAccountType = Extract<
  AccountType,
  'account_type_personal' | 'account_type_institution'
>;

// ============================================================
// INSTITUTION TYPE OPTION
// ============================================================

/**
 * A single option for the institution-type dropdown.
 *
 * `value` matches `institution_types.name` (e.g. "institution_type_company").
 * `label` is what the user sees.
 */
export interface InstitutionTypeOption {
  value: InstitutionType;
  label: string;
}

// ============================================================
// FORM DATA
// ============================================================

/**
 * Everything the user can enter across the entire signup flow.
 *
 * Fields are grouped by which step they belong to. Not all fields are
 * relevant at once — `institutionName`, `institutionEmail`, etc. are
 * only used when `accountType === 'account_type_institution'`.
 *
 * Kept flat (not nested) for simpler `setState` updates via
 * `handleChange(e)` using `e.target.name`.
 */
export interface SignupFormData {
  // ---- Personal details (personal signup) ----
  name: string;
  email: string;
  phone: string;
  professionalType: ProfessionalType | '';

  // ---- Admin details (institution signup) ----
  adminName: string;
  adminEmail: string;
  adminPhone: string;

  // ---- Common ----
  password: string;

  // ---- Institution details ----
  institutionName: string;
  institutionEmail: string;
  institutionPhone: string;
  /** The selected institution type value, or `''` if not yet picked. */
  institutionType: InstitutionType | '';
}

/**
 * The initial values for a fresh signup. Every field is an empty string;
 * `professionalType` and `institutionType` are set once the user picks
 * a value from their respective dropdowns.
 */
export const EMPTY_SIGNUP_FORM: SignupFormData = {
  name: '',
  email: '',
  phone: '',
  professionalType: '',

  adminName: '',
  adminEmail: '',
  adminPhone: '',

  password: '',

  institutionName: '',
  institutionEmail: '',
  institutionPhone: '',
  institutionType: '',
};

// ============================================================
// FORM ERRORS
// ============================================================

/**
 * Field-level validation errors. Same keys as `SignupFormData` (partial),
 * so `errors[fieldName]` maps directly.
 */
export type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

// ============================================================
// STEP METADATA
// ============================================================

/**
 * Describes a single step: which number it is, what its label is, and
 * what the header of the card should say.
 *
 * Produced by `getStepMeta()` in `constants.ts` so the step number,
 * label, and title/description stay in sync.
 */
export interface StepMeta {
  /** 1-based step number across the whole flow. */
  number: number;
  /** Total number of steps in this flow (4 for personal, 5 for institution). */
  total: number;
  /** Ordered labels for the stepper. Length === total. */
  labels: string[];
  /** Card title shown above the step content. */
  title: string;
  /** Card description shown under the title. */
  description: string;
}