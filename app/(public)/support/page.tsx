// app/support/page.tsx

import type { Metadata } from 'next';
import {
  Award,
  ArrowRight,
  Calendar,
  CreditCard,
  HelpCircle,
  Mail,
  MessageCircle,
  Plug,
  Search,
  ShieldCheck,
  Video,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support — Nuruvent',
  description: 'Get help with Nuruvent.',
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      {/* Header */}
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
          <HelpCircle className="h-3.5 w-3.5" />
          Support
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          How can we help?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Get direct support from the Nuruvent team, browse common topics, or
          report a security issue.
        </p>
      </header>

      {/* Contact card */}
      <section className="mb-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            label="Email us"
            value="support@nuruvent.com"
            href="mailto:support@nuruvent.com"
            hint="Response within 2 business days"
          />
          <ContactCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Report a vulnerability"
            value="security@nuruvent.com"
            href="mailto:security@nuruvent.com"
            hint="Acknowledged within 48 hours"
          />
          <ContactCard
            icon={<Plug className="h-5 w-5" />}
            label="Zoom integration"
            value="View the setup guide"
            href="/docs/zoom"
            hint="Connect, use, and remove Zoom"
          />
        </div>
      </section>

      {/* Topics grid */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Common topics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TopicCard
            icon={<Calendar className="h-5 w-5" />}
            title="Creating events and courses"
            description="Set up events, configure tickets, manage schedules, and publish when ready."
          />
          <TopicCard
            icon={<Plug className="h-5 w-5" />}
            title="Setting up your team"
            description="Create teams, invite trainers, assign roles, and switch between teams."
          />
          <TopicCard
            icon={<CreditCard className="h-5 w-5" />}
            title="Payments and payouts"
            description="Connect mobile money or bank accounts, manage payouts, and view receipts."
          />
          <TopicCard
            icon={<Award className="h-5 w-5" />}
            title="Certificates and CPD"
            description="Issue QR-verified certificates and track CPD credits automatically."
          />
          <TopicCard
            icon={<Search className="h-5 w-5" />}
            title="Finding training"
            description="Discover events and courses by type, format, price, date, and location."
          />
          <TopicCard
            icon={<Video className="h-5 w-5" />}
            title="Connecting Zoom"
            description="Link your Zoom account and let Nuruvent create meeting links for you."
          />
        </div>
      </section>

      {/* Detailed help */}
      <Section
        number="1"
        title="For Trainers"
        icon={<Calendar className="h-5 w-5" />}
      >
        <SubSection title="Creating Events and Courses">
          <p className="text-base text-muted-foreground">
            Go to <Bold>Dashboard → Events</Bold> and click{' '}
            <Bold>Create Event</Bold>. Fill in the details, configure your
            tickets, and publish when ready. Drafts remain private until
            published.
          </p>
        </SubSection>

        <SubSection title="Setting Up Your Team">
          <p className="text-base text-muted-foreground">
            Go to <Bold>Dashboard → Teams</Bold> and click{' '}
            <Bold>Create Team</Bold>. Invite trainers by email, assign roles
            (account admin, event manager, team member), and share resources.
            You can belong to multiple teams and switch between them from the
            team switcher.
          </p>
        </SubSection>

        <SubSection title="Payments and Payouts">
          <p className="text-base text-muted-foreground">
            Connect your mobile money or bank account in{' '}
            <Bold>Dashboard → Payments</Bold>. Payouts are processed on the
            schedule published on our pricing page. Payment receipts and payout
            confirmations are sent via email and WhatsApp.
          </p>
        </SubSection>

        <SubSection title="Issuing Certificates">
          <p className="text-base text-muted-foreground">
            Certificates are issued automatically after attendance is confirmed.
            You can customize certificate templates under{' '}
            <Bold>Dashboard → Certificates</Bold>. Each certificate includes a
            QR code for verification.
          </p>
        </SubSection>

        <SubSection title="CPD Tracking">
          <p className="text-base text-muted-foreground">
            For events that award CPD credits, attendance is tracked
            automatically and credits are recorded against each attendee. CPD
            reports can be exported from <Bold>Dashboard → Reports</Bold>.
          </p>
        </SubSection>
      </Section>

      <Section
        number="2"
        title="For Learners"
        icon={<Search className="h-5 w-5" />}
      >
        <SubSection title="Finding Training">
          <p className="text-base text-muted-foreground">
            Use the search bar and filters on the home page to find events and
            courses by type, format, price, date, and location. Events near you
            are shown first.
          </p>
        </SubSection>

        <SubSection title="Registering and Paying">
          <p className="text-base text-muted-foreground">
            Click <Bold>Register</Bold> on any event and choose your ticket. Pay
            with mobile money (M-Pesa, Airtel Money, MTN MoMo) or card. You will
            receive a confirmation by email and WhatsApp.
          </p>
        </SubSection>

        <SubSection title="Certificates and CPD">
          <p className="text-base text-muted-foreground">
            After attending an event, your certificate is issued automatically
            and appears in <Bold>Dashboard → Certificates</Bold>. CPD credits
            are tracked in <Bold>Dashboard → CPD</Bold>.
          </p>
        </SubSection>

        <SubSection title="Verifying a Certificate">
          <p className="text-base text-muted-foreground">
            Scan the QR code on any Nuruvent certificate or visit{' '}
            <Bold>/verify</Bold> and enter the certificate ID. Verification is
            instant.
          </p>
        </SubSection>
      </Section>

      <Section
        number="3"
        title="Connecting Zoom"
        icon={<Video className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Go to <Bold>Dashboard → Settings → Integrations</Bold> and click{' '}
          <Bold>Connect</Bold> on the Zoom row. You will be redirected to Zoom
          to authorize Nuruvent. See the{' '}
          <a
            href="/docs/zoom"
            className="text-primary hover:underline font-medium"
          >
            Zoom Integration Guide
          </a>{' '}
          for full details.
        </p>
      </Section>

      <Section
        number="4"
        title="Reporting a Problem"
        icon={<MessageCircle className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          Include the following when contacting support so we can help faster:
        </p>
        <BulletList
          items={[
            'Your account email',
            'A description of the issue',
            'Any error message you saw',
            'The approximate time the issue occurred',
            'Your device and browser, if relevant',
          ]}
        />
      </Section>

      {/* Footer CTA */}
      <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Still need help?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our team responds to every support request within 2 business days.
            </p>
          </div>
          <a
            href="mailto:support@nuruvent.com"
            className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-3 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact support
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PRIMITIVES
// ============================================================

function Section({
  number,
  title,
  icon,
  children,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Topic {number}
          </p>
          <h2 className="text-2xl font-semibold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <div className="pl-0 sm:pl-13 space-y-5">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors block"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-semibold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
    </a>
  );
}

function TopicCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}