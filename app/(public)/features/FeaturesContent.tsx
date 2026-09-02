'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, 
  Smartphone, 
  Award, 
  Bell, 
  BarChart, 
  Video, 
  CreditCard, 
  LayoutDashboard, 
  User,
  CheckCircle,
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Building2,
  Layers,
  Users,
  Shield,
  Briefcase,
  Home,
  Users2,
  GraduationCap,
  Store,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile Money & Cards',
    description: 'Instant M-Pesa & Airtel Money STK pushes alongside global card processing (Visa, Mastercard). Instant auto-reconciliation.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    icon: Award,
    title: 'QR-Verified Certificates',
    description: 'Host custom templates with instant auto-delivery via Email + WhatsApp. Includes forgery-proof QR verification.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    icon: Bell,
    title: 'Automated Reminders',
    description: 'Multi-channel WhatsApp, SMS, and Email notifications sent automatically at 24h, 1h, and 10m before event kickoff.',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    icon: BarChart,
    title: 'Automated Attendance & CPD',
    description: 'Direct Zoom Webhooks and Google Meet Events API integration to accurately log attendee join times for CPD accreditation.',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    icon: Video,
    title: '30-Day Replay Hosting',
    description: 'Automatic high-speed CDN video replay hosting for 30 days post-event so attendees never miss session resources.',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    icon: CreditCard,
    title: 'Weekly Monday Payouts',
    description: 'Automated earnings payouts directly to Mobile Wallets (M-Pesa, Airtel Money) or local bank accounts every Monday at a low 3.5% take-rate.',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  {
    icon: LayoutDashboard,
    title: 'Host Control Center',
    description: 'Comprehensive dashboard to manage multi-ticket sales, attendee exports, webhook tracking, and revenue analytics.',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    icon: User,
    title: 'Attendee Portal',
    description: 'Centralized hub for participants to access upcoming events, downloadable QR certificates, session replays, and payment receipts.',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    icon: Globe,
    title: 'Global Event Discovery',
    description: 'SEO-optimized landing pages, built-in WhatsApp sharing tools, and global distribution for maximum ticket reach.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
];

export function FeaturesContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      {/* ===== HERO SECTION WITH FADE OUT ===== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#202124] py-14 md:py-20">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/features.png"
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
              <Zap className="h-4 w-4" />
              <span>Built for Global Event Hosts</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
              Everything You Need to Run{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                World-Class Events & Courses
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 dark:text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Nuruvent automates payments, QR credentials, attendee reminders, session tracking, and payouts — all in one unified platform.
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

      {/* ===== FEATURES GRID WITH TEAM OWNERSHIP HIGHLIGHT ===== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Everything You Need in One Platform
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              From payments to team collaboration — Nuruvent has you covered
            </p>
          </div>

          {/* ===== TEAM OWNERSHIP FEATURE CARD (Full Width) ===== */}
          <div className="relative mb-12 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 rounded-3xl border border-blue-200/60 dark:border-blue-800/30 shadow-2xl shadow-blue-500/10 dark:shadow-blue-400/5 overflow-hidden">
            {/* Decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            
            {/* Decorative blur circles */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

            <div className="relative p-8 md:p-10 lg:p-12">
              {/* Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
                {/* Left: Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                    <Users2 className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                      Team Management & Multi-Team Collaboration
                    </h3>
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30">
                      ⭐ Game-Changer
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Events belong to Teams — not individuals.</span> 
                    Every user gets a <span className="font-bold text-blue-600 dark:text-blue-400">Personal Team</span> on signup and can join 
                    multiple <span className="font-bold text-indigo-600 dark:text-indigo-400">Institution Teams</span>. 
                    Switch seamlessly between teams with one click — your permissions, events, and collaborators change automatically.
                  </p>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <Link href="/teams" className="block">
                    <Button 
                      className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-8 py-6 shadow-lg shadow-blue-500/25 transition-all group"
                    >
                      Explore Team Features
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Who Benefits - Catchy User Segments */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/70 dark:bg-[#202124]/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Institutions</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Run training programs with your entire team
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-[#202124]/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Trainers</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Manage courses across multiple organizations
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-[#202124]/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Freelancers</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Work with multiple clients in one dashboard
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-[#202124]/70 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Consultants</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Be part of different client teams seamlessly
                  </p>
                </div>
              </div>

              {/* Team Types + Switching */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Personal Team */}
                <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">Personal Team</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Your private workspace</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create events, test features, and manage your schedule with full admin control.
                  </p>
                </div>

                {/* Institution Team */}
                <div className="bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">Institution Team</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Shared collaboration</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Collaborate with team members, share events, and manage institutional training.
                  </p>
                </div>

                {/* Team Switching */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">Seamless Switching</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">One-click team change</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Switch between teams instantly — events, permissions, and collaborators update automatically.
                  </p>
                </div>
              </div>

              {/* Real Example - John Doe */}
              <div className="mt-5 flex flex-wrap items-center gap-3 p-3 md:p-4 bg-white/60 dark:bg-[#202124]/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    JD
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">John Doe</span>
                  <span className="hidden sm:inline">is a member of:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800/30">
                    <Home className="h-3.5 w-3.5" />
                    Personal Team <span className="text-blue-500 dark:text-blue-400 font-bold">(Admin)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-800/30">
                    <Building2 className="h-3.5 w-3.5" />
                    Nuruvent <span className="text-indigo-500 dark:text-indigo-400 font-bold">(Manager)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800/30">
                    <Building2 className="h-3.5 w-3.5" />
                    TechCorp <span className="text-purple-500 dark:text-purple-400 font-bold">(Member)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-400 dark:text-slate-500">
                  <ArrowLeftRight className="h-4 w-4 text-blue-400" />
                  <span>Switch roles & permissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52]"
                >
                  <div>
                    <div className={`inline-flex p-3 rounded-2xl border mb-6 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full shadow-xs dark:bg-[#2D2E32] dark:border-[#3C4043]">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 dark:text-emerald-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Trusted by training institutes, professional bodies, and enterprise hosts globally
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-slate-300 transition-all dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Get Started Free</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Ready to Automate Your Next Event or Course?
            </h2>
            <p className="text-slate-600 text-base dark:text-slate-400">
              Set up your first event or course in less than 3 minutes. Free for non-paid sessions with zero setup costs.
            </p>
            <div className="pt-2">
              <Link href="/signup" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600">
                  <span>Create Your First Event or Course</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}