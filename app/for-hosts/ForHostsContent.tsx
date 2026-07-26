// app/(public)/for-hosts/ForHostsContent.tsx

'use client';

import Link from 'next/link';
import { Target, Users, Award, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Clock,
    title: 'Save 3+ Hours Per Event',
    description: 'No more manual reconciliation, certificate generation, or attendance tracking. Everything is automated.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: DollarSign,
    title: '10% Commission',
    description: 'Keep 90% of your revenue. 46% cheaper than Eventbrite. No hidden fees.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Users,
    title: 'Built-in Discovery',
    description: 'Get listed in the Nuruvent marketplace. SEO-optimized. WhatsApp sharing. Free distribution.',
    color: 'bg-tertiary/10 text-tertiary',
  },
  {
    icon: Award,
    title: 'QR-Verified Certificates',
    description: 'Issue tamper-proof certificates. QR verification prevents forgery. Build trust with your attendees.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const steps = [
  { number: '01', title: 'Create Event', description: 'Set details, choose type, add Zoom or Meet link, publish.' },
  { number: '02', title: 'Attendees Register', description: 'Attendees find, register, and pay with M-Pesa in 3 seconds.' },
  { number: '03', title: 'Run Your Session', description: 'Use your Zoom or Google Meet. Attendance auto-tracked.' },
  { number: '04', title: 'Get Paid', description: 'Receive payouts every Monday. 7-day turnaround.' },
];

export function ForHostsContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              For Hosts
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Host Professional Training Events with Ease
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuruvent automates everything — from payments to certificates. So you can focus on delivering great training.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${benefit.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Get Started in 4 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-4xl font-bold text-primary/20 mb-3">{step.number}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ready to Start Hosting?</h2>
            <p className="text-gray-600 mb-6">Join thousands of training hosts who use Nuruvent to manage their events.</p>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                Start Hosting Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}