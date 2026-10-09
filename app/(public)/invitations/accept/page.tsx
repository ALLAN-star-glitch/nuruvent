// app/(dashboard)/invitations/accept/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Shield,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useValidateInvitationQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from '@/lib/store/api/teamsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';
import { cn } from '@/lib/utils';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const {
    data: invitation,
    isLoading: validating,
    isError: invalid,
  } = useValidateInvitationQuery(token ?? '', { skip: !token });

  const [accept, { isLoading: accepting }] = useAcceptInvitationMutation();
  const [decline, { isLoading: declining }] = useDeclineInvitationMutation();

  const [done, setDone] = useState<'accepted' | 'declined' | null>(null);

  // No token → bail.
  useEffect(() => {
    if (!token) {
      toast.error('Missing invitation token');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      const result = await accept(token).unwrap();
      toast.success('Invitation accepted');
      setDone('accepted');

      // Redirect to the team dashboard.
      const teamId = result.member.team_id;
      // We don't know the accountId from this response alone.
      // Fall back to the teams list.
      router.push(`/dashboard`);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to accept invitation';
      toast.error(message);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    try {
      await decline(token).unwrap();
      toast.success('Invitation declined');
      setDone('declined');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to decline invitation';
      toast.error(message);
    }
  };

  // ---- No token ----
  if (!token) {
    return (
      <Centered>
        <StatusCard
          icon={AlertCircle}
          tone="destructive"
          title="Invalid link"
          description="This invitation link is missing its token."
          action={
            <Button asChild className="cursor-pointer">
              <Link href="/">Go home</Link>
            </Button>
          }
        />
      </Centered>
    );
  }

  // ---- Validating ----
  if (validating) {
    return (
      <Centered>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Centered>
    );
  }

  // ---- Invalid / expired ----
  if (invalid || !invitation) {
    return (
      <Centered>
        <StatusCard
          icon={XCircle}
          tone="destructive"
          title="Invitation not valid"
          description="This invitation has expired, been revoked, or already been accepted."
          action={
            <Button asChild className="cursor-pointer">
              <Link href="/">Go home</Link>
            </Button>
          }
        />
      </Centered>
    );
  }

  // ---- Done ----
  if (done) {
    return (
      <Centered>
        <StatusCard
          icon={CheckCircle2}
          tone="success"
          title={done === 'accepted' ? 'Welcome aboard' : 'Invitation declined'}
          description={
            done === 'accepted'
              ? "You've joined the team."
              : "You declined this invitation."
          }
          action={
            <Button
              onClick={() => router.push('/dashboard')}
              className="cursor-pointer gap-2"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      </Centered>
    );
  }

  // ---- Login prompt ----
  if (!isAuthenticated) {
    const next = `/invitations/accept?token=${encodeURIComponent(token)}`;
    return (
      <Centered>
        <StatusCard
          icon={Mail}
          tone="primary"
          title="Sign in to accept"
          description={`You've been invited as ${invitation.email}. Sign in or create an account to accept.`}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="cursor-pointer">
                <Link href={`/signin?next=${encodeURIComponent(next)}`}>
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="cursor-pointer"
              >
                <Link href={`/register?token=${encodeURIComponent(token)}`}>
                  Create account
                </Link>
              </Button>
            </div>
          }
        />
      </Centered>
    );
  }

  // ---- Valid + authenticated → show accept/decline ----
  return (
    <Centered>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Team invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a team on Nuruvent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
            <Row label="Email">
              <span className="truncate text-sm">{invitation.email}</span>
            </Row>
            <Row label="Expires">
              <span className="text-sm">
                {new Date(invitation.expires_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </Row>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAccept}
              disabled={accepting || declining}
              className="flex-1 cursor-pointer gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Accepting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </>
              )}
            </Button>
            <Button
              onClick={handleDecline}
              disabled={accepting || declining}
              variant="outline"
              className="flex-1 cursor-pointer"
            >
              {declining ? 'Declining…' : 'Decline'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Centered>
  );
}

// ============================================================
// HELPERS
// ============================================================

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  description,
  action,
  tone = 'primary',
}: {
  icon: typeof AlertCircle;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: 'primary' | 'success' | 'destructive';
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    destructive: 'bg-destructive/10 text-destructive',
  }[tone];

  return (
    <div className="w-full max-w-md text-center">
      <div
        className={cn(
          'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
          toneClass,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}