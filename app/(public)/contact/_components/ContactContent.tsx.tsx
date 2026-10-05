'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  Headphones,
  Handshake,
  ArrowRight,
  Zap,
  CheckCircle,
  Send,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================
// DATA
// ============================================================

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'We reply within one business day.',
    value: 'support@nuruvent.com',
    href: 'mailto:support@nuruvent.com',
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon–Fri, 9:00 – 18:00 EAT.',
    value: '+254 740955111',
    href: 'tel:+254740955111',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Chat with us instantly.',
    value: '+254 740955111',
    href: 'https://wa.me/254740955111',
    color: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/50',
  },
];

const DEPARTMENTS = [
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Account help, payments, certificates, and technical issues.',
    email: 'support@nuruvent.com',
  },
  {
    icon: Building2,
    title: 'Sales & Enterprise',
    description: 'Institutional plans, bulk events, and custom onboarding.',
    email: 'sales@nuruvent.com',
  },
  {
    icon: Handshake,
    title: 'Partnerships',
    description: 'Training bodies, CPD accreditation, and integrations.',
    email: 'partners@nuruvent.com',
  },
];

const OFFICES = [
  {
    city: 'Nairobi, Kenya',
    lines: ['Westlands Business Park', 'Nairobi, Kenya'],
    tag: 'Global HQ',
  },
  {
    city: 'Remote',
    lines: ['Distributed team', 'across 12+ countries'],
    tag: 'Team',
  },
];

// ============================================================
// COMPONENT
// ============================================================

export function ContactContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      {/* ===== HERO SECTION WITH FADE OUT (matches FeaturesContent) ===== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#202124] py-14 md:py-20">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/contact.png"
            alt="Contact Nuruvent"
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
              id="contactDotPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#contactDotPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 dark:border-primary/20 shadow-sm cursor-default">
              <Zap className="h-4 w-4" />
              <span>We&apos;re here to help</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
              Let&apos;s Talk About{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Your Next Event
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 dark:text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Have a question about pricing, integrations, or hosting a large-scale event? Reach out —
              our team responds within one business day.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Link href="mailto:support@nuruvent.com" className="cursor-pointer">
                <Button
                  size="lg"
                  className="cursor-pointer bg-primary hover:bg-primary/90 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold px-6 py-3 text-sm md:text-base rounded-xl shadow-md shadow-primary/25 transition-all duration-300"
                >
                  Email Support
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/help" className="cursor-pointer">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer border-gray-200 dark:border-[#3C4043] bg-white dark:bg-[#2D2E32] hover:bg-gray-50 dark:hover:bg-[#202124] px-6 py-3 text-sm md:text-base rounded-xl font-medium shadow-sm transition-all text-gray-900 dark:text-white"
                >
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CHANNELS ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Choose How to Reach Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              Pick the channel that works best for you — we&apos;re responsive on all of them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52] cursor-pointer"
                >
                  <div className={`inline-flex p-3 rounded-2xl border mb-6 ${channel.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                    {channel.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400 mb-4">
                    {channel.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <span className="break-all">{channel.value}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== DEPARTMENTS ===== */}
      <section className="py-16 md:py-20 bg-slate-50/60 dark:bg-[#1a1b1e]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Reach the Right Team
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              Skip the queue — email the department you need directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.title}
                  className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52]"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mb-6 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                    {dept.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400 mb-5">
                    {dept.description}
                  </p>
                  <a
                    href={`mailto:${dept.email}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Send className="h-4 w-4 shrink-0" />
                    <span className="break-all">{dept.email}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== OFFICES + HOURS ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {OFFICES.map((office) => (
              <div
                key={office.city}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs dark:bg-[#2D2E32] dark:border-[#3C4043]"
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {office.city}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60">
                        {office.tag}
                      </span>
                    </div>
                    {office.lines.map((line) => (
                      <p
                        key={line}
                        className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Business Hours */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs dark:bg-[#2D2E32] dark:border-[#3C4043]">
              <div className="flex items-start gap-4">
                <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Business Hours
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Monday – Friday
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    9:00 – 18:00 EAT
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    Global support via email 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER (matches FeaturesContent style) ===== */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-slate-300 transition-all dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Still have questions?</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              We&apos;d Love to Hear From You
            </h2>
            <p className="text-slate-600 text-base dark:text-slate-400">
              Whether you&apos;re planning your first event or managing thousands of attendees, our
              team is ready to help you succeed.
            </p>
            <div className="pt-2">
              <Link href="mailto:support@nuruvent.com" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600">
                  <span>Send Us an Email</span>
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