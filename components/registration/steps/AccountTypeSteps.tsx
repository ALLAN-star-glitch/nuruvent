// components/registration/steps/AccountTypeStep.tsx

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle,
  User,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { SignupAccountType } from '../types';

// ============================================================
// TYPES
// ============================================================

interface AccountTypeStepProps {
  /** Currently selected account type, or null if none picked yet. */
  selected: SignupAccountType | null;
  /** Called when the user clicks one of the cards. */
  onSelect: (type: SignupAccountType) => void;
}

/**
 * Shape of one card's visual configuration. Not exported — this is
 * internal to the step and would move into `constants.ts` if we ever
 * needed to render it elsewhere.
 */
interface AccountTypeOptionConfig {
  type: SignupAccountType;
  icon: typeof User;
  label: string;
  description: string;
  features: string[];
  /** Tailwind gradient classes for the 3D circle. */
  iconBg: string;
  /** RGBA color for the glow/shadow effects. */
  shadowColor: string;
  borderColor: string;
  ringColor: string;
  selectedBg: string;
  /** Whether to show the "POPULAR" badge on desktop. */
  popular: boolean;
}

// ============================================================
// CARD CONFIGURATION
// ============================================================

const ACCOUNT_TYPE_OPTIONS: AccountTypeOptionConfig[] = [
  {
    type: 'account_type_personal',
    icon: User,
    label: 'Personal',
    description:
      'For trainers, coaches, consultants, freelancers, and attendees',
    features: [
      'Create & host training events/courses',
      'Team management & roles',
      'Attend events & courses as a learner',
    ],
    iconBg: 'from-blue-500 to-blue-600',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: 'border-blue-500',
    ringColor: 'ring-blue-500',
    selectedBg: 'bg-blue-50',
    popular: true,
  },
  {
    type: 'account_type_institution',
    icon: Building2,
    label: 'Organization',
    description:
      'For universities, companies, professional bodies, and NGOs',
    features: [
      'Multiple trainers & staff',
      'Team management & roles',
      'Bulk reporting & analytics',
      'Branded certificates & events',
      'Bulk attendee registration',
    ],
    iconBg: 'from-purple-500 to-purple-600',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    borderColor: 'border-purple-500',
    ringColor: 'ring-purple-500',
    selectedBg: 'bg-purple-50',
    popular: false,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export function AccountTypeStep({ selected, onSelect }: AccountTypeStepProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-gray-200">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Choose Your Account Type
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select how you want to use Nuruvent
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-3xl mx-auto">
        {ACCOUNT_TYPE_OPTIONS.map((option) => (
          <AccountTypeCard
            key={option.type}
            option={option}
            isSelected={selected === option.type}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* "Already have an account?" */}
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
}

// ============================================================
// CARD SUBCOMPONENT
// ============================================================

interface AccountTypeCardProps {
  option: AccountTypeOptionConfig;
  isSelected: boolean;
  onSelect: (type: SignupAccountType) => void;
}

/**
 * One selectable account-type card.
 *
 * Extracted from the parent so each option's JSX is written once
 * instead of being duplicated inside a `.map()`.
 */
function AccountTypeCard({ option, isSelected, onSelect }: AccountTypeCardProps) {
  const OptionIcon = option.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option.type)}
      className={cn(
        'group relative flex transition-all duration-300 cursor-pointer',
        // Mobile: clean circle with label below
        'flex-col items-center justify-center gap-2 p-3 rounded-2xl',
        // Desktop: full card with features
        'sm:flex-col sm:items-start sm:p-6 sm:rounded-2xl sm:gap-0 sm:border-2',
        'sm:shadow-lg hover:sm:shadow-2xl',
        isSelected &&
          'sm:ring-4 sm:ring-blue-500 sm:border-blue-500 sm:shadow-xl sm:shadow-blue-500/30',
        !isSelected &&
          'sm:border-gray-200 sm:bg-white sm:hover:border-gray-300 sm:shadow-md',
        // Mobile selected state - subtle background
        isSelected && 'bg-gradient-to-b from-blue-50/50 to-transparent',
      )}
    >
      {/* Glow overlay when selected (desktop only) */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none hidden sm:block" />
      )}

      {/* Selected checkmark badge */}
      {isSelected && (
        <div
          className={cn(
            'absolute -top-1.5 -right-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/40 animate-pulse',
            'p-0.5 sm:p-1.5 h-5 w-5 sm:h-6 sm:w-6',
            'flex items-center justify-center z-10',
          )}
        >
          <CheckCircle className="text-white h-3.5 w-3.5 sm:h-5 sm:w-5" />
        </div>
      )}

      {/* Popular badge (desktop only, non-selected only) */}
      {option.popular && !isSelected && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30 hidden sm:block">
          POPULAR
        </div>
      )}

      {/* 3D Circle icon */}
      <motion.div
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.92, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative"
      >
        {/* Outer glow ring */}
        <div
          className={cn(
            'absolute -inset-1.5 sm:-inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm sm:blur-md',
            isSelected && 'opacity-100',
          )}
          style={{
            background: `radial-gradient(circle, ${option.shadowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Selected ring */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'absolute -inset-1 sm:-inset-1.5 rounded-full border-2 sm:border-4',
              option.borderColor,
              'shadow-lg sm:shadow-2xl',
            )}
            style={{
              boxShadow: `0 0 20px ${option.shadowColor}, 0 0 40px ${option.shadowColor}`,
            }}
          />
        )}

        {/* Main circle */}
        <div
          className={cn(
            'relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full',
            'bg-gradient-to-br',
            option.iconBg,
            'flex items-center justify-center',
            'shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_-3px_8px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3)]',
            'transition-all duration-300',
            isSelected &&
              'shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_-3px_8px_rgba(0,0,0,0.2),inset_0_3px_8px_rgba(255,255,255,0.3)]',
            !isSelected &&
              'hover:shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_-3px_8px_rgba(0,0,0,0.15),inset_0_3px_8px_rgba(255,255,255,0.3)]',
          )}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/40 to-transparent rotate-45 transform translate-y-1/4" />
          </div>

          <OptionIcon
            className={cn(
              'relative z-10 text-white transition-all duration-300',
              'h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10',
              isSelected && 'scale-110',
              !isSelected && 'group-hover:scale-110',
            )}
          />
        </div>
      </motion.div>

      {/* Label */}
      <div className="text-center w-full">
        <span
          className={cn(
            'font-semibold transition-colors block',
            'text-sm sm:text-base md:text-xl',
            isSelected
              ? option.type === 'account_type_personal'
                ? 'text-blue-600'
                : 'text-purple-600'
              : 'text-gray-800 group-hover:text-gray-900',
          )}
        >
          {option.label}
        </span>

        {/* Description (desktop only) */}
        <p className="text-xs text-gray-500 hidden sm:block mt-0.5">
          {option.description.split(',')[0]}
        </p>
      </div>

      {/* Mobile: selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium sm:hidden',
            option.type === 'account_type_personal'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-purple-100 text-purple-600',
          )}
        >
          ✓ Selected
        </motion.div>
      )}

      {/* Features (desktop only) */}
      <div className="hidden sm:block mt-4 space-y-2 w-full">
        {option.features.slice(0, 3).map((feature, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 text-xs text-gray-700"
          >
            <div
              className={cn(
                'flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center',
                isSelected
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300',
              )}
            >
              <Check className="h-2.5 w-2.5" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA (desktop only) */}
      <div className="hidden sm:block mt-4 w-full">
        <div
          className={cn(
            'w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 text-center',
            isSelected
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:shadow-md',
          )}
        >
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
}