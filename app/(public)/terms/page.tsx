// app/terms/page.tsx

import type { Metadata } from 'next';
import {
  Award,
  Building2,
  CreditCard,
  FileCheck2,
  FileText,
  Gavel,
  GraduationCap,
  ShieldCheck,
  Users,
  UserX,
  Video,
  XCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Use — Nuruvent',
  description: 'The terms governing your use of Nuruvent.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      {/* Header */}
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
          <FileText className="h-3.5 w-3.5" />
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Terms of Use
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          The agreement between you and Nuruvent governing your access to and
          use of the platform. Please read it carefully before using the
          Service.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective Date: [Insert Date]
        </p>
      </header>

      <Section
        number="1"
        title="Acceptance of Terms"
        icon={<FileCheck2 className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          By accessing or using Nuruvent (&quot;the Service&quot;), you agree to
          be bound by these Terms of Use. If you do not agree, do not use the
          Service.
        </p>
      </Section>

      <Section
        number="2"
        title="Description of Service"
        icon={<FileText className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Nuruvent is a global training discovery and management platform that
          connects trainers, institutions, and learners. The Service includes
          event and course creation, discovery, registration, payments,
          attendance tracking, certification, CPD tracking, team collaboration,
          and related features.
        </p>
      </Section>

      <Section
        number="3"
        title="Accounts"
        icon={<Users className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You must provide accurate information when creating an
          account and keep it up to date.
        </p>
      </Section>

      <Section
        number="4"
        title="Teams and Roles"
        icon={<Building2 className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Nuruvent supports teams with role-based access control. If you belong
          to a team, the team&apos;s account admin controls your role and
          access. You may belong to multiple teams with different roles. You are
          responsible for activity performed under your account within any team.
        </p>
      </Section>

      <Section
        number="5"
        title="Trainers and Event Organizers"
        icon={<GraduationCap className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          If you create events, courses, or teams as a trainer or organizer, you
          are solely responsible for:
        </p>
        <BulletList
          items={[
            'The accuracy of the event, course, ticket, and certificate information you publish.',
            'Delivering the training as described to registered attendees.',
            'Complying with applicable laws, including tax and consumer protection requirements.',
            'Honoring refund policies you have committed to for your events.',
          ]}
        />
      </Section>

      <Section
        number="6"
        title="Learners and Attendees"
        icon={<Users className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          If you register for events or courses, you agree to provide accurate
          registration information and to comply with the terms set by the
          organizer for that event. Nuruvent is not responsible for the quality,
          safety, or legality of events organized by third parties.
        </p>
      </Section>

      <Section
        number="7"
        title="Payments and Payouts"
        icon={<CreditCard className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          Payments are processed through third-party providers, including mobile
          money services and card processors. Payouts to trainers and teams are
          made on the schedule published on our pricing page. Applicable
          platform fees, payment provider fees, and taxes are deducted from
          payouts as described at the point of sale.
        </p>
        <p className="text-base text-muted-foreground">
          Refunds are governed by the refund policy stated at the point of
          purchase for each event or course. Nuruvent facilitates refunds but is
          not the merchant of record for third-party events.
        </p>
      </Section>

      <Section
        number="8"
        title="Certificates and CPD"
        icon={<Award className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Certificates issued through Nuruvent are QR-verified. The accuracy of
          the information on a certificate (name, event, CPD hours) is the
          responsibility of the organizer. Nuruvent provides the technical
          verification but does not independently certify the quality of any
          training.
        </p>
      </Section>

      <Section
        number="9"
        title="Third-Party Integrations"
        icon={<Video className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          The Service allows you to connect third-party accounts, including
          Zoom, payment providers, and messaging providers. By connecting a
          third-party account, you authorize Nuruvent to access and use that
          account as described in our Privacy Policy. Your use of third-party
          services is also governed by their own terms and privacy policies.
        </p>
      </Section>

      <Section
        number="10"
        title="Acceptable Use"
        icon={<XCircle className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          You agree not to:
        </p>
        <BulletList
          items={[
            'Use the Service for any unlawful purpose.',
            'Attempt to gain unauthorized access to the Service or its infrastructure.',
            'Interfere with or disrupt the Service.',
            'Resell or sublicense the Service without written permission.',
            'Use the Service to send spam or unsolicited communications.',
            'Publish events or courses that are fraudulent, misleading, or violate third-party rights.',
            'Forge, alter, or misuse certificates issued through the Service.',
          ]}
        />
      </Section>

      <Section
        number="11"
        title="Content"
        icon={<FileText className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          You retain ownership of content you create or upload. By using the
          Service, you grant Nuruvent a limited license to host, store, display,
          and distribute that content solely for the purpose of operating the
          Service.
        </p>
      </Section>

      <Section
        number="12"
        title="Fees"
        icon={<CreditCard className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          Certain features require payment. Fees are described on our pricing
          page and at the point of purchase. Fees are non-refundable except
          where required by law or stated in the applicable refund policy.
        </p>
      </Section>

      <Section
        number="13"
        title="Termination"
        icon={<UserX className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          You may stop using the Service at any time. We may suspend or
          terminate your access if you violate these Terms or if required by
          law. On termination, your data is handled per our Privacy Policy.
        </p>
      </Section>

      <Section
        number="14"
        title="Disclaimers"
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          The Service is provided &quot;as is&quot; without warranties of any
          kind, express or implied, including merchantability, fitness for a
          particular purpose, and non-infringement. Nuruvent does not guarantee
          that any training, certificate, or CPD credit will be accepted by any
          employer, professional body, or institution.
        </p>
      </Section>

      <Section
        number="15"
        title="Limitation of Liability"
        icon={<Gavel className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          To the maximum extent permitted by law, Nuruvent&apos;s total
          liability arising out of or related to these Terms is limited to the
          amount you paid for the Service in the 12 months preceding the claim.
        </p>
      </Section>

      <Section
        number="16"
        title="Changes to These Terms"
        icon={<FileCheck2 className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          We may update these Terms from time to time. Material changes will be
          communicated through the Service or by email. Continued use after
          changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section
        number="17"
        title="Governing Law"
        icon={<Gavel className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
        These Terms are governed by the laws of Kenya, without regard to conflict-of-law principles.
        </p>
      </Section>

      <Section
        number="18"
        title="Contact"
        icon={<Building2 className="h-5 w-5" />}
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Legal Contact
              </p>
              <a
                href="mailto:legal@nuruvent.com"
                className="text-primary hover:underline font-medium text-base"
              >
                legal@nuruvent.com
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