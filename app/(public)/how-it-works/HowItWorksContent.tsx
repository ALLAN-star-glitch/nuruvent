
/* eslint-disable react/no-unescaped-entities */
// app/(public)/how-it-works/HowItWorksContent.tsx
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Video,
  Award,
  Bell,
  Smartphone,
  Globe,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  Briefcase,
  UserCircle,
  Calendar,
  FileCheck,
  Landmark,
  Clock,
  Wallet,
  QrCode,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Coffee,
  Rocket,
  LucideIcon,
  UserCheck,
  TrendingUp,
  Search,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export function HowItWorksContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#202124]">
      {/* ===== HERO SECTION WITH FADE OUT ===== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#202124] py-14 md:py-20">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/how-it-works.png"
            alt="Events & Courses Training Workflow"
            fill
            className="object-cover object-right"
            priority
          />

          {/* Smooth left-to-right & bottom fade out gradient overlay */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#202124] dark:via-[#202124]/85" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#202124]" />
          </div>

          {/* Mobile & Tablet Fallback Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70 lg:hidden dark:from-[#202124] dark:via-[#202124]/90 dark:to-[#202124]/70" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent lg:hidden dark:from-[#202124]" />
        </div>

        {/* Pattern Overlay on Left Side */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
          <svg
            className="absolute left-8 top-6 h-56 w-56"
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
              <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 dark:border-primary/20 shadow-sm cursor-default">
              <Sparkles className="h-4 w-4" />
              <span>Simple. Seamless. Illuminating.</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
              How It Works
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 dark:text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Create live events & structured courses, build your training team (personal or organizational), 
              and get paid directly in 7 days.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Link href="/signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="cursor-pointer bg-primary hover:bg-primary/90 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold px-6 py-3 text-sm md:text-base rounded-xl shadow-md shadow-primary/25 transition-all duration-300"
                >
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>

              <Link href="/events" className="cursor-pointer">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer border-gray-200 dark:border-[#3C4043] bg-white dark:bg-[#2D2E32] hover:bg-gray-50 dark:hover:bg-[#202124] px-6 py-3 text-sm md:text-base rounded-xl font-medium shadow-sm transition-all text-gray-900 dark:text-white"
                >
                  Discover Events & Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STEP-BY-STEP PROCESS FOR HOST & ATTENDEE ===== */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark dark:text-white mb-3">
              Two Journeys,{' '}
              <span className="text-primary dark:text-primary-400">
                One Platform
              </span>
            </h2>

            <p className="text-base text-neutral-gray dark:text-muted-foreground">
              Clear, structured workflows designed for hosting live events and courses or joining as a learner.
            </p>
          </div>

          <div className="space-y-20 max-w-6xl mx-auto">

            {/* =========================================================
                HOST WORKFLOW
            ========================================================= */}
            <div className="space-y-10">
              <div className="flex items-center gap-3 border-b border-[#E8EAED] dark:border-[#3C4043] pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                  <Users className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-dark dark:text-white">
                    The Host Pathway
                  </h3>

                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">
                    Everything required to set up teams, publish events & courses, monetize, and execute training.
                  </p>
                </div>
              </div>

              {/* ===== PREMIUM HOST JOURNEY ===== */}
              <div className="relative">

                {/* Desktop Connecting Line */}
                <div className="hidden lg:block absolute top-[42px] left-[8%] right-[8%] h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 dark:from-primary/10 dark:via-primary/30 dark:to-primary/10" />

                {/* Mobile Connecting Line */}
                <div className="lg:hidden absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 dark:from-primary/10 dark:via-primary/30 dark:to-primary/10" />

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-7 lg:gap-3">
                  {[
                    {
                      step: '01',
                      icon: Calendar,
                      title: 'Create Event / Course',
                      desc: 'Define schedule, modules, set prices & video links.',
                    },
                    {
                      step: '02',
                      icon: UserPlus,
                      title: 'Build Team',
                      desc: 'Invite trainers under Personal or Organizational account.',
                    },
                    {
                      step: '03',
                      icon: CreditCard,
                      title: 'Accept Payments',
                      desc: 'Collect tuition & registration via M-Pesa, Airtel, or cards.',
                    },
                    {
                      step: '04',
                      icon: Video,
                      title: 'Deliver Training',
                      desc: 'Host live sessions or manage self-paced course access.',
                    },
                    {
                      step: '05',
                      icon: Award,
                      title: 'Issue Certificates',
                      desc: 'Automatically generate QR-verified CPD certificates.',
                    },
                    {
                      step: '06',
                      icon: TrendingUp,
                      title: '7-Day Payouts',
                      desc: 'Direct payouts every 7 days to bank or mobile money.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex lg:flex-col items-start lg:items-center group"
                    >
                      {/* Step Marker */}
                      <div className="relative z-10 shrink-0 flex items-center justify-center">
                        <div className="w-[56px] h-[56px] rounded-2xl bg-white dark:bg-[#202124] border border-primary/20 dark:border-primary/30 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
                          <div className="w-[42px] h-[42px] rounded-xl bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                            <item.icon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="ml-5 lg:ml-0 lg:mt-6 w-full lg:text-center">
                        <div className="mb-2">
                          <span className="inline-flex items-center rounded-full bg-primary/5 dark:bg-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-primary dark:text-primary-400 uppercase">
                            Step {item.step}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-neutral-dark dark:text-white leading-snug mb-2 transition-colors group-hover:text-primary dark:group-hover:text-primary-400">
                          {item.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-neutral-gray dark:text-muted-foreground leading-relaxed max-w-[180px] lg:mx-auto">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* =========================================================
                LEARNER WORKFLOW
            ========================================================= */}
            <div className="space-y-10">
              <div className="flex items-center gap-3 border-b border-[#E8EAED] dark:border-[#3C4043] pb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary text-neutral-dark flex items-center justify-center font-bold shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-dark dark:text-white">
                    The Learner Pathway
                  </h3>

                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">
                    Simple discovery, effortless registration, and instant credential verification.
                  </p>
                </div>
              </div>

              {/* ===== PREMIUM LEARNER JOURNEY ===== */}
              <div className="relative">

                {/* Desktop Connecting Line */}
                <div className="hidden lg:block absolute top-[42px] left-[10%] right-[10%] h-px bg-gradient-to-r from-secondary/10 via-secondary/50 to-secondary/10 dark:from-secondary/10 dark:via-secondary/30 dark:to-secondary/10" />

                {/* Mobile Connecting Line */}
                <div className="lg:hidden absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-secondary/10 via-secondary/50 to-secondary/10 dark:from-secondary/10 dark:via-secondary/30 dark:to-secondary/10" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 lg:gap-6 max-w-5xl mx-auto">
                  {[
                    {
                      step: '01',
                      icon: Search,
                      title: 'Discover Training',
                      desc: 'Browse verified live events, workshops, and certified courses.',
                    },
                    {
                      step: '02',
                      icon: Smartphone,
                      title: 'Register & Enroll',
                      desc: 'Secure your entry using M-Pesa, Airtel, or card payments.',
                    },
                    {
                      step: '03',
                      icon: Bell,
                      title: 'Get Reminders',
                      desc: 'Receive automated WhatsApp, SMS, and calendar alerts.',
                    },
                    {
                      step: '04',
                      icon: UserCheck,
                      title: 'Join & Learn',
                      desc: 'Attend live events or access interactive course modules.',
                    },
                    {
                      step: '05',
                      icon: FileCheck,
                      title: 'Claim Credential',
                      desc: 'Download your QR-verifiable certificate upon completion.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex lg:flex-col items-start lg:items-center group"
                    >
                      {/* Step Marker */}
                      <div className="relative z-10 shrink-0 flex items-center justify-center">
                        <div className="w-[56px] h-[56px] rounded-2xl bg-white dark:bg-[#202124] border border-secondary/25 dark:border-secondary/30 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-secondary group-hover:shadow-lg group-hover:shadow-secondary/10 group-hover:-translate-y-1">
                          <div className="w-[42px] h-[42px] rounded-xl bg-secondary/15 dark:bg-secondary/10 text-neutral-dark dark:text-secondary-400 flex items-center justify-center transition-all duration-300 group-hover:bg-secondary group-hover:text-neutral-dark">
                            <item.icon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="ml-5 lg:ml-0 lg:mt-6 w-full lg:text-center">
                        <div className="mb-2">
                          <span className="inline-flex items-center rounded-full bg-secondary/10 dark:bg-secondary/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-neutral-dark dark:text-secondary-400 uppercase">
                            Step {item.step}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-neutral-dark dark:text-white leading-snug mb-2 transition-colors group-hover:text-primary dark:group-hover:text-primary-400">
                          {item.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-neutral-gray dark:text-muted-foreground leading-relaxed max-w-[190px] lg:mx-auto">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES ===== */}
      <section className="py-14 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
              Everything You Need
            </h2>

            <p className="text-sm sm:text-base text-neutral-gray dark:text-muted-foreground mt-1.5">
              All the tools to create, manage, and scale your events & courses.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Wallet, title: 'Mobile Money', desc: 'M-Pesa, Airtel, Cards' },
              { icon: QrCode, title: 'QR Certificates', desc: 'Scan to verify completion' },
              { icon: BarChart3, title: 'CPD Tracking', desc: 'Auto-track professional credits' },
              { icon: Clock, title: '7-Day Payouts', desc: 'Direct revenue payouts' },
              { icon: Megaphone, title: 'Discovery Engine', desc: 'Listed in search directory' },
              { icon: ShieldCheck, title: 'Fraud Protection', desc: 'Secure credential verification' },
            ].map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== EVENT & COURSE TYPES ===== */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
              Types of{' '}
              <span className="text-primary dark:text-primary-400">
                Events & Courses
              </span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-gray dark:text-muted-foreground mt-1.5">
              From one-day workshops to structured certification courses.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Coffee, title: 'Workshops' },
              { icon: Video, title: 'Webinars' },
              { icon: Rocket, title: 'Bootcamps' },
              { icon: BookOpen, title: 'Online Courses' },
              { icon: Users, title: 'Conferences' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#2D2E32] rounded-xl p-5 border border-[#E8EAED] dark:border-[#3C4043] text-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm text-neutral-dark dark:text-white">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAYMENTS ===== */}
      <section className="py-14 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
              Flexible{' '}
              <span className="text-primary dark:text-primary-400">
                Payments
              </span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-gray dark:text-muted-foreground mt-1.5">
              Accept payments for tickets or course enrollments effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { icon: Smartphone, title: 'M-Pesa' },
              { icon: Smartphone, title: 'Airtel' },
              { icon: Landmark, title: 'Cards' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#2D2E32] rounded-xl p-5 border border-[#E8EAED] dark:border-[#3C4043] text-center shadow-sm cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                  <item.icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm text-neutral-dark dark:text-white">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
              How We{' '}
              <span className="text-primary dark:text-primary-400">
                Compare
              </span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-gray dark:text-muted-foreground mt-1.5">
              See why organizers choose Nuruvent for events & courses.
            </p>
          </div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 dark:bg-primary/10">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Feature
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Eventbrite
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Manual
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-primary dark:text-primary-400 border border-[#E8EAED] dark:border-[#3C4043] bg-primary/5 dark:bg-primary/10">
                    Nuruvent
                  </th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    feature: 'Events & Courses',
                    eventbrite: 'Events Only',
                    manual: 'Separate',
                    nuruvent: 'Both Integrated',
                  },
                  {
                    feature: 'Payments',
                    eventbrite: 'Cards',
                    manual: 'Manual',
                    nuruvent: 'M-Pesa + Cards',
                  },
                  {
                    feature: 'Certificates',
                    eventbrite: 'No',
                    manual: 'PDF',
                    nuruvent: 'Auto + QR',
                  },
                  {
                    feature: 'CPD Credit Tracking',
                    eventbrite: 'No',
                    manual: 'Manual',
                    nuruvent: 'Auto-tracked',
                  },
                  {
                    feature: 'Payouts',
                    eventbrite: '30 days',
                    manual: 'Instant',
                    nuruvent: '7 days',
                  },
                  {
                    feature: 'Commission Fee',
                    eventbrite: '18.5%',
                    manual: '0%',
                    nuruvent: '3.5%',
                  },
                ].map((row, idx) => (
                  <ComparisonRow key={idx} {...row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-14 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
              Who Uses{' '}
              <span className="text-primary dark:text-primary-400">
                Nuruvent
              </span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-gray dark:text-muted-foreground mt-1.5">
              Trusted by event organizers, course creators, and institutions worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Building2, title: 'Training Institutes' },
              { icon: UserCircle, title: 'Professional Coaches' },
              { icon: Briefcase, title: 'Corporate HR Teams' },
              { icon: GraduationCap, title: 'Professional Bodies' },
              { icon: Users, title: 'Independent Instructors' },
              { icon: Globe, title: 'Global Learners' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#2D2E32] rounded-xl p-5 border border-[#E8EAED] dark:border-[#3C4043] text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                  <item.icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm text-neutral-dark dark:text-white">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-primary-50 dark:bg-[#2D2E32]/50 border-t border-[#E8EAED] dark:border-[#3C4043]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 cursor-default">
            <Sparkles className="w-4 h-4" />
            Join 2,000+ Instructors & Organizers
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark dark:text-white mb-3">
            Ready to Launch{' '}
            <span className="text-primary dark:text-primary-400">
              Events & Courses
            </span>
            ?
          </h2>

          <p className="text-base text-neutral-gray dark:text-muted-foreground max-w-md mx-auto mb-8">
            Start creating, get paid in 7 days, and issue verified certificates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="cursor-pointer">
              <Button
                size="lg"
                className="cursor-pointer bg-primary hover:bg-primary-600 text-white rounded-full px-7 py-3.5 font-semibold text-base"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Link href="/events" className="cursor-pointer">
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer bg-white dark:bg-[#2D2E32] text-neutral-dark dark:text-white border-[#E8EAED] dark:border-[#3C4043] rounded-full px-7 py-3.5 font-semibold text-base"
              >
                Discover Training
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-neutral-gray dark:text-muted-foreground mt-5">
            3.5% commission. No setup fees. No hidden costs.
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-[#2D2E32] rounded-xl p-5 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm hover:shadow-md transition-all text-center cursor-pointer group">
      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2.5 group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="font-semibold text-base text-neutral-dark dark:text-white mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-neutral-gray dark:text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function ComparisonRow({
  feature,
  eventbrite,
  manual,
  nuruvent,
}: {
  feature: string;
  eventbrite: string;
  manual: string;
  nuruvent: string;
}) {
  const isNuruventBetter = (val: string) => {
    const betterValues = [
      'Both Integrated',
      'M-Pesa + Cards',
      'Auto + QR',
      'Auto-tracked',
      '7 days',
      '3.5%',
    ];

    return betterValues.includes(val);
  };

  return (
    <tr className="bg-white dark:bg-[#202124] hover:bg-neutral-light/50 dark:hover:bg-[#2D2E32]/30 transition-colors cursor-pointer">
      <td className="px-4 py-3 text-sm font-medium text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
        {feature}
      </td>

      <td className="px-4 py-3 text-sm text-center text-neutral-gray dark:text-muted-foreground border border-[#E8EAED] dark:border-[#3C4043]">
        {eventbrite}
      </td>

      <td className="px-4 py-3 text-sm text-center text-neutral-gray dark:text-muted-foreground border border-[#E8EAED] dark:border-[#3C4043]">
        {manual}
      </td>

      <td
        className={`px-4 py-3 text-sm text-center font-semibold border border-[#E8EAED] dark:border-[#3C4043] bg-primary/5 dark:bg-primary/10 ${
          isNuruventBetter(nuruvent)
            ? 'text-primary dark:text-primary-400'
            : 'text-neutral-gray dark:text-muted-foreground'
        }`}
      >
        {nuruvent}
      </td>
    </tr>
  );
}

