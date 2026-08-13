'use client';

import { useState, useEffect } from 'react';
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
  Loader2
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

// ============================================================
// TYPES
// ============================================================

type AccountType = 'personal' | 'institution' | null;
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
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all flex-shrink-0",
                  isActive && "bg-[#1A73E8] text-white ring-4 ring-[#1A73E8]/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium hidden xs:block",
                  isActive && "text-gray-900",
                  isCompleted && "text-gray-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {labels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 mx-1 sm:mx-2 h-0.5 bg-gray-200">
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

  // State
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [currentStep, setCurrentStep] = useState<Step>('account-type');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

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

  // Institution types (matches backend slugs)
  const institutionTypes = [
    { value: 'training_institute', label: 'Training Institute' },
    { value: 'professional_body', label: 'Professional Body' },
    { value: 'ngo', label: 'NGO / Non-Profit' },
    { value: 'corporate', label: 'Corporate Company' },
    { value: 'government', label: 'Government Agency' },
    { value: 'university', label: 'University / College' },
    { value: 'other', label: 'Other' },
  ];

  // OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Get step info
  const getSteps = () => {
    if (accountType === 'institution') {
      return { total: 5, labels: ['Type', 'Admin', 'Institution', 'OTP', 'Done'] };
    }
    return { total: 4, labels: ['Type', 'Details', 'OTP', 'Done'] };
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'account-type': return 1;
      case 'details': return 2;
      case 'institution-details': return 3;
      case 'otp': return accountType === 'institution' ? 4 : 3;
      case 'success': return accountType === 'institution' ? 5 : 4;
      default: return 1;
    }
  };

  const steps = getSteps();
  const currentStepNumber = getStepNumber();

  // Handlers
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
        setOtp(['', '', '', '', '', '']);
        if (accountType === 'institution') {
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement)?.focus();
    }
  };

  const validatePersonal = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
    if (accountType === 'personal') {
      if (!validatePersonal()) return;
      setCurrentStep('otp');
    } else {
      // Institution flow
      if (currentStep === 'details') {
        if (!validateAdmin()) return;
        setCurrentStep('institution-details');
      } else if (currentStep === 'institution-details') {
        if (!validateInstitution()) return;
        setCurrentStep('otp');
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the full 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentStep('success');
  };

  const handleResendOtp = () => {
    setResendTimer(60);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGoogleLoading(false);
    // window.location.href = '/api/auth/google';
  };

  const getStepTitle = () => {
    if (currentStep === 'account-type') {
      return { title: 'Choose Your Account Type', description: 'Select how you want to use Nuruvent' };
    }
    if (currentStep === 'details') {
      if (accountType === 'personal') {
        return { title: 'Personal Details', description: 'Enter your personal information' };
      }
      return { title: 'Admin Details', description: 'Enter the administrator details' };
    }
    if (currentStep === 'institution-details') {
      return { title: 'Institution Details', description: 'Enter your organization details' };
    }
    if (currentStep === 'otp') {
      return { title: 'Verify Your Email', description: `We've sent a code to ${accountType === 'institution' ? formData.adminEmail : formData.email}` };
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

  const renderAccountTypeStep = () => (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        {/* Radio-style buttons - Clean and minimal */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {[
            { 
              type: 'personal' as AccountType, 
              icon: UserCircle, 
              label: 'Personal',
              description: 'Individual user'
            },
            { 
              type: 'institution' as AccountType, 
              icon: Building, 
              label: 'Institution',
              description: 'Organization account'
            }
          ].map((option) => {
            const OptionIcon = option.icon;
            const isSelected = accountType === option.type;
            
            return (
              <button
                key={option.type}
                onClick={() => handleAccountTypeSelect(option.type)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-[#1A73E8] bg-[#1A73E8]/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#1A73E8] text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <OptionIcon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-gray-900" : "text-gray-700"
                )}>
                  {option.label}
                </span>
                <span className="text-[10px] text-gray-400">{option.description}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1A73E8] flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {accountType && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <Check className="h-3.5 w-3.5" />
            <span>{accountType === 'personal' ? 'Personal' : 'Institution'} account selected</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      {/* Continue with Google Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        className="w-full h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 text-base font-medium text-gray-700"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or sign up with email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={cn("pl-9 cursor-text", errors.name && "border-red-500")}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={cn("pl-9 cursor-text", errors.email && "border-red-500")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0712345678"
              className={cn("pl-9 cursor-text", errors.phone && "border-red-500")}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className={cn("pl-9 pr-10 cursor-text", errors.password && "border-red-500")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  formData.password.length === 0 && "w-0",
                  formData.password.length > 0 && formData.password.length < 4 && "w-1/3 bg-red-500",
                  formData.password.length >= 4 && formData.password.length < 8 && "w-2/3 bg-yellow-500",
                  formData.password.length >= 8 && "w-full bg-green-500"
                )}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              {formData.password.length === 0 && 'Enter password'}
              {formData.password.length > 0 && formData.password.length < 4 && 'Weak'}
              {formData.password.length >= 4 && formData.password.length < 8 && 'Medium'}
              {formData.password.length >= 8 && 'Strong'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDetails = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Admin Full Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            placeholder="Jane Smith"
            className={cn("pl-9 cursor-text", errors.adminName && "border-red-500")}
          />
        </div>
        {errors.adminName && <p className="text-xs text-red-500">{errors.adminName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Admin Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            placeholder="admin@example.com"
            className={cn("pl-9 cursor-text", errors.adminEmail && "border-red-500")}
          />
        </div>
        {errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Admin Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="adminPhone"
            type="tel"
            value={formData.adminPhone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-9 cursor-text", errors.adminPhone && "border-red-500")}
          />
        </div>
        {errors.adminPhone && <p className="text-xs text-red-500">{errors.adminPhone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 characters"
            className={cn("pl-9 pr-10 cursor-text", errors.password && "border-red-500")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                formData.password.length === 0 && "w-0",
                formData.password.length > 0 && formData.password.length < 4 && "w-1/3 bg-red-500",
                formData.password.length >= 4 && formData.password.length < 8 && "w-2/3 bg-yellow-500",
                formData.password.length >= 8 && "w-full bg-green-500"
              )}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {formData.password.length === 0 && 'Enter password'}
            {formData.password.length > 0 && formData.password.length < 4 && 'Weak'}
            {formData.password.length >= 4 && formData.password.length < 8 && 'Medium'}
            {formData.password.length >= 8 && 'Strong'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderInstitutionDetails = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Institution Name <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            placeholder="Nairobi Training Institute"
            className={cn("pl-9 cursor-text", errors.institutionName && "border-red-500")}
          />
        </div>
        {errors.institutionName && <p className="text-xs text-red-500">{errors.institutionName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Institution Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="institutionEmail"
            type="email"
            value={formData.institutionEmail}
            onChange={handleChange}
            placeholder="info@institute.com"
            className={cn("pl-9 cursor-text", errors.institutionEmail && "border-red-500")}
          />
        </div>
        {errors.institutionEmail && <p className="text-xs text-red-500">{errors.institutionEmail}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Institution Phone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="institutionPhone"
            type="tel"
            value={formData.institutionPhone}
            onChange={handleChange}
            placeholder="0712345678"
            className={cn("pl-9 cursor-text", errors.institutionPhone && "border-red-500")}
          />
        </div>
        {errors.institutionPhone && <p className="text-xs text-red-500">{errors.institutionPhone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Institution Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.institutionType}
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, institutionType: value }));
            if (errors.institutionType) setErrors(prev => ({ ...prev, institutionType: '' }));
          }}
        >
          <SelectTrigger className={cn("cursor-pointer", errors.institutionType && "border-red-500")}>
            <SelectValue placeholder="Select institution type" />
          </SelectTrigger>
          <SelectContent>
            {institutionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.institutionType && <p className="text-xs text-red-500">{errors.institutionType}</p>}
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-[#1A73E8]/10">
          <Mail className="h-8 w-8 text-[#1A73E8]" />
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          We&apos;ve sent a verification code to:
        </p>
        <p className="text-[#1A73E8] font-medium text-sm mt-1">
          {accountType === 'institution' ? formData.adminEmail : formData.email}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className={cn(
              "w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-xl border-2 transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 cursor-text",
              errors.otp
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 focus:border-[#1A73E8]"
            )}
            autoFocus={index === 0}
          />
        ))}
      </div>
      {errors.otp && <p className="text-xs text-red-500 text-center">{errors.otp}</p>}

      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="text-gray-500">Code expires in 4:59</span>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendTimer > 0}
          className={cn(
            "text-[#1A73E8] font-medium hover:underline transition-colors cursor-pointer",
            resendTimer > 0 && "text-gray-400 hover:no-underline cursor-not-allowed"
          )}
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
        </button>
      </div>

      <Button
        onClick={handleVerifyOtp}
        disabled={isLoading}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </Button>
    </div>
  );

  const renderSuccessStep = () => {
    const displayName = accountType === 'institution' 
      ? formData.adminName 
      : formData.name;
    
    const accountLabel = accountType === 'institution' ? 'Institution' : 'Personal';

    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-500 mt-1">
            Welcome to Nuruvent,{' '}
            <span className="font-medium text-gray-900">{displayName}</span>
          </p>
          <p className="text-sm text-gray-400">Manage Your Events. Get Paid. Build Your Brand.</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Email:</span>
            <span className="font-medium text-gray-900">
              {accountType === 'institution' ? formData.adminEmail : formData.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Account Type:</span>
            <span className="font-medium text-gray-900">{accountLabel}</span>
          </div>
          {accountType === 'institution' && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Institution:</span>
              <span className="font-medium text-gray-900">{formData.institutionName}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full border-gray-200 hover:border-[#1A73E8]/50 text-gray-600 hover:text-[#1A73E8] font-medium py-5 rounded-xl transition-all duration-300 cursor-pointer"
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
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-white">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-white/80 to-white/60" />
      
      {/* Dot Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40" viewBox="0 0 200 200" fill="none">
          <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 mt-1">Join Nuruvent and start your professional journey</p>
        </div>

        {/* Card */}
        <Card className="relative bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60">
          <CardHeader className="pb-4">
            {/* Back Button - Positioned above stepper */}
            {showBackButton && (
              <div className="flex justify-start mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 px-3 py-1.5 h-auto text-sm font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
              </div>
            )}

            {/* Stepper */}
            <div className="mb-4 pt-1">
              <Stepper 
                currentStep={currentStepNumber} 
                totalSteps={steps.total} 
                labels={steps.labels} 
              />
            </div>

            {/* Step Title - Single, no duplication */}
            <div className="text-center mt-2">
              <div className="p-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {stepInfo.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {stepInfo.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
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
                  accountType === 'personal' ? renderPersonalDetails() : renderAdminDetails()
                )}
                {currentStep === 'institution-details' && renderInstitutionDetails()}
                {currentStep === 'otp' && renderOtpStep()}
                {currentStep === 'success' && renderSuccessStep()}

                {/* Navigation Buttons */}
                {currentStep !== 'account-type' && currentStep !== 'otp' && currentStep !== 'success' && (
                  <div className="mt-6">
                    <Button
                      onClick={handleNext}
                      className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {accountType === 'institution' && currentStep === 'institution-details' 
                          ? 'Create Account' 
                          : 'Continue'}
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        {currentStep !== 'success' && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-[#1A73E8] font-medium hover:underline cursor-pointer">
                Sign In
              </Link>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-3 bg-gray-300" />
            <Sparkles className="h-3 w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </div>
      </div>
    </div>
  );
}