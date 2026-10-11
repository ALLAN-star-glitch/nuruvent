// app/(dashboard)/dashboard/[accountId]/[teamId]/_components/LearnerDashboard.tsx

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  User as UserIcon,
  Video,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';
import { useListMyRegistrationsQuery } from '@/lib/store/api/registrationsApi';
import type { CrossEventRegistration } from '@/lib/types/registration';
import { TeamOnboardingBanner } from '@/components/team/TeamOnboardingBanner';

// ============================================================
// TYPES
// ============================================================

interface LearnerDashboardProps {
  accountId: string;
  teamId: string;
}

interface StatCard {
  label: string;
  value: string;
  detail?: string;
  icon: typeof Calendar;
  accent: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatEventDate(iso?: string): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isUpcoming(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() > Date.now();
}

function isPast(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

function statusBadgeClass(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed')
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
  if (s === 'pending')
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
  if (s === 'cancelled')
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60';
  if (s === 'attended')
    return 'bg-primary/10 text-primary border-primary/20';
  return 'bg-muted text-muted-foreground border-border';
}

// ============================================================
// COMPONENT
// ============================================================

export function LearnerDashboard({
  accountId,
  teamId,
}: LearnerDashboardProps) {
  const router = useRouter();
  const user = useAppSelector(selectUser);

  const { data, isLoading } = useListMyRegistrationsQuery({
    page: 1,
    page_size: 50,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const registrations: CrossEventRegistration[] =
    data?.data?.registrations ?? [];

  const upcoming = useMemo(
    () =>
      registrations
        .filter((r) => isUpcoming(r.event_start_date))
        .sort((a, b) => {
          const da = a.event_start_date ?? '';
          const db = b.event_start_date ?? '';
          return da.localeCompare(db);
        }),
    [registrations],
  );

  const past = useMemo(
    () => registrations.filter((r) => isPast(r.event_start_date)),
    [registrations],
  );

  const stats: StatCard[] = [
    {
      label: 'Upcoming',
      value: upcoming.length.toString(),
      detail: 'Events you are registered for',
      icon: Calendar,
      accent: 'from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Attended',
      value: past.length.toString(),
      detail: 'Events that have already run',
      icon: CheckCircle2,
      accent:
        'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Registrations',
      value: registrations.length.toString(),
      detail: 'Across this team',
      icon: ClipboardList,
      accent:
        'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400',
    },
  ];

  const quickActions = [
    {
      icon: Ticket,
      label: 'My Tickets',
      href: `/dashboard/${accountId}/${teamId}/tickets`,
    },
    {
      icon: Calendar,
      label: 'Browse Events',
      href: `/dashboard/${accountId}/${teamId}/events`,
    },
    {
      icon: UserIcon,
      label: 'My Profile',
      href: '/profile',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <TeamOnboardingBanner accountId={accountId} teamId={teamId} />

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.07] via-background to-background p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Learner Dashboard
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
              Here&apos;s a snapshot of your learning journey. Pick up where you
              left off or discover something new.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push(`/dashboard/${accountId}/${teamId}/events`)
            }
            size="lg"
            className={cn(
              'group h-10 w-full shrink-0 cursor-pointer gap-2 rounded-xl px-4 text-sm font-semibold shadow-lg shadow-primary/20 sm:h-11 sm:w-auto sm:px-5',
              'transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5',
            )}
          >
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Browse Events
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      {/* ── Stat Cards (grid on mobile) ─────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={cn(
                'group relative overflow-hidden border-border/60 shadow-sm',
                'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              <CardContent className="relative p-3 sm:p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br sm:h-10 sm:w-10 sm:rounded-xl',
                      stat.accent,
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="mt-2.5 space-y-0.5 sm:mt-4">
                  <p className="text-lg font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-foreground/80 sm:text-sm">
                    {stat.label}
                  </p>
                  {stat.detail && (
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      {stat.detail}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Left / Main column */}
        <div className="space-y-5 sm:space-y-6 lg:col-span-2">
          {/* Upcoming events */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3 sm:px-5 sm:py-3.5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                My Upcoming Events
              </CardTitle>
              {upcoming.length > 0 && (
                <Link
                  href={`/dashboard/${accountId}/${teamId}/tickets`}
                  className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  All tickets
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4">
              {isLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                    >
                      <div className="h-10 w-10 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-3/5 rounded bg-muted" />
                        <div className="h-3 w-2/5 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-10 text-center sm:py-12">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No upcoming events
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                    Browse the team&apos;s events and register for something
                    new.
                  </p>
                  <Button
                    size="sm"
                    className="mt-5 cursor-pointer gap-2 rounded-lg"
                    onClick={() =>
                      router.push(`/dashboard/${accountId}/${teamId}/events`)
                    }
                  >
                    <Calendar className="h-4 w-4" />
                    Browse events
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {upcoming.slice(0, 5).map((reg) => (
                    <Link
                      key={reg.id}
                      href={`/dashboard/${accountId}/${teamId}/events/${reg.event_id}`}
                      className={cn(
                        'group flex items-start gap-3 rounded-xl border border-transparent p-3 sm:gap-3.5 sm:p-3.5',
                        'transition-all duration-200 hover:border-border hover:bg-accent/50',
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15 sm:h-10 sm:w-10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {reg.event_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatEventDate(reg.event_start_date)}
                          </span>
                          {reg.is_virtual ? (
                            <span className="inline-flex items-center gap-1">
                              <Video className="h-3 w-3 shrink-0" />
                              Virtual
                            </span>
                          ) : (
                            reg.venue_city && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {reg.venue_city}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          statusBadgeClass(reg.status),
                        )}
                      >
                        {reg.status_label || reg.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent registrations */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3 sm:px-5 sm:py-3.5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4 text-primary" />
                Recent Registrations
              </CardTitle>
              <Link
                href={`/dashboard/${accountId}/${teamId}/tickets`}
                className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4">
              {registrations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No registrations yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {registrations.slice(0, 5).map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {reg.event_name}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {reg.registration_number}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          statusBadgeClass(reg.status),
                        )}
                      >
                        {reg.status_label || reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right / Sidebar column */}
        <div className="space-y-5 lg:col-span-1">
          {/* Quick Actions */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30 px-4 py-3 sm:px-5 sm:py-3.5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2.5 sm:p-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl border border-transparent p-2.5',
                      'transition-all duration-200 hover:border-border hover:bg-accent/50',
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30 px-4 py-3 sm:px-5 sm:py-3.5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-3 sm:p-4">
              <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Browse the team&apos;s events to find something new.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
                <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your tickets and registration details live under{' '}
                  <Link
                    href={`/dashboard/${accountId}/${teamId}/tickets`}
                    className="font-medium text-primary hover:underline"
                  >
                    My Tickets
                  </Link>
                  .
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Certificates appear here once organizers issue them.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}