'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Building2,
  Briefcase,
  Users,
  Sparkles,
  Shield,
  Clock,
  Mail,
  Phone,
  Lock,
  User,
  CheckCircle,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

const slideIn = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

type UserType = 'attendee' | 'individual' | 'organization' | null;
type IndividualType = 'informal' | 'formal' | null;
type Step = 'user-type' | 'individual-type' | 'form' | 'otp' | 'success';

export function SignUpForm() {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState<Step>('user-type');
  const [userType, setUserType] = useState<UserType>(null);
  const [individualType, setIndividualType] = useState<IndividualType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    { value: 'training_institute', label: 'Training Institute' },
    { value: 'professional_body', label: 'Professional Body' },
    { value: 'ngo', label: 'NGO' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'government', label: 'Government' },
    { value: 'college', label: 'College' },
  ];

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (currentStep !== 'user-type') {
        // eslint-disable-next-line react-hooks/immutability
        handleBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep]);

  const pushHistoryState = () => {
    window.history.pushState({ step: currentStep }, '', '');
  };

  const navigateToStep = (step: Step) => {
    setCurrentStep(step);
    pushHistoryState();
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === 'individual') {
      navigateToStep('individual-type');
    } else {
      navigateToStep('form');
    }
  };

  const handleIndividualTypeSelect = (type: IndividualType) => {
    setIndividualType(type);
    navigateToStep('form');
  };

  const handleBack = () => {
    if (currentStep === 'individual-type') {
      navigateToStep('user-type');
      setUserType(null);
      setIndividualType(null);
    } else if (currentStep === 'form') {
      if (userType === 'individual') {
        navigateToStep('individual-type');
      } else {
        navigateToStep('user-type');
        setUserType(null);
        setIndividualType(null);
      }
    } else if (currentStep === 'otp') {
      navigateToStep('form');
    }
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
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (userType === 'attendee' || (userType === 'individual' && individualType === 'informal')) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }
    
    if (userType === 'individual' && individualType === 'formal') {
      if (!formData.businessName) newErrors.businessName = 'Business name is required';
      if (!formData.businessEmail) newErrors.businessEmail = 'Business email is required';
      if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
    }
    
    if (userType === 'organization') {
      if (!formData.businessName) newErrors.businessName = 'Organization name is required';
      if (!formData.businessEmail) newErrors.businessEmail = 'Organization email is required';
      if (!formData.businessPhone) newErrors.businessPhone = 'Organization phone is required';
      if (!formData.businessType) newErrors.businessType = 'Organization type is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigateToStep('otp');
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
    navigateToStep('success');
  };

  const handleResendOtp = () => {
    setResendTimer(60);
  };

  const getFormInfo = () => {
    if (userType === 'attendee') {
      return {
        title: 'Create Attendee Account',
        description: 'Join events, learn, and grow your skills',
        icon: User,
        color: 'blue'
      };
    }
    if (userType === 'individual' && individualType === 'informal') {
      return {
        title: 'Create Trainer / Coach Account',
        description: 'Register as a freelance trainer, coach, or consultant',
        icon: User,
        color: 'gold'
      };
    }
    if (userType === 'individual' && individualType === 'formal') {
      return {
        title: 'Register Your Training Business',
        description: 'Register as a professional training business or consultancy',
        icon: Building2,
        color: 'gold'
      };
    }
    if (userType === 'organization') {
      return {
        title: 'Register Your Organization',
        description: 'Register your training institute, NGO, or corporate organization',
        icon: Building2,
        color: 'green'
      };
    }
    return { title: '', description: '', icon: User, color: 'blue' };
  };

  const formInfo = getFormInfo();
  const IconComponent = formInfo.icon;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string, text: string, border: string, ring: string, light: string, hover: string }> = {
      blue: {
        bg: '#1A73E8',
        text: 'text-[#1A73E8]',
        border: 'border-[#1A73E8]',
        ring: 'ring-[#1A73E8]/20',
        light: 'bg-[#1A73E8]/5',
        hover: 'hover:border-[#1A73E8]/50'
      },
      gold: {
        bg: '#FBBC04',
        text: 'text-[#FBBC04]',
        border: 'border-[#FBBC04]',
        ring: 'ring-[#FBBC04]/20',
        light: 'bg-[#FBBC04]/5',
        hover: 'hover:border-[#FBBC04]/50'
      },
      green: {
        bg: '#34A853',
        text: 'text-[#34A853]',
        border: 'border-[#34A853]',
        ring: 'ring-[#34A853]/20',
        light: 'bg-[#34A853]/5',
        hover: 'hover:border-[#34A853]/50'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(formInfo.color);

  // Render User Type Selection
  const renderUserTypeStep = () => (
    <motion.div
      key="user-type"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Account Type</h2>
        <p className="text-gray-600 mt-1">Select how you want to use Nuruvent</p>
      </motion.div>

      <motion.div 
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            type: 'attendee' as UserType,
            icon: User,
            title: 'Attendee',
            description: 'Join events & learn',
            features: ['Join training events', 'Get certificates', 'Watch replays'],
            color: 'blue'
          },
          {
            type: 'individual' as UserType,
            icon: Users,
            title: 'Trainer / Coach',
            description: 'Independent trainer or consultant',
            features: ['Host training events', 'Sell tickets', 'Issue certificates'],
            color: 'gold'
          },
          {
            type: 'organization' as UserType,
            icon: Building2,
            title: 'Organization',
            description: 'Institute, NGO, Corporate, Government',
            features: ['Host events', 'Manage teams', 'Track analytics'],
            color: 'green'
          }
        ].map((option) => {
          const OptionIcon = option.icon;
          const color = getColorClasses(option.color);
          
          return (
            <motion.button
              key={option.type}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUserTypeSelect(option.type)}
              className={cn(
                "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer bg-white/80 backdrop-blur-sm",
                userType === option.type
                  ? `${color.border} ${color.light} shadow-lg`
                  : `border-gray-200 hover:border-gray-300`
              )}
            >
              <OptionIcon className={cn(
                "h-10 w-10 mb-3 transition-colors",
                userType === option.type ? color.text : "text-gray-400 group-hover:text-gray-600"
              )} />
              <h3 className="text-lg font-semibold text-gray-800">{option.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              <ul className="mt-3 space-y-1">
                {option.features.map((feature, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#1A73E8]" />
                    {feature}
                  </li>
                ))}
              </ul>
              {userType === option.type && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A73E8] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );

  // Render Individual Type Selection
  const renderIndividualTypeStep = () => (
    <motion.div
      key="individual-type"
      variants={slideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Are You Registered as a Business?</h2>
        <p className="text-gray-600 mt-1">Choose the option that applies to you</p>
      </motion.div>

      <motion.div 
        variants={fadeInUp}
        className="space-y-4"
      >
        {[
          {
            type: 'formal' as IndividualType,
            icon: Building2,
            title: 'Yes - Registered Training Business',
            description: 'Formal Individual Professional',
            details: ['Registered business name', 'Business email & phone', 'Professional branding'],
            color: 'gold'
          },
          {
            type: 'informal' as IndividualType,
            icon: User,
            title: 'No - Freelance Trainer / Coach',
            description: 'Informal Individual Professional',
            details: ['Personal email & phone', 'No registration required', 'Flexible setup'],
            color: 'gold'
          }
        ].map((option) => {
          const OptionIcon = option.icon;
          const color = getColorClasses(option.color);
          
          return (
            <motion.button
              key={option.type}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleIndividualTypeSelect(option.type)}
              className={cn(
                "w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer bg-white/80 backdrop-blur-sm",
                individualType === option.type
                  ? `${color.border} ${color.light} shadow-lg`
                  : `border-gray-200 hover:border-gray-300`
              )}
            >
              <div className="flex items-start gap-4">
                <OptionIcon className={cn(
                  "h-8 w-8 mt-1 transition-colors",
                  individualType === option.type ? color.text : "text-gray-400"
                )} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{option.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  <ul className="mt-2 space-y-1">
                    {option.details.map((detail, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#1A73E8]" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all",
                  individualType === option.type
                    ? `${color.border} bg-[${color.bg}]`
                    : "border-gray-300"
                )}>
                  {individualType === option.type && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );

  // Render Form Step
  const renderFormStep = () => {
    const color = getColorClasses(formInfo.color);
    
    return (
      <motion.div
        key="form"
        variants={slideIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="text-center">
          <div className={`flex justify-center mb-4`}>
            <div className={`p-3 rounded-full ${color.light}`}>
              <IconComponent className={`h-8 w-8 ${color.text}`} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{formInfo.title}</h2>
          <p className="text-gray-600 mt-1">{formInfo.description}</p>
          {userType === 'individual' && individualType && (
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 ${color.light} rounded-full text-xs ${color.text}`}>
              <span className="font-medium">
                {individualType === 'informal' ? 'Freelance' : 'Registered'} Professional
              </span>
            </div>
          )}
        </motion.div>

        <motion.form 
          variants={fadeInUp}
          onSubmit={handleRegister} 
          className="space-y-4 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg"
        >
          {/* Attendee & Informal Individual Fields */}
          {(userType === 'attendee' || (userType === 'individual' && individualType === 'informal')) && (
            <>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
                      errors.fullName
                        ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                        : "border-gray-200"
                    )}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-[#EA4335] mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
                        errors.email
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.email}</p>
                  )}
                  {userType === 'individual' && individualType === 'informal' && (
                    <p className="text-xs text-gray-400 mt-1">This will be your login email</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
                        errors.phone
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">M-Pesa number for payments and notifications</p>
                </div>
              </div>
            </>
          )}

          {/* Formal Individual Fields */}
          {userType === 'individual' && individualType === 'formal' && (
            <>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business / Training Name <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FBBC04] transition-colors" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Peter Formal Training & Consulting"
                    required
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#FBBC04] focus:ring-2 focus:ring-[#FBBC04]/20",
                      errors.businessName
                        ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                        : "border-gray-200"
                    )}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-[#EA4335] mt-1">{errors.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business Email <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FBBC04] transition-colors" />
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      placeholder="info@yourbusiness.com"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#FBBC04] focus:ring-2 focus:ring-[#FBBC04]/20",
                        errors.businessEmail
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.businessEmail}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">This will be your login email</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business Phone <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FBBC04] transition-colors" />
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#FBBC04] focus:ring-2 focus:ring-[#FBBC04]/20",
                        errors.businessPhone
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.businessPhone}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Organization Fields */}
          {userType === 'organization' && (
            <>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization Name <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#34A853] transition-colors" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Nuruvent Training Institute"
                    required
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#34A853] focus:ring-2 focus:ring-[#34A853]/20",
                      errors.businessName
                        ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                        : "border-gray-200"
                    )}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-[#EA4335] mt-1">{errors.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization Email <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#34A853] transition-colors" />
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      placeholder="info@yourorganization.com"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#34A853] focus:ring-2 focus:ring-[#34A853]/20",
                        errors.businessEmail
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.businessEmail}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">This will be your login email</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization Phone <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#34A853] transition-colors" />
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#34A853] focus:ring-2 focus:ring-[#34A853]/20",
                        errors.businessPhone
                          ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                          : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="text-xs text-[#EA4335] mt-1">{errors.businessPhone}</p>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization Type <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#34A853] transition-colors" />
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className={cn(
                      "w-full pl-10 pr-10 py-3 rounded-xl border transition-all appearance-none bg-white focus:bg-white focus:border-[#34A853] focus:ring-2 focus:ring-[#34A853]/20",
                      errors.businessType
                        ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                        : "border-gray-200"
                    )}
                  >
                    <option value="">Select organization type</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.businessType && (
                  <p className="text-xs text-[#EA4335] mt-1">{errors.businessType}</p>
                )}
              </div>
            </>
          )}

          {/* Password - Common for all */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-[#EA4335]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A73E8] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className={cn(
                  "w-full pl-10 pr-12 py-3 rounded-xl border transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
                  errors.password
                    ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                    : "border-gray-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#EA4335] mt-1">{errors.password}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div className={cn(
                  "h-full transition-all duration-300",
                  formData.password.length === 0 && "w-0",
                  formData.password.length > 0 && formData.password.length < 4 && "w-1/3 bg-[#EA4335]",
                  formData.password.length >= 4 && formData.password.length < 8 && "w-2/3 bg-[#FBBC04]",
                  formData.password.length >= 8 && "w-full bg-[#34A853]"
                )} />
              </div>
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                {formData.password.length === 0 && 'Enter password'}
                {formData.password.length > 0 && formData.password.length < 4 && 'Weak'}
                {formData.password.length >= 4 && formData.password.length < 8 && 'Medium'}
                {formData.password.length >= 8 && 'Strong'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A73E8] focus:ring-[#1A73E8] transition-colors cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-[#1A73E8] hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#1A73E8] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </motion.form>
      </motion.div>
    );
  };

  // Render OTP Step
  const renderOtpStep = () => (
    <motion.div
      key="otp"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-[#1A73E8]/10">
            <Mail className="h-8 w-8 text-[#1A73E8]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600 mt-1">
          We&apos;ve sent a verification code to:
        </p>
        <p className="text-[#1A73E8] font-medium text-sm mt-0.5 bg-[#1A73E8]/5 inline-block px-3 py-1 rounded-full">
          {formData.businessEmail || formData.email}
        </p>
      </motion.div>

      <div className="space-y-4 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
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
                "w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all bg-white focus:bg-white focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20",
                errors.otp
                  ? "border-[#EA4335] focus:border-[#EA4335] focus:ring-[#EA4335]/20"
                  : "border-gray-200 focus:border-[#1A73E8]"
              )}
              autoFocus={index === 0}
            />
          ))}
        </div>
        {errors.otp && (
          <p className="text-xs text-[#EA4335] text-center">{errors.otp}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Code expires in 4:59</span>
          </div>
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
      </div>

      <Button
        onClick={handleVerifyOtp}
        disabled={isLoading}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#1A73E8]/25 hover:shadow-[#1A73E8]/40 transition-all duration-300 cursor-pointer"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </Button>
    </motion.div>
  );

  // Render Success Step
  const renderSuccessStep = () => {
    const userTypeLabel = {
      attendee: 'Attendee',
      'individual-informal': 'Freelance Trainer / Coach',
      'individual-formal': 'Registered Training Business',
      organization: 'Organization'
    };
    
    const label = userType === 'individual' 
      ? individualType === 'informal' 
        ? userTypeLabel['individual-informal']
        : userTypeLabel['individual-formal']
      : userType === 'attendee' 
        ? userTypeLabel.attendee
        : userTypeLabel.organization;

    return (
      <motion.div
        key="success"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-[#34A853]/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-[#34A853]" />
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-gray-800">Account Created!</h2>
          <p className="text-gray-600 mt-1">
            Welcome to Nuruvent,{' '}
            <span className="font-medium text-gray-800">
              {formData.fullName || formData.businessName}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Manage Your Events. Get Paid. Build Your Brand.</p>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-left space-y-2 border border-gray-100"
        >
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Email:</span>
            <span className="font-medium text-gray-800">
              {formData.businessEmail || formData.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Account Type:</span>
            <span className="font-medium text-gray-800">{label}</span>
          </div>
          {userType !== 'attendee' && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Business:</span>
              <span className="font-medium text-gray-800">{formData.businessName}</span>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
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
        </motion.div>
      </motion.div>
    );
  };

  const showBackButton = currentStep !== 'user-type' && currentStep !== 'success';
  const showSignIn = currentStep === 'user-type' || currentStep === 'form';

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-white">
      {/* Background Image with Whitish Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      
      {/* Whitish Overlay - Hero Style */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-white/80 to-white/60" />
      
     {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80 opacity-40"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Your Account</h1>
          <p className="text-sm text-gray-600 mt-0.5">Join Nuruvent and start your professional journey</p>
          <p className="text-xs text-gray-400 mt-1">Manage Your Events. Get Paid. Build Your Brand.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8"
        >
          {/* Back Button */}
          {showBackButton && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-12 left-0 z-20"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 'user-type' && renderUserTypeStep()}
            {currentStep === 'individual-type' && renderIndividualTypeStep()}
            {currentStep === 'form' && renderFormStep()}
            {currentStep === 'otp' && renderOtpStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </AnimatePresence>

          {/* Sign In Link */}
          {showSignIn && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/signin" className="text-[#1A73E8] font-medium hover:underline cursor-pointer">
                  Sign In
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-3 bg-gray-300" />
            <Sparkles className="h-3 w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}