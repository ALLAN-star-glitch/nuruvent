// app/(public)/help/page.tsx

import { HelpCircle, Mail, Phone, MessageCircle, Search, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Help Center | Nuruvent',
  description: 'Get help with Nuruvent. FAQs, support contact, and resources for hosts and attendees.',
};


export const dynamic = 'force-static';
export const revalidate = false;

const faqs = [
  {
    question: 'How do I create an event?',
    answer: 'Sign up as a host, click "Create Event", fill in your event details, set your ticket and certificate prices, add your Zoom or Google Meet link, and publish. Your event will be live on the Nuruvent marketplace.',
  },
  {
    question: 'How do attendees pay?',
    answer: 'Attendees pay via M-Pesa STK push in just 3 seconds. Payments are automatically reconciled, so you don\'t need to manually match payments to registrations.',
  },
  {
    question: 'How do I issue certificates?',
    answer: 'Upload your custom certificate design, and Nuruvent will auto-deliver QR-verified certificates to attendees via email and WhatsApp after the event.',
  },
  {
    question: 'When do I get paid?',
    answer: 'Payouts are processed every Monday. Nuruvent deducts 10% commission and sends the remaining amount to your M-Pesa account within 7 days.',
  },
  {
    question: 'Can I use my own Zoom or Google Meet?',
    answer: 'Yes! Nuruvent is a management layer — you keep using your existing Zoom or Google Meet accounts. We handle everything else.',
  },
  {
    question: 'What types of events can I host?',
    answer: 'You can host Workshops, Webinars, Bootcamps, and Meetups. All are professional training and development events.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How Can We Help You?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions or reach out to our support team.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
              >
                <details className="group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                    <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">Our support team is here to help you.</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="mailto:hello@nuruvent.com"
                className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
              >
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <span>hello@nuruvent.com</span>
              </a>
              <a
                href="tel:+254700000000"
                className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
              >
                <div className="bg-secondary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-secondary" />
                </div>
                <span>+254 700 000 000</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
              >
                <div className="bg-tertiary/10 p-2 rounded-full">
                  <MessageCircle className="h-5 w-5 text-tertiary" />
                </div>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}