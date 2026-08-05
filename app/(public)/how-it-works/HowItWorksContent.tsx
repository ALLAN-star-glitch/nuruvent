// app/(public)/how-it-works/HowItWorksContent.tsx

'use client';

import Link from 'next/link';
import { BookOpen, UserPlus, Bell, Video, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';


export const dynamic = 'force-static';
export const revalidate = false;

const hostSteps = [
  {
    icon: BookOpen,
    title: 'Create Your Training Event',
    description: 'Set event details, choose your event type (Workshop, Webinar, Bootcamp, or Meetup), set ticket and certificate prices, add your Zoom or Google Meet link, and publish.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: UserPlus,
    title: 'Attendees Register & Pay',
    description: 'Attendees discover your event via the marketplace, register with one click, and pay instantly with M-Pesa STK in just 3 seconds.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Bell,
    title: 'Automated Reminders',
    description: 'Attendees receive WhatsApp, SMS, and Email reminders at 24 hours, 1 hour, and 10 minutes before the event to ensure maximum attendance.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Video,
    title: 'Run Your Session',
    description: 'Attendees click one link to join your Zoom or Google Meet. Attendance is auto-tracked via Zoom Webhooks and Google Meet Events API.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Award,
    title: 'Certificates & Payouts',
    description: 'QR-verified certificates are sent within 1 hour. Replays are uploaded, and you receive payouts to M-Pesa every Monday with just 10% commission.',
    color: 'bg-tertiary/10 text-tertiary',
  },
];

export function HowItWorksContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              How It Works
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple Steps to Run Your Training Event
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From event creation to payout — everything automated. No manual work. No new software to learn.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />

            {hostSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div key={index} className={`relative flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0 ${
                  isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'
                }`}>
                  {/* Step Number */}
                  <div className="flex items-center gap-4 md:gap-0">
                    <div className={`
                      flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold z-10
                      ${step.color}
                    `}>
                      {index + 1}
                    </div>
                    <div className="md:hidden">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${step.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                    </div>
                  </div>

                  {/* Desktop Content */}
                  <div className="hidden md:block flex-1">
                    <div className={`flex items-center gap-3 mb-2 ${isEven ? 'justify-end' : ''}`}>
                      <div className={`p-2 rounded-xl ${step.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className={`text-gray-600 ${isEven ? 'text-right' : ''}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ready to get started?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Start Hosting Today
                </Button>
              </Link>
              <Link href="#events">
                <Button variant="outline" className="border-2 border-gray-200 hover:bg-gray-50 px-8 py-3 rounded-xl font-medium transition-all">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}