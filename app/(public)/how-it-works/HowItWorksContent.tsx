/* eslint-disable react/no-unescaped-entities */
// app/(public)/how-it-works/HowItWorksContent.tsx
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Video,
  Award,
  Bell,
  BarChart,
  Smartphone,
  Globe,
  Shield,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  Briefcase,
  UserCircle,
  Calendar,
  FileCheck,
  Landmark,
  Clock,
  Zap,
  Wallet,
  QrCode,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Rocket,
  LucideIcon,
} from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface StepProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  step: number;
}

interface ComparisonRowProps {
  feature: string;
  eventbrite: string;
  manual: string;
  nuruvent: string;
}

export function HowItWorksContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#202124]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white dark:from-[#202124] dark:to-[#2D2E32] py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium mb-6">
              <Sparkles className="w-5 h-5" />
              Simple. Seamless. Illuminating.
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-dark dark:text-white mb-6 leading-tight">
              How{' '}
              <span className="text-primary dark:text-primary-400">
                Nuruvent
              </span>{' '}
              Works
            </h1>
            <p className="text-xl md:text-2xl text-neutral-gray dark:text-muted-foreground max-w-2xl mx-auto">
              From event creation to certificate delivery — we handle the
              complexity so you can focus on training and professional
              development.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Overview — Six Audience Tracks */}
      <section className="py-12 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[
              {
                icon: Building2,
                title: 'Training Institutes',
                desc: 'Courses, workshops, bootcamps',
                color: 'primary',
              },
              {
                icon: UserCircle,
                title: 'Professional Coaches',
                desc: 'Workshops, seminars, webinars',
                color: 'secondary',
              },
              {
                icon: Briefcase,
                title: 'Corporate HR Teams',
                desc: 'Staff training, team-building',
                color: 'tertiary',
              },
              {
                icon: GraduationCap,
                title: 'Professional Bodies',
                desc: 'CPD events, AGMs, conferences',
                color: 'error',
              },
              {
                icon: Users,
                title: 'Individual Trainers',
                desc: 'Coaching, consulting, training',
                color: 'primary',
              },
              {
                icon: Globe,
                title: 'Global Learners',
                desc: 'Upskill, reskill, advance careers',
                color: 'secondary',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#2D2E32] rounded-2xl p-5 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div
                  className={`w-12 h-12 rounded-full ${item.color === 'primary' ? 'bg-primary/10 text-primary' : ''} ${item.color === 'secondary' ? 'bg-secondary/10 text-secondary-600' : ''} ${item.color === 'tertiary' ? 'bg-tertiary/10 text-tertiary-600' : ''} ${item.color === 'error' ? 'bg-error/10 text-error-500' : ''} mx-auto flex items-center justify-center mb-3`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-neutral-dark dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-gray dark:text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-base text-neutral-gray dark:text-muted-foreground mt-4 max-w-3xl mx-auto">
            From universities and NGOs to professional associations and
            independent trainers — Nuruvent serves the entire professional
            development ecosystem.
          </p>
        </div>
      </section>

      {/* Two-Track Flow: Hosts & Attendees */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-dark dark:text-white mb-4">
              Two Journeys,{' '}
              <span className="text-primary dark:text-primary-400">
                One Platform
              </span>
            </h2>
            <p className="text-xl text-neutral-gray dark:text-muted-foreground max-w-2xl mx-auto">
              Whether you're creating events or advancing your career.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Host Track */}
            <div className="bg-white dark:bg-[#2D2E32] rounded-2xl border border-[#E8EAED] dark:border-[#3C4043] shadow-sm overflow-hidden">
              <div className="bg-primary/5 dark:bg-primary/10 px-6 py-4 border-b border-[#E8EAED] dark:border-[#3C4043]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-dark dark:text-white">
                    For Training Hosts
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[
                  {
                    icon: Calendar,
                    title: 'Create Your Event',
                    desc: 'Set event details, training type, ticket price, and certificate fee. Add your existing Zoom or Google Meet link.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Get Paid Automatically',
                    desc: 'Attendees pay with M-Pesa, Airtel Money, or card. No manual reconciliation — saves 60 minutes per event.',
                  },
                  {
                    icon: Video,
                    title: 'Run Your Training',
                    desc: 'Use your own Zoom or Google Meet. No new software. Attendance is auto-tracked via webhooks and APIs.',
                  },
                  {
                    icon: Award,
                    title: 'Issue Verified Certificates',
                    desc: 'QR-verified CPD certificates sent automatically. Prevents forgery and protects credential integrity.',
                  },
                  {
                    icon: Clock,
                    title: 'Get Paid in 7 Days',
                    desc: 'Fast payouts to mobile money or bank. No 30-day wait. Better cash flow for your training business.',
                  },
                ].map((step, idx) => (
                  <StepCard key={idx} step={idx + 1} {...step} />
                ))}
              </div>
            </div>

            {/* Attendee Track */}
            <div className="bg-white dark:bg-[#2D2E32] rounded-2xl border border-[#E8EAED] dark:border-[#3C4043] shadow-sm overflow-hidden">
              <div className="bg-secondary/5 dark:bg-secondary/10 px-6 py-4 border-b border-[#E8EAED] dark:border-[#3C4043]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-neutral-dark flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-dark dark:text-white">
                    For Training Attendees
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[
                  {
                    icon: Globe,
                    title: 'Discover Events',
                    desc: 'Find workshops, webinars, bootcamps, and meetups via the marketplace, WhatsApp, or partner networks.',
                  },
                  {
                    icon: Smartphone,
                    title: 'Register & Pay in Seconds',
                    desc: 'Click register and pay with M-Pesa, Airtel Money, or card. Instant confirmation via email and WhatsApp.',
                  },
                  {
                    icon: Bell,
                    title: 'Get Automated Reminders',
                    desc: 'Receive WhatsApp, SMS, and email reminders at 24 hours, 1 hour, and 10 minutes before your event.',
                  },
                  {
                    icon: Video,
                    title: 'Attend via Zoom or Google Meet',
                    desc: 'Click the join link and participate. No new apps. Attendance tracked automatically for CPD credit.',
                  },
                  {
                    icon: FileCheck,
                    title: 'Receive QR-Verified Certificates',
                    desc: 'Get your CPD certificate within 1 hour. Instantly verifiable by employers and professional bodies.',
                  },
                ].map((step, idx) => (
                  <StepCard key={idx} step={idx + 1} {...step} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-dark dark:text-white mb-4">
              Flexible{' '}
              <span className="text-primary dark:text-primary-400">
                Payment Options
              </span>
            </h2>
            <p className="text-xl text-neutral-gray dark:text-muted-foreground max-w-2xl mx-auto">
              Choose what works for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#2D2E32] rounded-2xl p-6 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-dark dark:text-white">M-Pesa</h3>
              <p className="text-sm text-neutral-gray dark:text-muted-foreground mt-1">
                Pay in seconds with STK push.
              </p>
            </div>
            <div className="bg-white dark:bg-[#2D2E32] rounded-2xl p-6 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary-700 mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-dark dark:text-white">Airtel Money</h3>
              <p className="text-sm text-neutral-gray dark:text-muted-foreground mt-1">
                Mobile money for Airtel users.
              </p>
            </div>
            <div className="bg-white dark:bg-[#2D2E32] rounded-2xl p-6 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary/10 text-tertiary-600 mx-auto flex items-center justify-center mb-3">
                <Landmark className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-dark dark:text-white">Card Payments</h3>
              <p className="text-sm text-neutral-gray dark:text-muted-foreground mt-1">
                Visa, Mastercard, and more.
              </p>
            </div>
          </div>
          <p className="text-center text-base text-neutral-gray dark:text-muted-foreground mt-6 max-w-2xl mx-auto">
            No bank account required for mobile money users. Financial inclusion
            for professional development.
          </p>
        </div>
      </section>


      {/* Comparison Table */}
      <section className="py-16 bg-neutral-light/50 dark:bg-[#2D2E32]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-dark dark:text-white mb-4">
              How We{' '}
              <span className="text-primary dark:text-primary-400">
                Compare
              </span>
            </h2>
            <p className="text-xl text-neutral-gray dark:text-muted-foreground max-w-2xl mx-auto">
              Nuruvent vs. the alternatives.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-primary/5 dark:bg-primary/10">
                  <th className="text-left px-4 py-4 text-base font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Feature
                  </th>
                  <th className="text-center px-4 py-4 text-base font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Eventbrite
                  </th>
                  <th className="text-center px-4 py-4 text-base font-semibold text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
                    Manual
                  </th>
                  <th className="text-center px-4 py-4 text-base font-semibold text-primary dark:text-primary-400 border border-[#E8EAED] dark:border-[#3C4043] bg-primary/5 dark:bg-primary/10">
                    Nuruvent
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Payment', eventbrite: 'Cards only', manual: 'Manual reconciliation', nuruvent: 'M-Pesa, Airtel, Cards' },
                  { feature: 'Video', eventbrite: 'None', manual: 'Manual link sharing', nuruvent: "Host's Zoom/Meet" },
                  { feature: 'Certificates', eventbrite: 'No', manual: 'Manual PDF', nuruvent: 'Auto + QR verification' },
                  { feature: 'Attendance', eventbrite: 'No', manual: 'Manual roll-call', nuruvent: 'Auto via Zoom/Meet API' },
                  { feature: 'CPD Tracking', eventbrite: 'No', manual: 'Manual tracking', nuruvent: 'Auto-tracking' },
                  { feature: 'Discovery', eventbrite: 'Expensive', manual: 'None', nuruvent: 'Marketplace + SEO' },
                  { feature: 'Fees', eventbrite: '18.5%', manual: '0% (manual work)', nuruvent: '3.5%' },
                  { feature: 'Payouts', eventbrite: '30 days', manual: 'Instant (manual)', nuruvent: '7 days' },
                  { feature: 'Reminders', eventbrite: 'No', manual: 'Manual', nuruvent: 'Auto WhatsApp + SMS + Email' },
                  { feature: 'Replays', eventbrite: 'No', manual: 'Manual upload', nuruvent: '30-day hosted' },
                ].map((row, idx) => (
                  <ComparisonRow key={idx} {...row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The Nuruvent Difference */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-[#202124] dark:to-[#2D2E32] rounded-3xl p-8 md:p-12 border border-[#E8EAED] dark:border-[#3C4043]">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-neutral-dark dark:text-white mb-4">
                Professional Development Infrastructure
              </h2>
              <p className="text-lg text-neutral-gray dark:text-muted-foreground max-w-2xl mx-auto">
                From training institutes and corporate HR teams to professional
                bodies and independent coaches — we handle the complexity so you
                can focus on impact.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div>
                  <div className="text-2xl font-bold text-primary dark:text-primary-400">10,000+</div>
                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">Annual Training Events</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary-700 dark:text-secondary-300">250,000+</div>
                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">Professional Body Members</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-tertiary-600 dark:text-tertiary-300">80%+</div>
                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">Mobile Money Penetration</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-error-500 dark:text-error-400">Global</div>
                  <p className="text-sm text-neutral-gray dark:text-muted-foreground">Available Worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Light Background */}
      <section className="py-16 bg-neutral-light/50 dark:bg-[#2D2E32]/30 border-t border-[#E8EAED] dark:border-[#3C4043]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-neutral-dark dark:text-white mb-4">
            Ready to Illuminate Your Training Events?
          </h2>
          <p className="text-xl text-neutral-gray dark:text-muted-foreground max-w-xl mx-auto mb-8">
            Join training providers and professionals saving time, reducing
            fraud, and advancing careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary-600 transition-colors shadow-sm"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#2D2E32] text-neutral-dark dark:text-white px-8 py-4 rounded-full font-medium text-lg border border-[#E8EAED] dark:border-[#3C4043] hover:border-primary hover:text-primary transition-colors"
            >
              Find Training Events
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-base text-neutral-gray dark:text-muted-foreground mt-6">
            No setup fees. No hidden costs. 3.5% commission only.
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StepCard({ icon: Icon, title, desc, step }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div>
        <h4 className="font-medium text-base text-neutral-dark dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-neutral-gray dark:text-muted-foreground">
          {desc}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-[#2D2E32] rounded-2xl p-6 border border-[#E8EAED] dark:border-[#3C4043] shadow-sm hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg text-neutral-dark dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-gray dark:text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function ComparisonRow({ feature, eventbrite, manual, nuruvent }: ComparisonRowProps) {
  return (
    <tr className="bg-white dark:bg-[#202124] hover:bg-neutral-light/50 dark:hover:bg-[#2D2E32]/30 transition-colors">
      <td className="px-4 py-3 text-base font-medium text-neutral-dark dark:text-white border border-[#E8EAED] dark:border-[#3C4043]">
        {feature}
      </td>
      <td className="px-4 py-3 text-base text-center text-neutral-gray dark:text-muted-foreground border border-[#E8EAED] dark:border-[#3C4043]">
        {eventbrite}
      </td>
      <td className="px-4 py-3 text-base text-center text-neutral-gray dark:text-muted-foreground border border-[#E8EAED] dark:border-[#3C4043]">
        {manual}
      </td>
      <td className="px-4 py-3 text-base text-center text-primary dark:text-primary-400 font-medium border border-[#E8EAED] dark:border-[#3C4043] bg-primary/5 dark:bg-primary/10">
        {nuruvent}
      </td>
    </tr>
  );
}