'use client';

import { useState, useEffect, useRef } from 'react';  // ✅ Add useRef
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Briefcase,
  Users,
  Sparkles,
  Shield,
  Mail,
  Phone,
  Lock,
  User,
  CheckCircle,
  UserCircle,
  Building,
  UserCheck,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  useRegisterPersonalMutation,
  useRegisterInstitutionMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} from '@/lib/store/api/authApi';
import { setOtpEmail, setRegistrationData } from '@/lib/store/slices/authSlice';
import { validatePassword, generateStrongPassword } from '@/lib/utils/password';
import { PasswordInput } from '../ui/PasswordInput';
import { OtpInput } from '../ui/OtpInput';

// ============================================================
// TYPES
// ============================================================

type AccountType = 'account_type_personal' | 'account_type_institution' | null;
type Step = 'account-type' | 'details' | 'institution-details' | 'otp' | 'success';

type FormData = {
  // Personal
  name: string;
  email: string;
  phone: string;
  // Institution Admin
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  // Common
  password: string;
  // Institution Details
  institutionName: string;
  institutionEmail: string;
  institutionPhone: string;
  institutionType: string;
};

// ============================================================
// STEPPER COMPONENT
// ============================================================

const Stepper = ({ 
  currentStep, 
  totalSteps, 
  labels 
}: { 
  currentStep: number; 
  totalSteps: number; 
  labels: string[];
}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-1 sm:px-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <div
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-medium transition-all flex-shrink-0",
                  isActive && "bg-[#1A73E8] text-white ring-2 sm:ring-4 ring-[#1A73E8]/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-[8px] sm:text-xs font-medium hidden xs:block truncate max-w-[40px] sm:max-w-none",
                  isActive && "text-gray-900",
                  isCompleted && "text-gray-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {labels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 mx-1 sm:mx-2 h-0.5 bg-gray-200 min-w-[10px]">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? "w-full bg-green-500" : "w-0 bg-[#1A73E8]"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SignupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { otpEmail, registrationData, isAuthenticated } = useAppSelector((state) => state.auth);

  // RTK Query hooks
  const [registerPersonal, { isLoading: isRegisterPersonalLoading }] = useRegisterPersonalMutation();
  const [registerInstitution, { isLoading: isRegisterInstitutionLoading }] = useRegisterInstitutionMutation();
  const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();

  // Local state
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [currentStep, setCurrentStep] = useState<Step>('account-type');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    institutionName: '',
    institutionEmail: '',
    institutionPhone: '',
    institutionType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Ref for OTP to avoid race condition
  const otpRef = useRef('');

  // Institution types (matches backend slugs)
 const institutionTypes = [
  { value: 'institution_type_company', label: 'Company' },
  { value: 'institution_type_institute', label: 'Institute' },
  { value: 'institution_type_association', label: 'Association' },
  { value: 'institution_type_school', label: 'School' },
  { value: 'institution_type_university', label: 'University' },
];

  // OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Get step info
  const getSteps = () => {
    if (accountType === 'account_type_institution') {
      return { total: 5, labels: ['Type', 'Admin', 'Inst.', 'OTP', 'Done'] };
    }
    return { total: 4, labels: ['Type', 'Details', 'OTP', 'Done'] };
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'account-type': return 1;
      case 'details': return 2;
      case 'institution-details': return 3;
      case 'otp': return accountType === 'account_type_institution' ? 4 : 3;
      case 'success': return accountType === 'account_type_institution' ? 5 : 4;
      default: return 1;
    }
  };

  const steps = getSteps();
  const currentStepNumber = getStepNumber();
  const isLoadingCombined = isRegisterPersonalLoading || isRegisterInstitutionLoading || isVerifyLoading || isResendLoading || isLoading;

  // ✅ Generate strong password
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    const validation = validatePassword(newPassword);
    if (validation.isValid) {
      setPasswordError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    const validation = validatePassword(value);
    if (!validation.isValid && value.length > 0) {
      setPasswordError(validation.errors[0] || null);
    } else {
      setPasswordError(null);
    }
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setCurrentStep('details');
    setErrors({});
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('account-type');
        setAccountType(null);
        break;
      case 'institution-details':
        setCurrentStep('details');
        break;
      case 'otp':
        setOtp('');
        otpRef.current = '';
        setOtpError(null);
        setOtpSuccess(null);
        if (accountType === 'account_type_institution') {
          setCurrentStep('institution-details');
        } else {
          setCurrentStep('details');
        }
        break;
      default:
        break;
    }
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ OTP change handler - updates both state and ref
  const handleOtpChange = (value: string) => {
    otpRef.current = value;
    setOtp(value);
    setOtpError(null);
    setOtpSuccess(null);
  };

  const validatePersonal = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdmin = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.adminName) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
    if (!formData.adminPhone) newErrors.adminPhone = 'Admin phone is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInstitution = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.institutionName) newErrors.institutionName = 'Institution name is required';
    if (!formData.institutionEmail) newErrors.institutionEmail = 'Institution email is required';
    if (!formData.institutionPhone) newErrors.institutionPhone = 'Institution phone is required';
    if (!formData.institutionType) newErrors.institutionType = 'Institution type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (accountType === 'account_type_personal') {
      if (!validatePersonal()) return;
      
      // Check if password is valid
      const validation = validatePassword(formData.password);
      if (!validation.isValid) {
        setPasswordError(validation.errors[0] || 'Please choose a stronger password');
        return;
      }
      
      setIsLoading(true);
      registerPersonal({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        account_type: 'account_type_personal',
      })
        .unwrap()
        .then((response) => {
          const email = response.data?.email || formData.email;
          dispatch(setOtpEmail(email));
          dispatch(setRegistrationData(response.data));
          setCurrentStep('otp');
          setResendTimer(60);
        })
        .catch((error) => {
          const message = error.data?.message || 'Registration failed. Please try again.';
          setErrors({ email: message });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Institution flow
      if (currentStep === 'details') {
        if (!validateAdmin()) return;
        
        // Check if password is valid
        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
          setPasswordError(validation.errors[0] || 'Please choose a stronger password');
          return;
        }
        
        setCurrentStep('institution-details');
      } else if (currentStep === 'institution-details') {
        if (!validateInstitution()) return;
        
        setIsLoading(true);
        registerInstitution({
          email: formData.adminEmail,
          password: formData.password,
          name: formData.adminName,
          phone: formData.adminPhone,
          account_type: 'account_type_institution',
          institution_name: formData.institutionName,
          institution_email: formData.institutionEmail,
          institution_phone: formData.institutionPhone,
          institution_type: formData.institutionType,
        })
          .unwrap()
          .then((response) => {
            const email = response.data?.email || formData.adminEmail;
            dispatch(setOtpEmail(email));
            dispatch(setRegistrationData(response.data));
            setCurrentStep('otp');
            setResendTimer(60);
          })
          .catch((error) => {
            const message = error.data?.message || 'Registration failed. Please try again.';
            setErrors({ adminEmail: message });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  // ✅ Verify OTP - uses ref for latest value
  const handleVerifyOtp = () => {
    const code = otpRef.current;
    if (code.length !== 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }

    const email = otpEmail || (accountType === 'account_type_institution' ? formData.adminEmail : formData.email);
    if (!email) {
      setOtpError('Email not found. Please try again.');
      return;
    }

    setIsLoading(true);
    verifyOTP({
      email: email,
      otp: code,
    })
      .unwrap()
      .then(() => {
        setCurrentStep('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      })
      .catch((error) => {
        const message = error.data?.message || 'Invalid OTP. Please try again.';
        setOtpError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // ✅ Unified Resend OTP with purpose
  const handleResendOtp = () => {
    setOtpError(null);
    setOtpSuccess(null);
    
    const email = otpEmail || (accountType === 'account_type_institution' ? formData.adminEmail : formData.email);
    if (!email) {
      setOtpError('Email not found. Please try again.');
      return;
    }

    setResendTimer(60);
    
    resendOTP({ 
      email: email,
      purpose: 'registration'
    })
      .unwrap()
      .then(() => {
        setOtpSuccess('New verification code sent to your email');
        setOtp('');
        otpRef.current = '';
        setTimeout(() => {
          const input = document.getElementById('otp-input');
          if (input) (input as HTMLInputElement)?.focus();
        }, 100);
      })
      .catch((error) => {
        const message = error.data?.message || 'Failed to resend OTP. Please try again.';
        setOtpError(message);
        setResendTimer(0);
      });
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGoogleLoading(false);
  };

  const getStepTitle = () => {
    if (currentStep === 'account-type') {
      return { title: 'Choose Your Account Type', description: 'Select how you want to use Nuruvent' };
    }
    if (currentStep === 'details') {
      if (accountType === 'account_type_personal') {
        return { title: 'Personal Details', description: 'Enter your personal information' };
      }
      return { title: 'Personal Details', description: 'Enter your personal details' };
    }
    if (currentStep === 'institution-details') {
      return { title: 'Institution Details', description: 'Enter your organization details' };
    }
    if (currentStep === 'otp') {
      return { title: 'Verify Your Email', description: `We've sent a code to ${accountType === 'account_type_institution' ? formData.adminEmail : formData.email}` };
    }
    if (currentStep === 'success') {
      return { title: 'Account Created!', description: 'Welcome to Nuruvent' };
    }
    return { title: '', description: '' };
  };

  const stepInfo = getStepTitle();
  const showBackButton = currentStep !== 'account-type' && currentStep !== 'success';

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

const renderAccountTypeStep = () => {
  const accountTypes = [
    {
      type: 'account_type_personal' as AccountType,
      icon: User,
      label: 'Personal',
      description: 'For trainers, coaches, consultants, freelancers, and attendees',
      features: [
        'Create & host training events',
        'Discover & attend training events',
        'Earn from certificates & tickets',
        'Build your professional brand',
        'Get paid in 7 days',
      ],
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      selectedBorder: 'ring-4 ring-blue-500 border-blue-500 shadow-xl shadow-blue-500/30',
    },
    {
      type: 'account_type_institution' as AccountType,
      icon: Building2,
      label: 'Organization',
      description: 'For universities, companies, professional bodies, and NGOs',
      features: [
        'Multiple trainers & staff',
        'Team management & roles',
        'Bulk reporting & analytics',
        'Branded certificates & events',
        'Bulk attendee registration',
      ],
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      selectedBorder: 'ring-4 ring-purple-500 border-purple-500 shadow-xl shadow-purple-500/30',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with icon */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-gray-200">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Choose Your Account Type</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select how you want to use Nuruvent
        </p>
      </div>

      {/* Mobile: Clean Circles | Desktop: Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 w-full max-w-3xl mx-auto">
        {accountTypes.map((option) => {
          const OptionIcon = option.icon;
          const isSelected = accountType === option.type;

          return (
            <motion.button
              key={option.type}
              onClick={() => handleAccountTypeSelect(option.type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "group relative flex transition-all duration-300 cursor-pointer",
                // Mobile: Clean circle with text below - NO CARD
                "flex-col items-center justify-center gap-1 p-2",
                // Desktop: Full card
                "md:flex-col md:items-start md:p-6 md:rounded-2xl md:gap-0 md:border-2",
                "md:shadow-lg hover:md:shadow-2xl",
                isSelected && "md:ring-4 md:ring-blue-500 md:border-blue-500 md:shadow-xl md:shadow-blue-500/30",
                !isSelected && "md:border-gray-200 md:bg-white md:hover:border-gray-300 md:shadow-md"
              )}
            >
              {/* Glow effect when selected (desktop only) */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none hidden md:block" />
              )}

              {/* Selected badge - Mobile: smaller */}
              {isSelected && (
                <div className={cn(
                  "absolute -top-2 -right-2 bg-green-500 rounded-full shadow-lg shadow-green-500/40 animate-pulse",
                  "p-1 md:p-1.5",
                  "h-5 w-5 md:h-6 md:w-6",
                  "flex items-center justify-center"
                )}>
                  <CheckCircle className={cn(
                    "text-white",
                    "h-3.5 w-3.5 md:h-5 md:w-5"
                  )} />
                </div>
              )}

              {/* Popular badge - Desktop only */}
              {option.type === 'account_type_personal' && !isSelected && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30 hidden md:block">
                  POPULAR
                </div>
              )}

              {/* Icon - Clean circle with gradient - Mobile: No outer circle */}
              <div className={cn(
                "flex items-center justify-center transition-all duration-300",
                // Mobile: Clean circle
                "h-16 w-16 rounded-full",
                // Desktop: Slightly larger
                "md:h-20 md:w-20 md:rounded-2xl",
                option.iconBg,
                "text-white shadow-lg",
                isSelected ? "scale-110 shadow-2xl" : "group-hover:scale-105 group-hover:shadow-xl"
              )}>
                <OptionIcon className={cn(
                  "transition-all duration-300",
                  "h-8 w-8",
                  "md:h-10 md:w-10"
                )} />
              </div>

              {/* Label - Always visible */}
              <span className={cn(
                "font-semibold text-gray-900 transition-colors",
                isSelected ? "text-primary-600" : "",
                // Mobile: Small text below circle
                "text-sm mt-1.5",
                // Desktop: Larger text
                "md:text-xl md:mt-3 md:font-bold"
              )}>
                {option.label}
                {isSelected && (
                  <span className="hidden md:inline text-sm font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-2">
                    Selected
                  </span>
                )}
              </span>

              {/* Description - Desktop only */}
              <p className={cn(
                "text-sm text-gray-500 mt-1 leading-relaxed",
                "hidden md:block"
              )}>
                {option.description}
              </p>

              {/* Features - Desktop only */}
              <div className="hidden md:block mt-4 space-y-2 w-full">
                {option.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className={cn(
                      "flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center",
                      isSelected
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Desktop only */}
              <div className="hidden md:block mt-5 w-full">
                <div className={cn(
                  "w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 text-center",
                  isSelected
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:shadow-md"
                )}>
                  {isSelected ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Account Selected
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Select {option.label}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected indicator - Mobile friendly */}
      {accountType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2.5 rounded-full border-2 border-green-200 shadow-lg shadow-green-500/10 md:px-6 md:py-3"
        >
          <div className="p-0.5 md:p-1 bg-green-500 rounded-full">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <span className="text-green-700">
            <span className="font-bold">
              {accountType === 'account_type_personal' ? 'Individual' : 'Organization'}
            </span>
            {' account selected'}
          </span>
          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-green-500 animate-pulse" />
        </motion.div>
      )}

      {/* "Already have an account?" - More conspicuous */}
      <div className="pt-4 border-t-2 border-gray-200 text-center">
        <p className="text-sm sm:text-base text-gray-700">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-[#1A73E8] font-bold hover:underline hover:text-[#1557B0] transition-colors cursor-pointer text-base sm:text-lg"
          >
            Sign In →
          </Link>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Access your dashboard, manage events, and track your growth
        </p>
      </div>
    </div>
  );
};

 const renderPersonalDetails = () => (
  <div className="space-y-4 sm:space-y-6">
    {/* Google Button - Disabled with Coming Soon badge */}
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        disabled={true}
        className="w-full h-10 sm:h-12 border-gray-200 bg-gray-50 text-gray-800 cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-medium relative z-10"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Coming Soon badge on the right side */}
      <div className="absolute inset-0 rounded-xl flex items-center justify-end pr-3 sm:pr-4 pointer-events-none z-20">
        <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-white/90 px-2.5 py-1 rounded-full border border-gray-300 shadow-sm">
          Coming Soon
        </span>
      </div>
    </div>

    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs sm:text-sm">
        <span className="px-3 sm:px-4 bg-white text-gray-500">or sign up with email</span>
      </div>
    </div>

    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.name && "border-red-500")}
          />
        </div>
        {errors.name && <p className="text-[10px] sm:text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.email && "border-red-500")}
          />
        </div>
        {errors.email && <p className="text-[10px] sm:text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.phone && "border-red-500")}
          />
        </div>
        {errors.phone && <p className="text-[10px] sm:text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Password Section - Generate button beside label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            onClick={handleGeneratePassword}
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/10 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Generate
          </Button>
        </div>
        
        <PasswordInput
          value={formData.password}
          onChange={handlePasswordChange}
          placeholder="Create a strong password"
          required
          showStrength
          showRequirements
          error={passwordError || undefined}
          label={false}
        />
      </div>
    </div>
  </div>
);

 const renderAdminDetails = () => (
  <div className="space-y-3 sm:space-y-4">
    {/* Google Button - Disabled with Coming Soon badge */}
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        disabled={true}
        className="w-full h-10 sm:h-12 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-medium relative z-10"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Coming Soon badge on the right side */}
      <div className="absolute inset-0 rounded-xl flex items-center justify-end pr-3 sm:pr-4 pointer-events-none z-20">
        <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-white/90 px-2.5 py-1 rounded-full border border-gray-300 shadow-sm">
          Coming Soon
        </span>
      </div>
    </div>

    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs sm:text-sm">
        <span className="px-3 sm:px-4 bg-white text-gray-500">or sign up with email</span>
      </div>
    </div>

    {/* Manual Sign-up Form - Fully Enabled */}
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Your Full Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            placeholder="Jane Smith"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.adminName && "border-red-500")}
          />
        </div>
        {errors.adminName && <p className="text-[10px] sm:text-xs text-red-500">{errors.adminName}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Your Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            placeholder="admin@example.com"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.adminEmail && "border-red-500")}
          />
        </div>
        {errors.adminEmail && <p className="text-[10px] sm:text-xs text-red-500">{errors.adminEmail}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Your Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="adminPhone"
            type="tel"
            value={formData.adminPhone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.adminPhone && "border-red-500")}
          />
        </div>
        {errors.adminPhone && <p className="text-[10px] sm:text-xs text-red-500">{errors.adminPhone}</p>}
      </div>

      {/* Password Section - Fully Enabled */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            onClick={handleGeneratePassword}
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/10 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Generate
          </Button>
        </div>
        
        <PasswordInput
          value={formData.password}
          onChange={handlePasswordChange}
          placeholder="Create a strong password"
          required
          showStrength
          showRequirements
          error={passwordError || undefined}
          label={false}
        />
      </div>
    </div>
  </div>
);

  const renderInstitutionDetails = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            placeholder="Nairobi Training Institute"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.institutionName && "border-red-500")}
          />
        </div>
        {errors.institutionName && <p className="text-[10px] sm:text-xs text-red-500">{errors.institutionName}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionEmail"
            type="email"
            value={formData.institutionEmail}
            onChange={handleChange}
            placeholder="info@institute.com"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.institutionEmail && "border-red-500")}
          />
        </div>
        {errors.institutionEmail && <p className="text-[10px] sm:text-xs text-red-500">{errors.institutionEmail}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            name="institutionPhone"
            type="tel"
            value={formData.institutionPhone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-8 sm:pl-9 h-9 sm:h-10 text-sm cursor-text", errors.institutionPhone && "border-red-500")}
          />
        </div>
        {errors.institutionPhone && <p className="text-[10px] sm:text-xs text-red-500">{errors.institutionPhone}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs sm:text-sm font-medium text-gray-700">
          Organization Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.institutionType}
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, institutionType: value }));
            if (errors.institutionType) setErrors(prev => ({ ...prev, institutionType: '' }));
          }}
        >
          <SelectTrigger className={cn("h-9 sm:h-10 text-sm cursor-pointer", errors.institutionType && "border-red-500")}>
            <SelectValue placeholder="Select organization type" />
          </SelectTrigger>
          <SelectContent>
            {institutionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="cursor-pointer text-sm">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.institutionType && <p className="text-[10px] sm:text-xs text-red-500">{errors.institutionType}</p>}
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-4 sm:space-y-6 text-center">
      <div className="flex justify-center">
        <div className="p-3 sm:p-4 rounded-full bg-[#1A73E8]/10">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-[#1A73E8]" />
        </div>
      </div>

      <div>
        <p className="text-xs sm:text-sm text-gray-500">
          We&apos;ve sent a verification code to:
        </p>
        <p className="text-[#1A73E8] font-medium text-xs sm:text-sm mt-1 break-all">
          {accountType === 'account_type_institution' ? formData.adminEmail : formData.email}
        </p>
      </div>

      {/* Success Message */}
      {otpSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm">
          {otpSuccess}
        </div>
      )}

      {/* Error Message */}
      {otpError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {otpError}
        </div>
      )}

      {/* ✅ Reusable OTP Input - NO onComplete to avoid auto-verify */}
      <OtpInput
        id="otp-input"
        value={otp}
        onChange={handleOtpChange}
        length={6}
        placeholder="Enter verification code"
        disabled={isLoadingCombined}
        error={otpError}
        autoFocus={true}
        // ✅ No onComplete - API only called on button click
      />

      <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-xs sm:text-sm">
        <span className="text-gray-500">
          Code expires in {resendTimer > 0 ? resendTimer : 0}s
        </span>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendTimer > 0 || isResendLoading}
          className={cn(
            "flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
            (resendTimer > 0 || isResendLoading)
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#1A73E8] hover:underline"
          )}
        >
          {isResendLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Resend code
            </>
          )}
        </button>
      </div>

      {/* ✅ Verify button - API called only when clicked */}
      <Button
        onClick={handleVerifyOtp}
        disabled={isVerifyLoading || isLoading || otp.length !== 6}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isVerifyLoading || isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </Button>
    </div>
  );

  const renderSuccessStep = () => {
    const displayName = accountType === 'account_type_institution' 
      ? formData.adminName 
      : formData.name;
    
    const accountLabel = accountType === 'account_type_institution' ? 'Institution' : 'Personal';

    return (
      <div className="space-y-4 sm:space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Welcome to Nuruvent,{' '}
            <span className="font-medium text-gray-900">{displayName}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-400">Manage Your Events. Get Paid. Build Your Brand.</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-left space-y-1.5 sm:space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-gray-500">Email:</span>
            <span className="font-medium text-gray-900 truncate">
              {accountType === 'account_type_institution' ? formData.adminEmail : formData.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-gray-500">Account Type:</span>
            <span className="font-medium text-gray-900">{accountLabel}</span>
          </div>
          {accountType === 'account_type_institution' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-gray-500">Institution:</span>
              <span className="font-medium text-gray-900 truncate">{formData.institutionName}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full border-gray-200 hover:border-[#1A73E8]/50 text-gray-600 hover:text-[#1A73E8] font-medium py-4 sm:py-5 text-sm sm:text-base rounded-xl transition-all duration-300 cursor-pointer"
          >
            Explore Events
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4 overflow-hidden bg-white">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-white/80 to-white/60" />
      
      {/* Dot Pattern - Hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <svg className="absolute left-4 sm:left-8 top-4 sm:top-8 h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80 opacity-40" viewBox="0 0 200 200" fill="none">
          <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Background Glow - Hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/3 left-8 sm:left-12 w-64 h-64 sm:w-96 sm:h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-8 sm:bottom-12 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-0.5 sm:mt-1">Join Nuruvent and start your professional journey</p>
        </div>

        {/* Card */}
        <Card className="relative bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            {showBackButton && (
              <div className="flex justify-start mb-1.5 sm:mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 px-2 sm:px-3 py-1 h-auto text-xs sm:text-sm font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  Back
                </Button>
              </div>
            )}

            <div className="mb-3 sm:mb-4 pt-0.5 sm:pt-1">
              <Stepper 
                currentStep={currentStepNumber} 
                totalSteps={steps.total} 
                labels={steps.labels} 
              />
            </div>

            <div className="text-center mt-1.5 sm:mt-2">
              <div className="p-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stepInfo.title}
                </h2>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                  {stepInfo.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-1 sm:pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'account-type' && renderAccountTypeStep()}
                {currentStep === 'details' && (
                  accountType === 'account_type_personal' ? renderPersonalDetails() : renderAdminDetails()
                )}
                {currentStep === 'institution-details' && renderInstitutionDetails()}
                {currentStep === 'otp' && renderOtpStep()}
                {currentStep === 'success' && renderSuccessStep()}

                {currentStep !== 'account-type' && currentStep !== 'otp' && currentStep !== 'success' && (
                  <div className="mt-4 sm:mt-6">
                    <Button
                      onClick={handleNext}
                      disabled={isLoadingCombined}
                      className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoadingCombined ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          {accountType === 'account_type_institution' && currentStep === 'institution-details' 
                            ? 'Creating Account...' 
                            : 'Loading...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {accountType === 'account_type_institution' && currentStep === 'institution-details' 
                            ? 'Create Account' 
                            : 'Continue'}
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="text-center mt-4 sm:mt-6">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400">
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-2.5 sm:h-3 bg-gray-300" />
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </div>
      </div>
    </div>
  );
}