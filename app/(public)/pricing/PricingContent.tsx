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
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Currency = 'USD' | 'KES';

const EXCHANGE_RATE_KES = 130;

export function PricingContent() {
  const [currency, setCurrency] = useState<Currency>('KES');

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background py-14 md:py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pricing.png"
            alt="Pricing & Monetization Workflow"
            fill
            className="object-cover object-right"
            priority
          />
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70 lg:hidden" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent lg:hidden" />
        </div>

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
              <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.15" />
            </pattern>
            <rect x="0" y="0" width="200" height="200" fill="url(#dotPatternPricing)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15 shadow-sm cursor-default">
              <Sparkles className="h-4 w-4" />
              <span>Pay only when you sell. Free events stay free.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
              Simple Pricing for{' '}
              <span className="bg-gradient-to-r from-primary via-primary-400 to-primary-800 bg-clip-text text-transparent">
                Event Hosts in Kenya
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
              Host free events for {formatPrice(0)}. Sell paid tickets at a flat 4.5% Nuruvent fee,
              plus payment processing charged at cost. No monthly subscriptions. No fixed fees per
              ticket.
            </p>

            <div className="flex justify-center lg:justify-start">
              <div className="bg-card border border-border p-1 rounded-2xl flex items-center gap-1 shadow-sm">
                <button
                  type="button"
                  aria-pressed={currency === 'USD'}
                  onClick={() => setCurrency('USD')}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  USD ($)
                </button>
                <button
                  type="button"
                  aria-pressed={currency === 'KES'}
                  onClick={() => setCurrency('KES')}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    currency === 'KES'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-bold text-xs">KES</span>
                  KES (Shilling)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN PRICING CARDS ===== */}
      <section className="container mx-auto px-4 py-12 relative z-20 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card 1: Free Events */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Free Events</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Webinars, meetups, community sessions
                  </p>
                </div>
                <span className="p-3 bg-muted border border-border rounded-2xl text-primary">
                  <Video className="h-6 w-6" />
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{formatPrice(0)}</span>
                  <span className="text-muted-foreground font-medium">forever</span>
                </div>
                <p className="text-xs text-primary mt-2 font-medium">
                  No credit card required
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Everything included:
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    'Unlimited free events, worldwide',
                    'Automatic Zoom & Google Meet attendance tracking',
                    'WhatsApp, SMS & email reminders sent for you',
                    'Digital ticket dashboard for every attendee',
                    '30 days of replay hosting after each event',
                    'Standard PDF certificates for attendees',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" className="w-full cursor-pointer">
              <Button
                variant="outline"
                className="w-full py-6 rounded-2xl font-semibold text-base transition-all cursor-pointer"
              >
                Host Free Events
              </Button>
            </Link>
          </div>

          {/* Card 2: Paid Events */}
          <div className="bg-card border-2 border-primary rounded-3xl p-8 relative flex flex-col justify-between shadow-xl shadow-primary/10">
            <div className="absolute -top-4 right-8 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Paid Tickets</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Workshops, bootcamps, paid trainings
                  </p>
                </div>
                <span className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                  <Zap className="h-6 w-6" />
                </span>
              </div>

              {/* Nuruvent fee — the headline */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">4.5%</span>
                  <span className="text-muted-foreground font-medium">Nuruvent fee</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Plus payment processing, charged at cost by our payment provider
                </p>
              </div>

              {/* Payment processing fees */}
              <div className="mb-6 p-4 bg-muted rounded-2xl border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Payment Processing Fees
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Smartphone className="h-4 w-4 text-tertiary" />
                      M-Pesa / Airtel Money
                    </span>
                    <span className="font-bold text-tertiary">3.5%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Local Cards
                    </span>
                    <span className="font-bold text-primary">3.5%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 text-secondary" />
                      International Cards
                    </span>
                    <span className="font-bold text-secondary">4.5%</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    On a {formatPrice(7.69)} M-Pesa ticket, you receive{' '}
                    <span className="font-bold text-foreground">{formatPrice(7.08)}</span>.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Everything in Free, plus:
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    `No fixed fee per ticket (${formatPrice(0)} flat)`,
                    'Choose to absorb fees or pass them to attendees',
                    'M-Pesa, Airtel Money, Visa, Mastercard — local and international',
                    'Payouts every Monday, straight to M-Pesa or bank',
                    'Automatic CPD hour tracking and reports',
                    'Full revenue and attendee exports',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/signup" className="w-full cursor-pointer">
              <Button className="w-full py-6 rounded-2xl bg-primary hover:bg-primary-600 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all cursor-pointer">
                Start Selling Tickets
              </Button>
            </Link>
          </div>

        </div>

        {/* Honest banner — speaks to hosts with a concrete number */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="text-center p-6 bg-gradient-to-r from-tertiary/5 via-primary/5 to-secondary/5 border border-primary/15 rounded-2xl">
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="font-bold text-foreground">
                On a KES 1,000 M-Pesa ticket, you receive KES 920.
              </span>{' '}
              No monthly fees. No fixed per-ticket charges. Payouts every Monday.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PAYMENT METHODS BANNER ===== */}
      <section className="py-8 bg-primary/5 border-y border-primary/15">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-card rounded-xl shadow-xs border border-primary/15">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Payments Your Attendees Already Use</h4>
              <p className="text-xs text-muted-foreground">
                Local and international. No setup required.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap justify-center">
            <span className="px-3 py-1.5 bg-card border border-border rounded-lg shadow-xs flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-tertiary" /> M-Pesa
            </span>
            <span className="px-3 py-1.5 bg-card border border-border rounded-lg shadow-xs flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-error" /> Airtel Money
            </span>
            <span className="px-3 py-1.5 bg-card border border-border rounded-lg shadow-xs flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" /> Visa & Mastercard
            </span>
          </div>
        </div>
      </section>

      {/* ===== VALUE-ADDED SERVICES ===== */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Optional Add-Ons
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Only pay for these when you need them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/50 border border-border p-6 rounded-2xl flex items-start gap-5 hover:border-secondary/40 transition-all">
              <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary-600 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-1">
                  <h4 className="text-lg font-bold">QR-Verified CPD Certificates</h4>
                  <span className="text-secondary-600 font-bold text-sm">
                    {formatPrice(0.5, ' / certificate')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Certificates with QR codes that anyone can verify. Ideal for professional bodies
                  and corporate CPD tracking. Pay per certificate, or charge attendees an optional
                  fee to cover it.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 border border-border p-6 rounded-2xl flex items-start gap-5 hover:border-primary/40 transition-all">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                <HardDrive className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-1">
                  <h4 className="text-lg font-bold">Extended Replay Storage</h4>
                  <span className="text-primary font-bold text-sm">
                    {formatPrice(9.99, ' / month')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Keep your event recordings online for longer than the standard 30 days. Includes
                  100 GB of fast global video delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON TABLE ===== */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            How Nuruvent Compares
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl mx-auto">
            A 20-ticket workshop at KES 1,950 per ticket — that&apos;s KES 39,000 in total sales,
            paid via M-Pesa. Here&apos;s what each platform charges and what the host actually
            receives.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <thead>
              <tr className="border-b border-border bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Platform</th>
                <th className="py-4 px-6">Platform Fee</th>
                <th className="py-4 px-6">Fixed Fee Per Ticket</th>
                <th className="py-4 px-6">Payment Processing</th>
                <th className="py-4 px-6 text-right">You Receive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              <tr className="bg-primary/5 font-semibold">
                <td className="py-4 px-6 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Nuruvent</span>
                </td>
                <td className="py-4 px-6 text-primary font-bold">4.5%</td>
                <td className="py-4 px-6 text-primary font-bold">KES 0</td>
                <td className="py-4 px-6 text-primary font-bold">3.5% M-Pesa</td>
                <td className="py-4 px-6 text-right font-black text-tertiary">
                  KES 35,880
                </td>
              </tr>
              <tr className="text-muted-foreground">
                <td className="py-4 px-6">Luma</td>
                <td className="py-4 px-6">5.0%</td>
                <td className="py-4 px-6">KES 0</td>
                <td className="py-4 px-6">~2.9% (Stripe)</td>
                <td className="py-4 px-6 text-right font-medium text-foreground">
                  ~KES 35,919
                </td>
              </tr>
              <tr className="text-muted-foreground">
                <td className="py-4 px-6">Enkare</td>
                <td className="py-4 px-6">~10%</td>
                <td className="py-4 px-6">KES 0</td>
                <td className="py-4 px-6">Passed to host</td>
                <td className="py-4 px-6 text-right font-medium text-foreground">
                  ~KES 35,100
                </td>
              </tr>
              <tr className="text-muted-foreground">
                <td className="py-4 px-6">Eventbrite</td>
                <td className="py-4 px-6">3.7%</td>
                <td className="py-4 px-6">KES 233 / ticket</td>
                <td className="py-4 px-6 text-error">~2.9%</td>
                <td className="py-4 px-6 text-right font-medium text-error">
                  ~KES 30,992
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Payouts on Nuruvent arrive every Monday, straight to M-Pesa or your bank. Luma and
          Eventbrite pay out via international settlement.
        </p>

        {/* Advantage callouts — corrected numbers */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-tertiary/5 border border-tertiary/20 rounded-2xl flex items-center gap-4">
            <div className="p-2.5 bg-tertiary/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">vs. Luma</p>
              <p className="text-lg font-black text-tertiary">
                − KES 39
              </p>
            </div>
          </div>
          <div className="p-5 bg-tertiary/5 border border-tertiary/20 rounded-2xl flex items-center gap-4">
            <div className="p-2.5 bg-tertiary/10 rounded-xl">
              <Users className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">More than Enkare</p>
              <p className="text-lg font-black text-tertiary">
                + KES 780
              </p>
            </div>
          </div>
          <div className="p-5 bg-tertiary/5 border border-tertiary/20 rounded-2xl flex items-center gap-4">
            <div className="p-2.5 bg-tertiary/10 rounded-xl">
              <Clock className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">More than Eventbrite</p>
              <p className="text-lg font-black text-tertiary">
                + KES 4,888
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Common Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Are free events really free?',
                a: 'Yes. Host as many free events as you want — anywhere in the world — without entering a card. We only earn when you sell paid tickets or choose to add paid features like verified certificates.',
              },
              {
                q: 'What does a paid event cost me?',
                a: 'A 4.5% Nuruvent fee, plus payment processing charged at cost by our provider. M-Pesa and Airtel Money are 3.5%. Local cards are 3.5%. International cards are 4.5%. On a KES 1,000 M-Pesa ticket, you receive KES 920.',
              },
              {
                q: 'Can I pass the fees to my attendees instead?',
                a: 'Yes. At checkout, choose whether to absorb the fees yourself or add them to the ticket price as a service fee. Your call, per event.',
              },
              {
                q: 'When do I get paid?',
                a: 'Every Monday, on a 7-day rolling cycle. Payouts go directly to your M-Pesa, Airtel Money, or bank account. No minimum balance.',
              },
              {
                q: 'Which payment methods can my attendees use?',
                a: 'M-Pesa, Airtel Money, and credit or debit cards (Visa, Mastercard) — local and international. Whatever is easiest for them.',
              },
              {
                q: 'How does Zoom and Google Meet attendance tracking work?',
                a: 'Paste your Zoom or Google Meet link when you create the event. We connect automatically and log when each attendee joins and leaves. That data feeds into your CPD hour reports — no manual tracking needed.',
              },
              {
                q: 'How is Nuruvent different from Luma or Eventbrite?',
                a: 'Two big things. First, price: on a KES 39,000 M-Pesa event, you keep KES 35,880 with Nuruvent — about KES 780 more than Enkare, and KES 4,888 more than Eventbrite. Second, payouts: we pay out weekly to your M-Pesa, not through international bank settlement.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-card border border-border p-6 rounded-2xl shadow-xs hover:border-primary/30 transition-all"
              >
                <h4 className="text-base font-bold mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="bg-card border border-border rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl hover:border-primary/40 transition-all">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-xs">
              <Sparkles className="h-4 w-4" />
              <span>Start Free</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold">
              Ready to Run Your Next Event?
            </h2>
            <p className="text-muted-foreground text-base">
              Set up your first event in under 3 minutes. No setup fees. No monthly fees.
            </p>
            <div className="pt-2">
              <Link href="/signup" className="cursor-pointer">
                <Button className="px-8 py-6 rounded-2xl bg-primary hover:bg-primary-600 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2 cursor-pointer">
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