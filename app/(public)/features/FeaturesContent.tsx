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
  ArrowRight
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

      {/* Features Grid */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className={`inline-flex p-3 rounded-2xl border mb-6 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full shadow-xs">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium text-slate-700">
                Trusted by training institutes, professional bodies, and enterprise hosts globally
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner (Light Theme) */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-slate-300 transition-all">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Get Started Free</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Ready to Automate Your Next Event or Course?
            </h2>
            <p className="text-slate-600 text-base">
              Set up your first event or course in less than 3 minutes. Free for non-paid sessions with zero setup costs.
            </p>
            <div className="pt-2">
              <Link href="/signup" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer">
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