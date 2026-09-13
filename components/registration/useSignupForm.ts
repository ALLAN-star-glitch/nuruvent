// components/registration/useSignupForm.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  useRegisterPersonalMutation,
  useRegisterInstitutionMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} from '@/lib/store/api/authApi';
import { setOtpEmail } from '@/lib/store/slices/authSlice';
import type { InstitutionType, ProfessionalType } from '@/lib/types/auth';

import { generateStrongPassword, validatePassword } from '@/lib/utils/password';

import {
  EMPTY_SIGNUP_FORM,
  InstitutionTypeOption,
  type SignupAccountType,
  type SignupErrors,
  type SignupFormData,
  type SignupStep,
} from './types';
import {
  INSTITUTION_TYPES_FALLBACK,
  PROFESSIONAL_TYPES_FALLBACK,
  ProfessionalTypeOption,
} from './constants';



// ============================================================
// PUBLIC TYPES
// ============================================================

export interface UseSignupFormResult {
  // ---- Flow state ----
  accountType: SignupAccountType | null;
  currentStep: SignupStep;
  canGoBack: boolean;

  // ---- Form state ----
  formData: SignupFormData;
  errors: SignupErrors;
  passwordError: string | null;

  // ---- OTP state ----
  otpEmail: string | null;
  otpError: string | null;
  otpSuccess: string | null;

  // ---- Loading flags (derived from RTK Query) ----
  isSubmitting: boolean;
  isVerifying: boolean;
  isResending: boolean;
  isLoading: boolean;

  // ---- Dropdown options ----
  institutionTypes: InstitutionTypeOption[];
  professionalTypes: ProfessionalTypeOption[]; 

  // ---- Handlers ----
  selectAccountType: (type: SignupAccountType) => void;
  goBack: () => void;
  next: () => void;

  changeField: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  changeProfessionalType: (value: ProfessionalType) => void;
  changeInstitutionType: (value: InstitutionType) => void;
  changePassword: (value: string) => void;
  generatePassword: () => void;

  verifyOtp: (code: string) => void;
  resendOtp: () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useSignupForm(): UseSignupFormResult {
  const dispatch = useAppDispatch();

  // The auth slice is the source of truth for which email is pending
  // OTP verification — the RTK Query matchers write to it.
  const otpEmail = useAppSelector((state) => state.auth.otpEmail);

  // ---- RTK Query mutations ----------------------------------------
  const [registerPersonal, { isLoading: isRegisteringPersonal }] =
    useRegisterPersonalMutation();
  const [registerInstitution, { isLoading: isRegisteringInstitution }] =
    useRegisterInstitutionMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  // ---- Flow state -------------------------------------------------
  const [accountType, setAccountType] = useState<SignupAccountType | null>(null);
  const [currentStep, setCurrentStep] = useState<SignupStep>('account-type');

  // ---- Form state -------------------------------------------------
  const [formData, setFormData] = useState<SignupFormData>(EMPTY_SIGNUP_FORM);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ---- OTP feedback (parent-owned; the step holds only the code) --
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // ============================================================
  // DERIVED
  // ============================================================

  const isLoading =
    isRegisteringPersonal || isRegisteringInstitution || isVerifying || isResending;

  const canGoBack =
    currentStep !== 'account-type' && currentStep !== 'success';

  // Dropdown options. Once reference endpoints exist, replace these with
  // `useGetInstitutionTypesQuery()` / `useGetProfessionalTypesQuery()`.
  const institutionTypes = useMemo(() => INSTITUTION_TYPES_FALLBACK, []);
  const professionalTypes = useMemo(() => PROFESSIONAL_TYPES_FALLBACK, []);

  // ============================================================
  // FIELD HANDLERS
  // ============================================================

  const changeField = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        if (!prev[name as keyof SignupFormData]) return prev;
        const next = { ...prev };
        delete next[name as keyof SignupFormData];
        return next;
      });
    },
    [],
  );

  const changeProfessionalType = useCallback((value: ProfessionalType) => {
    setFormData((prev) => ({ ...prev, professionalType: value }));
    setErrors((prev) => {
      if (!prev.professionalType) return prev;
      const next = { ...prev };
      delete next.professionalType;
      return next;
    });
  }, []);

  const changeInstitutionType = useCallback((value: InstitutionType) => {
    setFormData((prev) => ({ ...prev, institutionType: value }));
    setErrors((prev) => {
      if (!prev.institutionType) return prev;
      const next = { ...prev };
      delete next.institutionType;
      return next;
    });
  }, []);

  const changePassword = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    if (value.length === 0) {
      setPasswordError(null);
      return;
    }
    const validation = validatePassword(value);
    setPasswordError(validation.isValid ? null : validation.errors[0] ?? null);
  }, []);

  const generatePassword = useCallback(() => {
    const password = generateStrongPassword();
    setFormData((prev) => ({ ...prev, password }));
    setPasswordError(null);
  }, []);

  // ============================================================
  // STEP TRANSITIONS
  // ============================================================

  const selectAccountType = useCallback((type: SignupAccountType) => {
    setAccountType(type);
    setErrors({});
    setCurrentStep('details');
  }, []);

  const goBack = useCallback(() => {
    setErrors({});
    setOtpError(null);
    setOtpSuccess(null);

    setCurrentStep((step) => {
      switch (step) {
        case 'details':
          setAccountType(null);
          return 'account-type';

        case 'institution-details':
          return 'details';

        case 'otp':
          return accountType === 'account_type_institution'
            ? 'institution-details'
            : 'details';

        default:
          return step;
      }
    });
  }, [accountType]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validatePersonalDetails = useCallback((): boolean => {
    const next: SignupErrors = {};

    if (!formData.name) next.name = 'Full name is required';
    if (!formData.email) next.email = 'Email is required';
    if (!formData.phone) next.phone = 'Phone number is required';
    if (!formData.professionalType)
      next.professionalType = 'Please choose a professional type';
    if (!formData.password) next.password = 'Password is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData]);

  const validateAdminDetails = useCallback((): boolean => {
    const next: SignupErrors = {};

    if (!formData.adminName) next.adminName = 'Admin name is required';
    if (!formData.adminEmail) next.adminEmail = 'Admin email is required';
    if (!formData.adminPhone) next.adminPhone = 'Admin phone is required';
    if (!formData.password) next.password = 'Password is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData]);

  const validateInstitutionDetails = useCallback((): boolean => {
    const next: SignupErrors = {};

    if (!formData.institutionName)
      next.institutionName = 'Institution name is required';
    if (!formData.institutionEmail)
      next.institutionEmail = 'Institution email is required';
    if (!formData.institutionPhone)
      next.institutionPhone = 'Institution phone is required';
    if (!formData.institutionType)
      next.institutionType = 'Institution type is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData]);

  // ============================================================
  // SUBMIT: PERSONAL
  // ============================================================

  const submitPersonal = useCallback(async () => {
    if (!validatePersonalDetails()) return;

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      setPasswordError(
        passwordCheck.errors[0] ?? 'Please choose a stronger password',
      );
      return;
    }

    // Narrow the professional type before the API call. `validatePersonalDetails`
    // guarantees it's non-empty, but TS doesn't know that yet.
    if (!formData.professionalType) return;
    const professionalType: ProfessionalType = formData.professionalType;

    try {
      const response = await registerPersonal({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        account_type: 'account_type_personal',
        professional_type: professionalType,
      }).unwrap();

      dispatch(setOtpEmail(response.data.email));
      setCurrentStep('otp');
    } catch (err) {
      const message = extractErrorMessage(err, 'Registration failed. Please try again.');
      setErrors({ email: message });
    }
  }, [formData, registerPersonal, dispatch, validatePersonalDetails]);

  // ============================================================
  // SUBMIT: INSTITUTION
  // ============================================================

  const submitInstitutionAdmin = useCallback(() => {
    if (!validateAdminDetails()) return;

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      setPasswordError(
        passwordCheck.errors[0] ?? 'Please choose a stronger password',
      );
      return;
    }

    setCurrentStep('institution-details');
  }, [formData, validateAdminDetails]);

  const submitInstitution = useCallback(async () => {
    if (!validateInstitutionDetails()) return;

    // Narrow institution type — validated above.
    if (!formData.institutionType) return;
    const institutionType: InstitutionType = formData.institutionType;

    try {
      const response = await registerInstitution({
        email: formData.adminEmail,
        password: formData.password,
        name: formData.adminName,
        phone: formData.adminPhone,
        account_type: 'account_type_institution',
        institution_name: formData.institutionName,
        institution_email: formData.institutionEmail,
        institution_phone: formData.institutionPhone,
        institution_type: institutionType,
      }).unwrap();

      dispatch(setOtpEmail(response.data.email));
      setCurrentStep('otp');
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'Registration failed. Please try again.',
      );
      setErrors({ adminEmail: message });
    }
  }, [formData, registerInstitution, dispatch, validateInstitutionDetails]);

  // ============================================================
  // NEXT
  // ============================================================

  const next = useCallback(() => {
    if (accountType === 'account_type_personal') {
      submitPersonal();
      return;
    }

    if (accountType === 'account_type_institution') {
      if (currentStep === 'details') {
        submitInstitutionAdmin();
      } else if (currentStep === 'institution-details') {
        submitInstitution();
      }
    }
  }, [
    accountType,
    currentStep,
    submitPersonal,
    submitInstitutionAdmin,
    submitInstitution,
  ]);

  // ============================================================
  // OTP ACTIONS
  // ============================================================

  const verifyOtp = useCallback(
    async (code: string) => {
      setOtpError(null);
      setOtpSuccess(null);

      const email =
        otpEmail ??
        (accountType === 'account_type_institution'
          ? formData.adminEmail
          : formData.email);

      if (!email) {
        setOtpError('Email not found. Please try again.');
        return;
      }

      try {
        await verifyOTP({ email, otp: code }).unwrap();
        setCurrentStep('success');
      } catch (err) {
        setOtpError(
          extractErrorMessage(err, 'Invalid OTP. Please try again.'),
        );
      }
    },
    [otpEmail, accountType, formData.adminEmail, formData.email, verifyOTP],
  );

  const resendOtp = useCallback(async () => {
    setOtpError(null);
    setOtpSuccess(null);

    const email =
      otpEmail ??
      (accountType === 'account_type_institution'
        ? formData.adminEmail
        : formData.email);

    if (!email) {
      setOtpError('Email not found. Please try again.');
      return;
    }

    try {
      await resendOTP({ email, purpose: 'registration' }).unwrap();
      setOtpSuccess('New verification code sent to your email');
    } catch (err) {
      setOtpError(
        extractErrorMessage(err, 'Failed to resend OTP. Please try again.'),
      );
    }
  }, [otpEmail, accountType, formData.adminEmail, formData.email, resendOTP]);

  // ============================================================
  // RESULT
  // ============================================================

  return {
    accountType,
    currentStep,
    canGoBack,

    formData,
    errors,
    passwordError,

    otpEmail,
    otpError,
    otpSuccess,

    isSubmitting: isRegisteringPersonal || isRegisteringInstitution,
    isVerifying,
    isResending,
    isLoading,

    institutionTypes,
    professionalTypes,

    selectAccountType,
    goBack,
    next,

    changeField,
    changeProfessionalType,
    changeInstitutionType,
    changePassword,
    generatePassword,

    verifyOtp,
    resendOtp,
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Best-effort extraction of a human-readable message from an RTK Query
 * error. Handles the common shapes returned by our API and falls back to
 * the provided default.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { data?: { message?: string }; message?: string };
    if (anyErr.data?.message) return anyErr.data.message;
    if (anyErr.message) return anyErr.message;
  }
  return fallback;
}