// app/(public)/features/FeaturesContent.tsx

'use client';

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
  CheckCircle 
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'M-Pesa Payments',
    description: 'STK push in 3 seconds. Auto-reconciliation. No manual work. Perfect for Kenyan professionals.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Award,
    title: 'QR Verified Certificates',
    description: 'Host uploads custom design. Auto-delivered via email + WhatsApp. QR code verification prevents forgery.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Bell,
    title: 'Automated Reminders',
    description: 'WhatsApp + SMS + Email at 24hr, 1hr, and 10min before event. Maximize attendance effortlessly.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: BarChart,
    title: 'Attendance Tracking',
    description: 'Zoom Webhooks + Google Meet Events API + Host Confirmation. Perfect for CPD tracking.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Video,
    title: '30-Day Replays',
    description: 'Replays hosted on Nuruvent for 30 days after the event. Attendees never miss a session.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: CreditCard,
    title: 'Monday Payouts',
    description: 'Automatic payouts to M-Pesa every Monday. No 30-day wait. 10% commission only.',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: LayoutDashboard,
    title: 'Host Dashboard',
    description: 'Manage events, attendees, revenue, and certificates. Everything in one place.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: User,
    title: 'Attendee Dashboard',
    description: 'View events, certificates, replays, and payments. All your professional development in one place.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Zap,
    title: 'Event Marketplace',
    description: 'Discover events. SEO-optimized. WhatsApp sharing. Free distribution for hosts.',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export function FeaturesContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Features
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Training Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuruvent automates payments, certificates, reminders, attendance, and payouts — all in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-tertiary" />
              <span className="text-sm text-gray-600">Trusted by training institutes, professional bodies, and coaches across Kenya</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}