// components/registration/useSignupForm.ts

'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  useRegisterPersonalMutation,
  useRegisterInstitutionMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useCheckAvailabilityMutation,
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
  accountType: SignupAccountType | null;
  currentStep: SignupStep;
  canGoBack: boolean;

  formData: SignupFormData;
  errors: SignupErrors;
  passwordError: string | null;

  otpEmail: string | null;
  otpError: string | null;
  otpSuccess: string | null;

  isSubmitting: boolean;
  isVerifying: boolean;
  isResending: boolean;
  isLoading: boolean;

  institutionTypes: InstitutionTypeOption[];
  professionalTypes: ProfessionalTypeOption[]; 

  selectAccountType: (type: SignupAccountType) => void;
  goBack: () => void;
  next: () => Promise<void>;

  changeField: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  changeProfessionalType: (value: ProfessionalType) => void;
  changeInstitutionType: (value: InstitutionType) => void;
  changePhone: (value: string) => void;
  changeAdminPhone: (value: string) => void;
  changeInstitutionPhone: (value: string) => void;
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

  const otpEmail = useAppSelector((state) => state.auth.otpEmail);

  const [registerPersonal, { isLoading: isRegisteringPersonal }] =
    useRegisterPersonalMutation();
  const [registerInstitution, { isLoading: isRegisteringInstitution }] =
    useRegisterInstitutionMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  const [checkAvailability, { isLoading: isCheckingAvailability }] = useCheckAvailabilityMutation();

  const [accountType, setAccountType] = useState<SignupAccountType | null>(null);
  const [currentStep, setCurrentStep] = useState<SignupStep>('account-type');

  const [formData, setFormData] = useState<SignupFormData>(EMPTY_SIGNUP_FORM);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const isLoading =
    isRegisteringPersonal || isRegisteringInstitution || isVerifying || isResending || isCheckingAvailability;

  const canGoBack =
    currentStep !== 'account-type' && currentStep !== 'success';

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

  const changePhone = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  }, []);

  const changeAdminPhone = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, adminPhone: value }));
    setErrors((prev) => {
      if (!prev.adminPhone) return prev;
      const next = { ...prev };
      delete next.adminPhone;
      return next;
    });
  }, []);

  const changeInstitutionPhone = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, institutionPhone: value }));
    setErrors((prev) => {
      if (!prev.institutionPhone) return prev;
      const next = { ...prev };
      delete next.institutionPhone;
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
    // Phone is optional
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
    // Admin phone is optional
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

  const submitPersonal = useCallback(async (): Promise<boolean> => {
    if (!validatePersonalDetails()) return false;

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      setPasswordError(
        passwordCheck.errors[0] ?? 'Please choose a stronger password',
      );
      return false;
    }

    if (!formData.professionalType) return false;
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
      toast.success('Verification code sent to your email');
      setCurrentStep('otp');
      return true;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'Registration failed. Please try again.',
      );
      toast.error(message);
      
      // Map the error to the UI fields
      if (isEmailError(message)) {
        setErrors({ email: message });
      } else if (isPhoneError(message)) {
        setErrors({ phone: message });
      } else {
        setErrors({ email: message }); // Fallback to email if unknown
      }
      return false;
    }
  }, [formData, registerPersonal, dispatch, validatePersonalDetails]);

  // ============================================================
  // SUBMIT: INSTITUTION
  // ============================================================

  const submitInstitutionAdmin = useCallback(async (): Promise<boolean> => {
    // 1. Local validation
    if (!validateAdminDetails()) return false;

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      setPasswordError(
        passwordCheck.errors[0] ?? 'Please choose a stronger password',
      );
      return false;
    }

    // 2. API Validation (Check Availability)
    try {
      await checkAvailability({
        email: formData.adminEmail,
        phone: formData.adminPhone || undefined,
      }).unwrap();

      // 3. Move to next step if API succeeds
      setCurrentStep('institution-details');
      return true;
    } catch (err) {
      const message = extractErrorMessage(err, 'Validation failed. Please try again.');
      toast.error(message);
      
      // Map the error to the UI fields
      if (isEmailError(message)) {
        setErrors({ adminEmail: message });
      } else if (isPhoneError(message)) {
        setErrors({ adminPhone: message });
      } else {
        setErrors({ adminEmail: message }); // Fallback
      }
      
      return false;
    }
  }, [formData, validateAdminDetails, checkAvailability]);

  const submitInstitution = useCallback(async (): Promise<boolean> => {
    if (!validateInstitutionDetails()) return false;

    if (!formData.institutionType) return false;
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
      toast.success('Verification code sent to your email');
      setCurrentStep('otp');
      return true;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'Registration failed. Please try again.',
      );
      toast.error(message);
      
      // Map the error to the UI fields
      if (isEmailError(message)) {
        setErrors({ adminEmail: message }); // The admin email is the main identity for institutions
      } else if (isInstitutionPhoneError(message)) {
        setErrors({ institutionPhone: message });
      } else if (isInstitutionEmailError(message)) {
        setErrors({ institutionEmail: message });
      } else if (isPhoneError(message)) {
        setErrors({ adminPhone: message }); // Fallback for admin phone
      } else {
        // General error, put it on the institution name or just show toast
        toast.error(message);
      }
      return false;
    }
  }, [formData, registerInstitution, dispatch, validateInstitutionDetails]);

  // ============================================================
  // NEXT
  // ============================================================

  const next = useCallback(async () => {
    if (accountType === 'account_type_personal') {
      await submitPersonal();
      return;
    }

    if (accountType === 'account_type_institution') {
      if (currentStep === 'details') {
        await submitInstitutionAdmin(); 
      } else if (currentStep === 'institution-details') {
        await submitInstitution(); 
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
        toast.error('Email not found. Please try again.');
        return;
      }

      try {
        await verifyOTP({ email, otp: code }).unwrap();
        toast.success('Account verified. Welcome to Nuruvent!');
        setCurrentStep('success');
      } catch (err) {
        const message = extractErrorMessage(
          err,
          'Invalid OTP. Please try again.',
        );
        setOtpError(message);
        toast.error(message);
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
      toast.error('Email not found. Please try again.');
      return;
    }

    try {
      await resendOTP({ email, purpose: 'registration' }).unwrap();
      setOtpSuccess('New verification code sent to your email');
      toast.success('Verification code resent');
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'Failed to resend OTP. Please try again.',
      );
      setOtpError(message);
      toast.error(message);
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
    changePhone,
    changeAdminPhone,
    changeInstitutionPhone,
    changePassword,
    generatePassword,

    verifyOtp,
    resendOtp,
  };
}

// ============================================================
// HELPERS
// ============================================================

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { data?: { message?: string }; message?: string };
    if (anyErr.data?.message) return anyErr.data.message;
    if (anyErr.message) return anyErr.message;
  }
  return fallback;
}

// Helper to detect which field the error belongs to based on the message
function isEmailError(message: string): boolean {
  return /email/i.test(message) && !/institution/i.test(message);
}

function isPhoneError(message: string): boolean {
  return /phone/i.test(message) && !/institution/i.test(message);
}

function isInstitutionEmailError(message: string): boolean {
  return /institution email/i.test(message);
}

function isInstitutionPhoneError(message: string): boolean {
  return /institution phone/i.test(message);
}