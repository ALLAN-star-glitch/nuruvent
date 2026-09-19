// components/registration/SignupFlow.tsx

'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Shield, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { getStepMeta, stepAnimationKey } from './constants';
import { useSignupForm } from './useSignupForm';

import { StepIndicator } from './StepIndicator';
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { InstitutionAdminStep } from './steps/InstitutionAdminStep';
import { InstitutionDetailsStep } from './steps/InstitutionDetailsStep';
import { OtpStep } from './steps/OtpStep';
import { SuccessStep } from './steps/SuccessStep';
import { AccountTypeStep } from './steps/AccountTypeSteps';

// ============================================================
// COMPONENT
// ============================================================

export function SignupFlow() {
  const router = useRouter();

  const form = useSignupForm();

  const meta = getStepMeta(form.currentStep, form.accountType);
  const animationKey = stepAnimationKey(form.currentStep, form.accountType);

  const showContinueButton =
    form.currentStep !== 'account-type' &&
    form.currentStep !== 'otp' &&
    form.currentStep !== 'success';

  const continueLabel = computeContinueLabel(
    form.accountType,
    form.currentStep,
  );

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleExploreEvents = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4 overflow-hidden bg-background">
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />

      {/* Dot pattern (hidden on mobile) */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <svg
          className="absolute left-4 sm:left-8 top-4 sm:top-8 h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80 opacity-40"
          viewBox="0 0 200 200"
          fill="none"
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

      {/* Glow (hidden on mobile) */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/3 left-8 sm:left-12 w-64 h-64 sm:w-96 sm:h-96 bg-[#1A73E8]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-8 sm:bottom-12 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-[#FBBC04]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Page header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Create Your Account
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-0.5 sm:mt-1">
            Join Nuruvent and start your professional journey
          </p>
        </div>

        {/* Card */}
        <Card className="relative bg-card/80 backdrop-blur-xl shadow-2xl border border-border">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            {/* Back button */}
            {form.canGoBack && (
              <div className="flex justify-start mb-1.5 sm:mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={form.goBack}
                  disabled={form.isLoading}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent px-2 sm:px-3 py-1 h-auto text-xs sm:text-sm font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  Back
                </Button>
              </div>
            )}

            {/* Step indicator */}
            <div className="mb-3 sm:mb-4 pt-0.5 sm:pt-1">
              <StepIndicator
                currentStep={meta.number}
                labels={meta.labels}
              />
            </div>

            {/* Step title + description */}
            <div className="text-center mt-1.5 sm:mt-2">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {meta.title}
              </h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                {meta.description}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-1 sm:pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {form.currentStep === 'account-type' && (
                  <AccountTypeStep
                    selected={form.accountType}
                    onSelect={form.selectAccountType}
                  />
                )}

                {form.currentStep === 'details' &&
                  (form.accountType === 'account_type_personal' ? (
                    <PersonalDetailsStep
                      formData={form.formData}
                      errors={form.errors}
                      passwordError={form.passwordError}
                      professionalTypes={form.professionalTypes}
                      onChange={form.changeField}
                      onProfessionalTypeChange={form.changeProfessionalType}
                      onPasswordChange={form.changePassword}
                      onGeneratePassword={form.generatePassword}
                    />
                  ) : (
                    <InstitutionAdminStep
                      formData={form.formData}
                      errors={form.errors}
                      passwordError={form.passwordError}
                      onChange={form.changeField}
                      onPasswordChange={form.changePassword}
                      onGeneratePassword={form.generatePassword}
                    />
                  ))}

                {form.currentStep === 'institution-details' && (
                  <InstitutionDetailsStep
                    formData={form.formData}
                    errors={form.errors}
                    institutionTypes={form.institutionTypes}
                    onChange={form.changeField}
                    onInstitutionTypeChange={form.changeInstitutionType}
                  />
                )}

                {form.currentStep === 'otp' && (
                  <OtpStep
                    email={resolveDisplayEmail(form)}
                    isVerifying={form.isVerifying}
                    isResending={form.isResending}
                    error={form.otpError}
                    successMessage={form.otpSuccess}
                    onVerify={form.verifyOtp}
                    onResend={form.resendOtp}
                    onBack={form.goBack}
                  />
                )}

                {form.currentStep === 'success' && form.accountType && (
                  <SuccessStep
                    accountType={form.accountType}
                    email={resolveDisplayEmail(form)}
                    displayName={resolveDisplayName(form)}
                    institutionName={
                      form.accountType === 'account_type_institution'
                        ? form.formData.institutionName
                        : undefined
                    }
                    onGoToDashboard={handleGoToDashboard}
                    onExploreEvents={handleExploreEvents}
                  />
                )}

                {/* Primary continue button */}
                {showContinueButton && (
                  <div className="mt-4 sm:mt-6">
                    <Button
                      onClick={form.next}
                      disabled={form.isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {form.isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          {isFinalSubmit(form.accountType, form.currentStep)
                            ? 'Creating Account...'
                            : 'Loading...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {continueLabel}
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

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Secure & encrypted</span>
            <span className="w-px h-2.5 sm:h-3 bg-border" />
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Powered by Nuruvent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS (unchanged)
// ============================================================

type SignupForm = ReturnType<typeof useSignupForm>;

function resolveDisplayEmail(form: SignupForm): string {
  if (form.otpEmail) return form.otpEmail;
  if (form.accountType === 'account_type_institution') {
    return form.formData.adminEmail;
  }
  return form.formData.email;
}

function resolveDisplayName(form: SignupForm): string {
  if (form.accountType === 'account_type_institution') {
    return form.formData.adminName;
  }
  return form.formData.name;
}

function computeContinueLabel(
  accountType: SignupForm['accountType'],
  step: SignupForm['currentStep'],
): string {
  if (accountType === 'account_type_institution') {
    if (step === 'institution-details') return 'Create Account';
    return 'Continue';
  }
  return 'Continue';
}

function isFinalSubmit(
  accountType: SignupForm['accountType'],
  step: SignupForm['currentStep'],
): boolean {
  return (
    accountType === 'account_type_institution' &&
    step === 'institution-details'
  );
}