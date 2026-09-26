// app/privacy/page.tsx

import type { Metadata } from 'next';
import {
  Building2,
  Cookie,
  Database,
  FileCheck2,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  Share2,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Nuruvent',
  description:
    'How Nuruvent collects, uses, shares, and retains personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      {/* Header */}
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          Privacy
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Nuruvent is a global training discovery and management platform that
          connects trainers, institutions, and learners. This policy explains
          what personal data we collect, why we collect it, how we protect it,
          and the choices you have.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective Date: [Insert Date]
        </p>
      </header>

      {/* TL;DR cards */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Database className="h-5 w-5" />}
            title="What we collect"
            description="Account, event, payment, attendance, and Zoom integration data."
          />
          <StatCard
            icon={<Lock className="h-5 w-5" />}
            title="How we protect it"
            description="AES-256-GCM at rest, TLS in transit, strict access controls."
          />
          <StatCard
            icon={<Share2 className="h-5 w-5" />}
            title="Who we share with"
            description="Render (hosting), Zoom, payment and messaging providers."
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5" />}
            title="Your rights"
            description="Access, correct, delete, export, or withdraw consent."
          />
        </div>
      </section>

      <Section
        number="1"
        title="Data We Collect"
        icon={<Database className="h-5 w-5" />}
      >
        <SubSection title="Account Data">
          <BulletList
            items={[
              'Name and display name',
              'Email address and phone number',
              'Authentication credentials (stored as salted hashes)',
              'Profile information you choose to provide',
              'Team memberships and roles',
            ]}
          />
        </SubSection>

        <SubSection title="Event and Course Data">
          <BulletList
            items={[
              'Events, courses, sessions, and schedules you create',
              'Ticket types, pricing, and capacity settings',
              'Speaker, material, and SEO content you provide',
              'Registrations, attendance, and completion records',
              'Certificates issued and their verification data',
            ]}
          />
        </SubSection>

        <SubSection title="Payment Data">
          <BulletList
            items={[
              'Transaction records (amount, currency, timestamp, status)',
              'Payment method references from mobile money providers and card processors — we do not store full card numbers',
              'Payout records to trainers and teams',
              'Refund and reconciliation records',
            ]}
          />
        </SubSection>

        <SubSection title="Zoom Account Data (when you connect Zoom)">
          <BulletList
            items={[
              'Zoom user ID, email, and account ID',
              'OAuth access token and refresh token',
              'Token expiry and granted scopes',
              'Meeting metadata: topic, join URL, start URL, password, start time, duration, timezone',
            ]}
          />
        </SubSection>

        <SubSection title="Attendance Data (from Zoom webhooks)">
          <BulletList
            items={[
              'Participant email address and display name',
              'Join and leave timestamps',
              'Meeting UUID and participant UUID',
            ]}
          />
        </SubSection>

        <SubSection title="Technical and Usage Data">
          <BulletList
            items={[
              'IP address, browser type, and device type',
              'Pages visited and actions taken within the application',
              'Log data related to errors and security events',
              'Location data derived from IP for localizing events',
            ]}
          />
        </SubSection>
      </Section>

      <Section
        number="2"
        title="How We Use Your Data"
        icon={<RefreshCw className="h-5 w-5" />}
      >
        <BulletList
          items={[
            'Provide and operate the Nuruvent platform.',
            'Authenticate you and secure your account.',
            'Enable discovery of events, courses, trainers, and training providers.',
            'Process payments, payouts, refunds, and reconciliation with mobile money and card providers.',
            'Track attendance and completion, and issue QR-verified certificates.',
            'Calculate CPD credits and generate CPD reports for professional bodies.',
            'Connect to Zoom on your behalf and create meetings for virtual sessions.',
            'Send transactional notifications (registration, reminders, certificates) via email, SMS, WhatsApp, and in-app push.',
            'Detect, investigate, and prevent security incidents.',
            'Comply with legal and tax obligations.',
          ]}
        />
        <Callout icon={<ShieldCheck className="h-4 w-4" />}>
          We do not sell your personal data. We do not use your data for
          third-party advertising.
        </Callout>
      </Section>

      <Section
        number="3"
        title="Legal Basis for Processing"
        icon={<FileCheck2 className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          Where the GDPR or similar laws apply, we process personal data on the
          following legal bases:
        </p>
        <BulletList
          items={[
            <><Bold>Contractual necessity</Bold> — to provide the services you have requested.</>,
            <><Bold>Legitimate interests</Bold> — to secure our platform, prevent abuse, and improve the service.</>,
            <><Bold>Consent</Bold> — where you have explicitly granted it, such as connecting your Zoom account or opting into marketing.</>,
            <><Bold>Legal obligation</Bold> — to comply with applicable law, including tax and financial record-keeping.</>,
          ]}
        />
      </Section>

      <Section
        number="4"
        title="How We Protect Your Data"
        icon={<Lock className="h-5 w-5" />}
      >
        <SubSection title="Encryption at Rest">
          <BulletList
            items={[
              'Zoom OAuth access and refresh tokens are encrypted with AES-256-GCM before storage.',
              'The encryption key is stored separately from the data and is never written to logs.',
              'The underlying database is encrypted at rest at the storage layer.',
            ]}
          />
        </SubSection>
        <SubSection title="Encryption in Transit">
          <BulletList
            items={[
              'All traffic to and from Nuruvent is served over HTTPS (TLS).',
              'All outbound calls to third-party providers (Zoom, payment gateways, messaging providers) use HTTPS.',
            ]}
          />
        </SubSection>
        <SubSection title="Access Control">
          <BulletList
            items={[
              'Access to production systems is restricted to authorized personnel.',
              'Team data is scoped by role — account admins, event managers, and team members see only what their role permits.',
            ]}
          />
        </SubSection>
        <SubSection title="Webhook Security">
          <BulletList
            items={[
              'Incoming webhooks from third-party providers are verified with HMAC signatures and protected against replay.',
            ]}
          />
        </SubSection>
      </Section>

      <Section
        number="5"
        title="Data Sharing"
        icon={<Share2 className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          We share data only with the following categories of recipients:
        </p>

        <SubSection title="Service Providers">
          <BulletList
            items={[
              <><Bold>Render (render.com)</Bold> — hosting and managed PostgreSQL database.</>,
              <><Bold>Zoom (zoom.us)</Bold> — OAuth authentication and meeting provisioning.</>,
              <><Bold>Mobile money providers</Bold> (e.g., Safaricom M-Pesa, Airtel Money, MTN MoMo) — payment processing.</>,
              <><Bold>Card processors</Bold> — card payment processing.</>,
              <><Bold>Email, SMS, and WhatsApp providers</Bold> — transactional notifications.</>,
            ]}
          />
        </SubSection>

        <SubSection title="Trainers and Institutions">
          <p className="text-base text-muted-foreground">
            When you register for an event or course, the organizer receives
            your registration details (name, email, ticket type, attendance
            status) so they can deliver the training and issue your certificate.
          </p>
        </SubSection>

        <SubSection title="Legal Requirements">
          <p className="text-base text-muted-foreground">
            We may disclose data if required by law, subpoena, or court order,
            or to protect the rights, property, or safety of Nuruvent, our
            users, or the public.
          </p>
        </SubSection>

        <Callout icon={<ShieldCheck className="h-4 w-4" />}>
          We do not sell personal data to third parties.
        </Callout>
      </Section>

      <Section
        number="6"
        title="Data Retention"
        icon={<Database className="h-5 w-5" />}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-base">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-foreground">
                  Data Type
                </th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">
                  Retention Period
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row
                k="Account data"
                v="While your account is active, plus 30 days after deletion request"
              />
              <Row
                k="Event and course data"
                v="Lifetime of the event or course, plus 12 months"
              />
              <Row
                k="Payment and payout records"
                v="7 years (legal and tax requirements)"
              />
              <Row
                k="Attendance and CPD records"
                v="Per the event owner's configured retention policy, minimum 3 years for CPD"
              />
              <Row
                k="Certificates"
                v="Indefinite, so verification remains available"
              />
              <Row
                k="Zoom OAuth tokens"
                v="While the connection is active; deleted immediately on disconnect or deauthorization"
              />
              <Row k="Technical logs" v="90 days" />
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        number="7"
        title="Your Data Rights"
        icon={<UserCheck className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          You have the right to:
        </p>
        <BulletList
          items={[
            'Access the personal data we hold about you.',
            'Correct inaccurate data.',
            'Request deletion of your data.',
            'Object to or restrict certain processing.',
            'Export your data in a portable format.',
            'Withdraw consent at any time (for example, by disconnecting your Zoom account or opting out of marketing).',
          ]}
        />
        <Callout icon={<Mail className="h-4 w-4" />}>
          To exercise any of these rights, email{' '}
          <a
            href="mailto:privacy@nuruvent.com"
            className="text-primary hover:underline font-medium"
          >
            privacy@nuruvent.com
          </a>
          . We respond to verified requests within 30 days. If you are in the
          EEA or UK, you may also lodge a complaint with your local data
          protection authority. If you are in Kenya, you may contact the Office
          of the Data Protection Commissioner.
        </Callout>
      </Section>

      <Section
        number="8"
        title="International Data Transfers"
        icon={<Globe className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Nuruvent&apos;s backend and database are hosted on Render.
          Render&apos;s infrastructure may store data in regions outside your
          own. Where required, we rely on standard contractual clauses or
          equivalent safeguards for such transfers.
        </p>
      </Section>

      <Section
        number="9"
        title="Children's Privacy"
        icon={<Users className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Nuruvent is not directed at children under 16. We do not knowingly
          collect personal data from children. If you believe a child has
          provided us with personal data, contact{' '}
          <a
            href="mailto:privacy@nuruvent.com"
            className="text-primary hover:underline font-medium"
          >
            privacy@nuruvent.com
          </a>{' '}
          and we will delete it.
        </p>
      </Section>

      <Section
        number="10"
        title="Cookies and Tracking"
        icon={<Cookie className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Nuruvent uses cookies and similar technologies strictly for
          authentication, session management, and platform preferences. We do
          not use third-party advertising cookies or cross-site trackers.
        </p>
      </Section>

      <Section
        number="11"
        title="Changes to This Policy"
        icon={<RefreshCw className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          We may update this Privacy Policy from time to time. When we do, we
          will revise the &quot;Effective Date&quot; at the top of this page.
          Material changes will be communicated through the application or by
          email.
        </p>
      </Section>

      <Section
        number="12"
        title="Contact"
        icon={<Building2 className="h-5 w-5" />}
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Data Protection Contact
              </p>
              <a
                href="mailto:privacy@nuruvent.com"
                className="text-primary hover:underline font-medium text-base"
              >
                privacy@nuruvent.com
              </a>
            </div>
          </div>
        </div>
      </Section>
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
            Section {number}
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

function StatCard({
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

function Callout({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="text-primary shrink-0 mt-0.5">{icon}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="px-5 py-3 font-medium text-foreground align-top">{k}</td>
      <td className="px-5 py-3 text-muted-foreground">{v}</td>
    </tr>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}