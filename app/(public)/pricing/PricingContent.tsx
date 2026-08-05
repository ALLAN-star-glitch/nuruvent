// app/(public)/pricing/PricingContent.tsx

'use client';

import Link from 'next/link';
import { Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Pay-As-You-Go',
    description: 'Perfect for training institutes and coaches starting out',
    price: '10%',
    period: 'commission',
    features: [
      '10% ticket commission',
      '10% certificate commission',
      'M-Pesa STK payments',
      'Automated reminders',
      'Attendance tracking',
      'QR-verified certificates',
      '30-day replays',
      'Monday payouts',
      'Event marketplace',
      'Host dashboard',
    ],
    cta: 'Get Started',
    popular: false,
    href: '/signup',
  },
  {
    name: 'Nuruvent Pro',
    description: 'For high-volume training organizations and professional bodies',
    price: '$50',
    period: 'per month',
    features: [
      '0% ticket commission',
      '5% certificate commission',
      'Everything in Pay-As-You-Go',
      'Custom branding',
      'Priority support',
      'Advanced analytics',
      'Bulk attendee management',
      'White-label certificates',
      'Dedicated account manager',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    href: '/signup',
  },
];

export function PricingContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <CreditCard className="h-4 w-4" />
              Pricing
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple Pricing. Pay Only When You Sell.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No long-term contracts. Start free and grow with us.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`
                  bg-white rounded-2xl border p-8 relative transition-all duration-300
                  ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-gray-200 hover:shadow-lg'}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-tertiary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className={`w-full font-semibold py-6 text-base rounded-xl transition-all ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'border-2 border-gray-200 hover:bg-gray-50'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">46% cheaper than Eventbrite</span> • 7-day payouts vs 30 days
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}