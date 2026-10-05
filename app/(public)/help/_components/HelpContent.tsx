'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Search,
  ArrowRight,
  BookOpen,
  CreditCard,
  Award,
  Users2,
  Video,
  LayoutDashboard,
  Settings,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  FileText,
  LifeBuoy,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================
// DATA
// ============================================================

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Create your first event and go live in minutes.',
    articleCount: 12,
    href: '/help/getting-started',
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
  },
  {
    icon: CreditCard,
    title: 'Payments & Payouts',
    description: 'M-Pesa, cards, fees, refunds, and weekly payouts.',
    articleCount: 18,
    href: '/help/payments',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
  },
  {
    icon: Award,
    title: 'Certificates & CPD',
    description: 'Design templates and deliver QR-verified certificates.',
    articleCount: 9,
    href: '/help/certificates',
    color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
  },
  {
    icon: Users2,
    title: 'Teams & Permissions',
    description: 'Manage personal and institution teams, roles, invites.',
    articleCount: 14,
    href: '/help/teams',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
  },
  {
    icon: Video,
    title: 'Sessions & Replays',
    description: 'Zoom, Google Meet, attendance tracking, and replays.',
    articleCount: 11,
    href: '/help/sessions',
    color: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
  },
  {
    icon: LayoutDashboard,
    title: 'Host Dashboard',
    description: 'Analytics, attendees, exports, and reporting tools.',
    articleCount: 16,
    href: '/help/dashboard',
    color: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Profile, notifications, branding, and billing.',
    articleCount: 10,
    href: '/help/account',
    color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
  },
  {
    icon: LifeBuoy,
    title: 'Troubleshooting',
    description: 'Fix common issues with payments, emails, and logins.',
    articleCount: 8,
    href: '/help/troubleshooting',
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
  },
];

const POPULAR_ARTICLES = [
  {
    icon: CreditCard,
    title: 'How to set up M-Pesa payments for your event',
    category: 'Payments',
    href: '/help/payments/mpesa-setup',
  },
  {
    icon: Users2,
    title: 'Inviting team members and assigning roles',
    category: 'Teams',
    href: '/help/teams/invite-members',
  },
  {
    icon: Award,
    title: 'Creating a QR-verified certificate template',
    category: 'Certificates',
    href: '/help/certificates/templates',
  },
  {
    icon: Video,
    title: 'Connecting Zoom for automatic attendance',
    category: 'Sessions',
    href: '/help/sessions/zoom-integration',
  },
  {
    icon: BookOpen,
    title: 'Publishing your first event in 5 minutes',
    category: 'Getting Started',
    href: '/help/getting-started/first-event',
  },
  {
    icon: LayoutDashboard,
    title: 'Exporting attendee lists to CSV, Excel, or PDF',
    category: 'Dashboard',
    href: '/help/dashboard/attendee-exports',
  },
];

const FAQS = [
  {
    q: 'How much does Nuruvent charge per event?',
    a: 'Nuruvent charges a flat 3.5% platform fee on paid tickets. Free events and free courses are hosted at zero cost. There are no monthly subscription fees and no hidden charges.',
  },
  {
    q: 'When do I receive my payouts?',
    a: 'Payouts are processed automatically every Monday to your preferred payout method — M-Pesa, Airtel Money, or local bank account. You can track all payouts from the Payments tab in your dashboard.',
  },
  {
    q: 'Can I host events for multiple organizations?',
    a: 'Yes. Every user gets a Personal Team on signup and can join multiple Institution Teams. Switch between teams with one click — your events, permissions, and collaborators update automatically.',
  },
  {
    q: 'How do attendees receive their certificates?',
    a: 'Certificates are delivered automatically via Email and WhatsApp after session completion. Each certificate includes a QR code that can be scanned to verify authenticity.',
  },
  {
    q: 'Do you support recurring events and multi-session courses?',
    a: 'Yes. You can create single events, recurring schedules, or multi-session courses — all from the same event creation flow. Attendance is tracked per session.',
  },
  {
    q: 'Is there a limit on the number of attendees?',
    a: 'No hard limit. Nuruvent scales to thousands of attendees per event. For very large events (10,000+), contact sales for assistance with capacity planning.',
  },
  {
    q: 'Can I customize my event branding?',
    a: 'Yes. Institution Teams can upload a logo, choose brand colors, and customize certificate templates. Branding applies to event pages, emails, and certificates.',
  },
  {
    q: 'How do I contact support if I get stuck?',
    a: 'Use the Tawk.to chat widget (bottom-right on every public page), email support@nuruvent.com, or reach out on WhatsApp. We respond within one business day for most inquiries.',
  },
];

const QUICK_LINKS = [
  { icon: MessageCircle, label: 'Live Chat', href: '#chat' },
  { icon: Mail, label: 'Email Support', href: 'mailto:support@nuruvent.com' },
  { icon: PlayCircle, label: 'Video Tutorials', href: '/help/tutorials' },
  { icon: FileText, label: 'API Docs', href: '/docs' },
];

// ============================================================
// COMPONENT
// ============================================================

export function HelpContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return HELP_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return HELP_CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      {/* ===== HERO SECTION WITH FADE OUT (matches FeaturesContent) ===== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#202124] py-14 md:py-20">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/help.png"
            alt="Nuruvent Help Center"
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
              id="helpDotPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#helpDotPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 dark:border-primary/20 shadow-sm cursor-default">
              <Zap className="h-4 w-4" />
              <span>Help Center</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
              How Can We{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Help You Today?
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 dark:text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Search guides, tutorials, and FAQs — or browse a topic below. Everything you need to
              run successful events and courses on Nuruvent.
            </p>

            {/* In-hero search */}
            <div className="max-w-lg mx-auto lg:mx-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search help articles…"
                  className="pl-11 pr-11 h-12 rounded-xl bg-white dark:bg-[#2D2E32] border-gray-200 dark:border-[#3C4043] text-sm md:text-base shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-[#3C4043] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS STRIP ===== */}
      <section className="pb-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-blue-600 dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52] dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Browse Help Topics
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              {searchQuery
                ? `${filteredCategories.length} categor${filteredCategories.length === 1 ? 'y' : 'ies'} match “${searchQuery}”`
                : 'Pick a topic to dive into step-by-step guides and answers.'}
            </p>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52] cursor-pointer"
                  >
                    <div className={`inline-flex p-3 rounded-2xl border mb-5 ${cat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                      {cat.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400 mb-4">
                      {cat.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>
                        {cat.articleCount} article{cat.articleCount !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-[#2D2E32] mb-4">
                <Search className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                No help topics match your search
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try a different keyword, or browse all topics by clearing the search.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===== FAQs ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              Quick answers to the questions we hear most.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-colors dark:bg-[#2D2E32] dark:border-[#3C4043]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${index}`}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-50/60 dark:hover:bg-[#3C4043]/40 transition-colors cursor-pointer"
                  >
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-${index}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER (matches FeaturesContent style) ===== */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-slate-300 transition-all dark:bg-[#2D2E32] dark:border-[#3C4043] dark:hover:border-[#4A4D52]">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs dark:bg-blue-950/30 dark:border-blue-800/30 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Still stuck?</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-slate-600 text-base dark:text-slate-400">
              Our support team is one message away. Reach out and we&apos;ll get you back on track
              within one business day.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="mailto:support@nuruvent.com" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600">
                  <span>Email Support</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="px-8 py-6 rounded-2xl font-bold text-base border-slate-200 dark:border-[#3C4043] bg-white dark:bg-[#202124] hover:bg-slate-50 dark:hover:bg-[#2D2E32] text-slate-900 dark:text-white inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Contact Page</span>
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Average response time: under 24 hours</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}