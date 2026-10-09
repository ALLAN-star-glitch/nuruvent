// app/register/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValidateInvitationQuery } from '@/lib/store/api/teamsApi';
import { useRegisterWithInvitationMutation } from '@/lib/store/api/authApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const {
    data: invitation,
    isLoading: validating,
    isError: invalid,
  } = useValidateInvitationQuery(token ?? '', { skip: !token });

  const [register, { isLoading: submitting }] =
    useRegisterWithInvitationMutation();

  const [form, setForm] = useState({ name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // An authenticated user on /register has already been joined to the
    // team by register-with-invitation. Send them straight to the app
    // instead of back to the accept page — the invitation is done.
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (!token) {
    return (
      <Shell>
        <StatusCard
          icon={AlertCircle}
          title="Invalid link"
          description="This registration link is missing its invitation token."
          action={
            <Button asChild className="cursor-pointer">
              <Link href="/">Go home</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  if (validating) {
    return (
      <Shell>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  if (invalid || !invitation) {
    return (
      <Shell>
        <StatusCard
          icon={XCircle}
          title="Invitation not valid"
          description="This invitation has expired, been revoked, or already been accepted."
          action={
            <Button asChild className="cursor-pointer">
              <Link href="/">Go home</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        token,
        name: form.name.trim(),
        password: form.password,
      }).unwrap();

      toast.success('Welcome! You have joined the team.');
      router.push('/dashboard');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create account';
      toast.error(message);
    }
  };

  return (
    <Shell>
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
          <div className="space-y-5 sm:space-y-6">
            {/* HEADER */}
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;ve been invited to join a team on Nuruvent.
              </p>
            </div>

            {/* INVITATION SUMMARY */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/40 p-4">
              <Row label="Email">
                <span className="truncate text-sm font-medium">
                  {invitation.email}
                </span>
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

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jane Nyambura"
                    className="h-11 rounded-xl pl-9"
                    autoFocus
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl pl-9 pr-10"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters. Use a mix of letters, numbers, and
                  symbols.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full cursor-pointer gap-2 rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create account &amp; join team
                  </>
                )}
              </Button>
            </form>

            {/* FOOTER */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={`/signin?next=${encodeURIComponent(
                  `/invitations/accept?token=${token}`,
                )}`}
                className="font-medium text-primary hover:underline"
              >
                Sign in to accept
                <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ============================================================
// HELPERS
// ============================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:py-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/registration-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />

      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <svg
          className="absolute left-8 top-8 h-64 w-64 opacity-30 lg:h-80 lg:w-80"
          viewBox="0 0 200 200"
          fill="none"
        >
          <pattern
            id="register-dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="2" fill="#1A73E8" opacity="0.3" />
          </pattern>
          <rect
            x="0"
            y="0"
            width="200"
            height="200"
            fill="url(#register-dots)"
          />
        </svg>
      </div>

      <div className="relative z-10 flex w-full justify-center">{children}</div>
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
}: {
  icon: typeof AlertCircle;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl sm:p-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}