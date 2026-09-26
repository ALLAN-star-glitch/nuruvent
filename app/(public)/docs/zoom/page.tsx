// app/docs/zoom/page.tsx

import type { Metadata } from 'next';
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  LayoutDashboard,
  Link2,
  Plug,
  Settings,
  ShieldCheck,
  Video,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zoom Integration Guide — Nuruvent',
  description:
    'How to add, use, and remove the Nuruvent integration with Zoom.',
};

export default function ZoomDocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      {/* Header */}
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
          <Video className="h-3.5 w-3.5" />
          Zoom Integration
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Nuruvent Zoom Integration Guide
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Connect your Zoom account so Nuruvent can create meeting links
          automatically for your virtual sessions, track attendance, and issue
          certificates — without leaving the platform.
        </p>
      </header>

      {/* Where you'll find it */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Where you can manage Zoom in Nuruvent
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          The Zoom connection is available from three places. All three lead to
          the same platform picker.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <EntryCard
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Dashboard"
            description="The platform banner at the top of your dashboard lets you connect or manage platforms in one click."
          />
          <EntryCard
            icon={<Settings className="h-5 w-5" />}
            title="Settings → Integrations"
            description="Manage every video platform connection from a single settings tab, including Zoom."
          />
          <EntryCard
            icon={<CalendarPlus className="h-5 w-5" />}
            title="Create / Edit Event"
            description="When you toggle Virtual session in the schedule, you can connect Zoom or paste a link right there."
          />
        </div>
      </section>

      {/* Prerequisites */}
      <Section
        number="1"
        title="Prerequisites"
        icon={<CheckCircle2 className="h-5 w-5" />}
      >
        <BulletList
          items={[
            'An active Nuruvent account.',
            'A Zoom account (free or paid).',
            'Administrative permission on your Zoom account to authorize apps.',
          ]}
        />
      </Section>

      {/* Adding */}
      <Section
        number="2"
        title="Adding the App (Connecting Zoom)"
        icon={<Plug className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          You can start this flow from any of the three locations above. The
          steps below use the Dashboard as an example.
        </p>
        <NumberedList
          items={[
            <>
              Log in to Nuruvent at{' '}
              <ExternalLink text="https://nuruvent.com" href="https://nuruvent.com" />
              .
            </>,
            <>
              On the Dashboard, look for the <Bold>Connect a video platform</Bold> banner
              at the top. Click <Bold>Connect platform</Bold>, or click the Zoom
              logo directly to jump straight into Zoom&apos;s detail view.
            </>,
            <>
              You can also reach the same flow from{' '}
              <Bold>Dashboard → Settings → Integrations</Bold>, or while creating
              or editing an event by toggling <Bold>Virtual session</Bold> in the
              schedule.
            </>,
            <>You will be redirected to Zoom. Log in if prompted.</>,
            <>
              Review the permissions Nuruvent is requesting:
              <ul className="mt-2 list-disc pl-6 space-y-1.5 text-muted-foreground">
                <li>
                  <Bold>Create and manage meetings</Bold> — used to create
                  meetings for your virtual sessions.
                </li>
                <li>
                  <Bold>View your Zoom user information</Bold> — used to display
                  the connected account email in your dashboard.
                </li>
              </ul>
            </>,
            <>
              Click <Bold>Allow</Bold> to authorize Nuruvent.
            </>,
            <>
              You will be redirected back to Nuruvent. Your Zoom account will
              now appear as <Bold>Connected</Bold> in the platform picker and in
              Settings → Integrations.
            </>,
          ]}
        />
      </Section>

      {/* Using */}
      <Section
        number="3"
        title="Using the App"
        icon={<Video className="h-5 w-5" />}
      >
        <SubSection title="Creating a Virtual Session with Zoom">
          <NumberedList
            items={[
              <>
                Go to <Bold>Dashboard → Events</Bold> and create or edit an
                event.
              </>,
              <>
                Add or edit a session in the <Bold>Schedule</Bold> section.
              </>,
              <>
                Toggle <Bold>Virtual session</Bold> on.
              </>,
              <>
                If your Zoom account is connected, Nuruvent will offer to create
                the meeting automatically. Confirm to generate a Zoom meeting
                for this session.
              </>,
              <>
                The meeting join link appears in the session summary and is
                shown to attendees after registration.
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="Manually Pasting a Zoom Link">
          <NumberedList
            items={[
              <>
                Toggle <Bold>Virtual session</Bold> on.
              </>,
              <>
                Click <Bold>Paste a link manually</Bold>. The Zoom link field
                appears next to the Zoom logo.
              </>,
              <>
                Paste your Zoom meeting URL into the <Bold>Zoom Link</Bold>{' '}
                field.
              </>,
              <>
                Save the session. The link is displayed to attendees.
              </>,
            ]}
          />
          <Callout icon={<Link2 className="h-4 w-4" />}>
            Manual links do not enable automatic attendance tracking. To track
            attendance and issue certificates, connect your Zoom account instead.
          </Callout>
        </SubSection>

        <SubSection title="Tracking Attendance">
          <p className="text-base text-muted-foreground">
            When a Zoom meeting is created automatically through Nuruvent, Zoom
            sends participant events to Nuruvent in real time. Attendance is
            recorded automatically and visible in the session&apos;s{' '}
            <Bold>Attendance</Bold> tab. Attendance can then be used to issue
            certificates and to award CPD credits.
          </p>
        </SubSection>
      </Section>

      {/* Managing */}
      <Section
        number="4"
        title="Managing the Connection"
        icon={<Settings className="h-5 w-5" />}
      >
        <SubSection title="Viewing Connection Status">
          <p className="text-base text-muted-foreground">
            Go to <Bold>Dashboard → Settings → Integrations</Bold>. The Zoom row
            shows the connected Zoom email address, the date the connection was
            established, and a <Bold>Manage</Bold> action. The same status is
            visible on the Dashboard banner and in the event schedule when you
            toggle Virtual session.
          </p>
        </SubSection>

        <SubSection title="Reconnecting">
          <p className="text-base text-muted-foreground">
            If your Zoom authorization expires or is revoked, the integration
            will show as <Bold>Needs reauthorization</Bold>. Click{' '}
            <Bold>Connect</Bold> from any of the three locations to re-authorize
            your Zoom account.
          </p>
        </SubSection>
      </Section>

      {/* Removing */}
      <Section
        number="5"
        title="Removing the App (Disconnecting Zoom)"
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground mb-4">
          You can disconnect Zoom in two ways. Both revoke the OAuth tokens and
          delete the connection record.
        </p>

        <SubSection title="From Nuruvent">
          <NumberedList
            items={[
              <>
                Go to <Bold>Dashboard → Settings → Integrations</Bold>, or open
                the platform picker from the Dashboard banner or an event
                schedule.
              </>,
              <>
                Locate <Bold>Zoom</Bold> and click <Bold>Manage</Bold>, then{' '}
                <Bold>Disconnect</Bold>.
              </>,
              <>
                Nuruvent revokes the OAuth tokens with Zoom and deletes them
                from our systems.
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="From Zoom">
          <NumberedList
            items={[
              <>Log in to your Zoom account.</>,
              <>
                Go to the <Bold>Zoom App Marketplace</Bold> and open{' '}
                <Bold>Manage → Installed Apps</Bold>.
              </>,
              <>
                Locate <Bold>Nuruvent</Bold> and click <Bold>Uninstall</Bold>.
              </>,
              <>
                Zoom notifies Nuruvent through a deauthorization event.
                Nuruvent deletes all tokens and connection records associated
                with your account.
              </>,
            ]}
          />
        </SubSection>
      </Section>

      {/* Data handling */}
      <Section
        number="6"
        title="Data Handling"
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          For details on what data Nuruvent collects through the Zoom
          integration, how it is protected, and how it is deleted, see our{' '}
          <a href="/privacy" className="text-primary hover:underline font-medium">
            Privacy Policy
          </a>
          .
        </p>
      </Section>

      {/* Support */}
      <Section
        number="7"
        title="Support"
        icon={<Plug className="h-5 w-5" />}
      >
        <p className="text-base text-muted-foreground">
          If you encounter issues with the Zoom integration, contact{' '}
          <a
            href="mailto:support@nuruvent.com"
            className="text-primary hover:underline font-medium"
          >
            support@nuruvent.com
          </a>
          . We respond within 2 business days.
        </p>
      </Section>

      {/* Footer CTA */}
      <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Ready to connect Zoom?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open the platform picker and connect your account in under a
              minute.
            </p>
          </div>
          <a
            href="/dashboard/settings?tab=integrations"
            className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-3 transition-colors"
          >
            <Plug className="h-4 w-4" />
            Open Integrations
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
            Step {number}
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

function EntryCard({
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
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal pl-6 space-y-2.5 text-base text-muted-foreground">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ol>
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
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}

function ExternalLink({ text, href }: { text: string; href: string }) {
  return (
    <a
      href={href}
      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
    >
      {text}
    </a>
  );
}