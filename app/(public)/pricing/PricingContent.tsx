'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  Zap,
  Globe,
  Award,
  HardDrive,
  ShieldCheck,
  Video,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Currency = 'USD' | 'KES';

// Exchange Rate: 1 USD = 130 KES
const EXCHANGE_RATE_KES = 130;

export function PricingContent() {
  const [currency, setCurrency] = useState<Currency>('KES');

  // Dynamic price formatter linked to state
  const formatPrice = (usdAmount: number, suffix = '') => {
    const kesAmount = Math.round(usdAmount * EXCHANGE_RATE_KES);
    
    if (usdAmount === 0) {
      return currency === 'KES' ? `KES 0${suffix}` : `$0${suffix}`;
    }

    if (currency === 'KES') {
      return `KES ${kesAmount.toLocaleString()}${suffix}`;
    }
    return `$${usdAmount.toLocaleString()}${suffix}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      {/* ===== HERO SECTION WITH FADE OUT & BACKGROUND IMAGE ===== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#202124] py-14 md:py-20">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pricing.png"
            alt="Pricing & Monetization Workflow"
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
              id="dotPatternPricing"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPatternPricing)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 dark:border-primary/20 shadow-sm cursor-default">
              <Sparkles className="h-4 w-4" />
              <span>Zero Risk • Pay Only When You Sell</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
              Transparent Pricing for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Global Event Hosts
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 dark:text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              No setup fees, no monthly commitments, and {formatPrice(0)} for free events. Automate attendance tracking, reminders, and certificates out of the box.
            </p>

            {/* Currency Toggle */}
            <div className="flex justify-center lg:justify-start">
              <div className="bg-white dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] p-1 rounded-2xl flex items-center gap-1 shadow-sm">
                <button
                  type="button"
                  aria-pressed={currency === 'USD'}
                  onClick={() => setCurrency('USD')}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  USD Primary ($)
                </button>
                <button
                  type="button"
                  aria-pressed={currency === 'KES'}
                  onClick={() => setCurrency('KES')}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    currency === 'KES'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs">KES</span>
                  KES Primary (Shilling)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Cards Section */}
      <section className="container mx-auto px-4 py-12 relative z-20 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Free Events */}
          <div className="bg-white dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#4A4D52] transition-all duration-300 hover:shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free Events</h3>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1">For webinars, meetups & community sessions</p>
                </div>
                <span className="p-3 bg-slate-100 dark:bg-[#202124] border border-slate-200 dark:border-[#3C4043] rounded-2xl text-blue-600 dark:text-blue-400">
                  <Video className="h-6 w-6" />
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{formatPrice(0)}</span>
                  <span className="text-slate-500 dark:text-muted-foreground font-medium">forever</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">No credit card required to start</p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground">Includes Everything You Need:</p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-muted-foreground">
                  {[
                    'Unlimited free webinars & meetups globally',
                    'Zoom & Google Meet auto-attendance tracking',
                    'Automated WhatsApp, SMS & Email reminders',
                    'Instant digital ticket dashboard',
                    '30-day replay hosting included',
                    'Standard unverified PDF certificates',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" className="w-full cursor-pointer">
              <Button className="w-full py-6 rounded-2xl bg-slate-100 dark:bg-[#202124] hover:bg-slate-200 dark:hover:bg-[#2D2E32] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3C4043] font-semibold text-base transition-all cursor-pointer">
                Host Free Events
              </Button>
            </Link>
          </div>

          {/* Card 2: Paid Events (Featured) */}
          <div className="bg-white dark:bg-[#2D2E32] border-2 border-blue-500 dark:border-blue-400 rounded-3xl p-8 relative flex flex-col justify-between shadow-xl shadow-blue-500/10 dark:shadow-blue-400/5">
            <div className="absolute -top-4 right-8 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Paid Tickets</h3>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1">For workshops, bootcamps & paid trainings</p>
                </div>
                <span className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400">
                  <Zap className="h-6 w-6" />
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">3.5%</span>
                  <span className="text-slate-500 dark:text-muted-foreground font-medium">per ticket sold</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                  + Standard merchant pass-through rate (Cards / Mobile Money)
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Everything in Free, plus:</p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-muted-foreground">
                  {[
                    `No fixed dollar add-on per ticket (${formatPrice(0)} flat fee)`,
                    'Pass-through fees: Pass to buyer or absorb',
                    'Mobile Money (M-Pesa, Airtel Money) & Global Cards (Visa, Mastercard)',
                    'Fast 7-day weekly payouts (Mobile Wallet or Bank)',
                    'Automated CPD hour recording & analytics',
                    'Full revenue & attendee export tools',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" className="w-full cursor-pointer">
              <Button className="w-full py-6 rounded-2xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-600/25 dark:shadow-blue-500/20 transition-all cursor-pointer">
                Start Selling Tickets
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Global Payment Methods Banner */}
      <section className="py-8 bg-blue-50/50 dark:bg-blue-900/10 border-y border-blue-100 dark:border-blue-900/30">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-[#2D2E32] rounded-xl shadow-xs border border-blue-100 dark:border-blue-800">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Global & Local Payment Options</h4>
              <p className="text-xs text-slate-600 dark:text-muted-foreground">Accept transactions from anywhere in the world seamlessly.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-muted-foreground flex-wrap justify-center">
            <span className="px-3 py-1.5 bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#3C4043] rounded-lg shadow-xs flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> M-Pesa
            </span>
            <span className="px-3 py-1.5 bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#3C4043] rounded-lg shadow-xs flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-red-600 dark:text-red-400" /> Airtel Money
            </span>
            <span className="px-3 py-1.5 bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#3C4043] rounded-lg shadow-xs flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Visa & Mastercard
            </span>
          </div>
        </div>
      </section>

      {/* Value-Added Services (VAS) Section */}
      <section className="py-16 bg-white dark:bg-[#202124] border-b border-slate-200 dark:border-[#3C4043]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Unbundled Value-Added Services
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground mt-2 text-sm md:text-base">
              Add professional credentials or long-term video storage only when you need them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add-on 1: QR Certificates */}
            <div className="bg-slate-50 dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] p-6 rounded-2xl flex items-start gap-5 hover:border-slate-300 dark:hover:border-[#4A4D52] transition-all">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">QR-Verified CPD Certificates</h4>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {formatPrice(0.5, ' / cert')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
                  Anti-forgery credentials with verifiable QR codes. Perfect for professional bodies and corporate CPD tracking. Host pays or passes as an optional purchase to attendees.
                </p>
              </div>
            </div>

            {/* Add-on 2: Extended Storage */}
            <div className="bg-slate-50 dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] p-6 rounded-2xl flex items-start gap-5 hover:border-slate-300 dark:hover:border-[#4A4D52] transition-all">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                <HardDrive className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Extended Replay Storage</h4>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {formatPrice(9.99, ' / mo')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
                  Keep event recordings and session resources online beyond the standard 30-day window. Includes 100 GB of high-speed global CDN video delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Table */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            How Nuruvent Compares
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground mt-2 text-sm">
            See how much you save on a standard 20-ticket workshop at {formatPrice(15)} per ticket ({formatPrice(300)} total sales).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] rounded-2xl overflow-hidden shadow-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#3C4043] bg-slate-100 dark:bg-[#202124] text-slate-600 dark:text-muted-foreground text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Platform</th>
                <th className="py-4 px-6">Platform Take-Rate</th>
                <th className="py-4 px-6">Fixed Ticket Fee</th>
                <th className="py-4 px-6">Total Take Cut</th>
                <th className="py-4 px-6 text-right">Host Keeps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#3C4043] text-sm">
              <tr className="bg-blue-50/50 dark:bg-blue-900/10 font-semibold text-slate-900 dark:text-white">
                <td className="py-4 px-6 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Nuruvent</span>
                </td>
                <td className="py-4 px-6 text-blue-700 dark:text-blue-400">3.5%</td>
                <td className="py-4 px-6 text-blue-700 dark:text-blue-400">{formatPrice(0)}</td>
                <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400">~8.4% total</td>
                <td className="py-4 px-6 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(274.8)}</td>
              </tr>
              <tr className="text-slate-600 dark:text-muted-foreground">
                <td className="py-4 px-6">Luma</td>
                <td className="py-4 px-6">5.0%</td>
                <td className="py-4 px-6">{formatPrice(0)}</td>
                <td className="py-4 px-6">~9.9% total</td>
                <td className="py-4 px-6 text-right font-medium text-slate-900 dark:text-white">{formatPrice(270.3)}</td>
              </tr>
              <tr className="text-slate-600 dark:text-muted-foreground">
                <td className="py-4 px-6">Eventbrite</td>
                <td className="py-4 px-6">3.7%</td>
                <td className="py-4 px-6">{formatPrice(1.79)} / tkt</td>
                <td className="py-4 px-6 text-rose-600 dark:text-rose-400">~20.5% total</td>
                <td className="py-4 px-6 text-right font-medium text-slate-900 dark:text-white">{formatPrice(238.4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-slate-100/60 dark:bg-[#2D2E32]/30 border-t border-slate-200 dark:border-[#3C4043]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Are free events really 100% free forever?',
                a: 'Yes. You can host unlimited free webinars, workshops, or meetups globally without ever entering a credit card. We only charge when you sell paid tickets or choose to issue verified credentials.',
              },
              {
                q: 'How do payouts work?',
                a: 'Host earnings are paid out every Monday on a 7-day rolling cycle via direct mobile money transfer (M-Pesa / Airtel Money) or direct bank transfer.',
              },
              {
                q: 'Which payment methods can my attendees use?',
                a: 'Attendees worldwide can pay using credit/debit cards (Visa, Mastercard) or local mobile payment options including M-Pesa and Airtel Money.',
              },
              {
                q: 'Can I pass transaction fees to my attendees?',
                a: 'Yes. At checkout, you can choose whether to absorb the 3.5% platform fee + merchant fee or pass it on to attendees as a standard service fee.',
              },
              {
                q: 'How does automated Zoom / Google Meet tracking work?',
                a: 'Simply paste your Zoom or Google Meet link when creating your event. Nuruvent connects via webhooks to log attendee join and leave times automatically for accurate CPD hour reporting.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] p-6 rounded-2xl shadow-xs">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-[#2D2E32] border border-slate-200 dark:border-[#3C4043] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-slate-300 dark:hover:border-[#4A4D52] transition-all">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Get Started Free</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Ready to Light Up Your Training Events?
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground text-base">
              Set up your first event in less than 3 minutes. No setup fees, zero risk.
            </p>
            <div className="pt-2">
              <Link href="/signup" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/20 dark:shadow-blue-500/20 transition-all inline-flex items-center gap-2 cursor-pointer">
                  <span>Create Your First Event</span>
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