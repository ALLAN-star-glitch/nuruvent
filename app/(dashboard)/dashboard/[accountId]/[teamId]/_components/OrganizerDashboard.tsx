/* eslint-disable react-hooks/purity */
// app/(dashboard)/dashboard/[accountId]/[teamId]/_components/OrganizerDashboard.tsx

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Lightbulb,
  MessageSquare,
  PieChart as PieChartIcon,
  Plug,
  PlusCircle,
  Settings,
  Share2,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';
import {
  setActiveAccount,
  setActiveTeam,
} from '@/lib/store/slices/workspaceSlice';
import {
  useCreateEventMutation,
  useGetEventTypesQuery,
  useGetTicketTypesQuery,
  useListMyEventsQuery,
} from '@/lib/store/api/eventsApi';
import { useGetPaymentStatsQuery, useListPaymentsQuery } from '@/lib/store/api/paymentsApi';
import { useGetAttendeesQuery } from '@/lib/store/api/attendanceApi';
import { useListAllRegistrationsQuery } from '@/lib/store/api/registrationsApi';
import type {
  Event,
  GeneratedEventDraft,
  VideoPlatform,
} from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventStatusName,
  isEventPublished,
} from '@/lib/utils/eventDisplay';

import { GenerateWithAIModal } from '@/components/events/ai/GenerateWithAIModal';
import { draftToPublishPayload } from '@/components/events/ai/draftToPublishPayload';
import {
  PlatformPickerModal,
  PLATFORMS,
  type PlatformMeta,
} from '@/components/events/video/PlatformPickerModal';
import { useVideoConnection } from '@/components/events/video/useVideoConnection';

import { TeamOnboardingBanner } from '@/components/team/TeamOnboardingBanner';

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  secondary: '#FBBC04',
  tertiary: '#34A853',
  error: '#EA4335',
  neutral: '#5F6368',
  neutralLight: '#F8F9FA',
  neutralDark: '#202124',
  neutralBorder: '#E8EAED',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.tertiary,
  COLORS.error,
  COLORS.neutral,
];

const AI_DRAFT_STORAGE_KEY = 'nuruvent_ai_draft';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'text-muted-foreground bg-muted',
  Published: 'text-primary bg-primary/10',
  Completed: 'text-primary bg-primary/10',
  Cancelled: 'text-destructive bg-destructive/10',
};

type RangeDays = 7 | 30;

// ============================================================
// CHART TOOLTIPS
// ============================================================

interface TooltipPayloadEntry {
  name: string;
  value: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border border-border">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((p, index) => {
        const value = p.value ?? 0;
        const displayValue =
          p.name === 'Revenue' ? formatPrice(Number(value)) : value;
        return (
          <p key={index} className="text-sm text-muted-foreground">
            {p.name}: {displayValue}
          </p>
        );
      })}
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border border-border">
      <p className="text-sm font-medium text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">{data.value} events</p>
    </div>
  );
}

// ============================================================
// LAYOUT PRIMITIVES
// ============================================================

interface PanelProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <Card
      className={cn(
        'flex flex-col rounded-xl border-border/70 shadow-sm',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-4 pb-3 pt-4 sm:px-5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
            <span className="truncate">{title}</span>
          </CardTitle>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn('flex-1 px-4 pb-4 sm:px-5', bodyClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

function ViewAll({ href, label = 'View all' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-1 rounded-sm text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      <ArrowUpRight className="h-3 w-3" />
    </Link>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function RangeToggle({
  value,
  onChange,
}: {
  value: RangeDays;
  onChange: (v: RangeDays) => void;
}) {
  const options: RangeDays[] = [7, 30];
  return (
    <div
      role="group"
      aria-label="Date range"
      className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {options.map((d) => (
        <button
          key={d}
          type="button"
          aria-pressed={value === d}
          onClick={() => onChange(d)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === d
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {d} days
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TYPES
// ============================================================

interface OrganizerDashboardProps {
  accountId: string;
  teamId: string;
  isAdmin: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function OrganizerDashboard({
  accountId,
  teamId,
  isAdmin,
}: OrganizerDashboardProps) {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPlatformPickerOpen, setIsPlatformPickerOpen] = useState(false);
  const [pickedPlatform, setPickedPlatform] = useState<VideoPlatform | null>(
    null,
  );
  const [range, setRange] = useState<RangeDays>(30);


  // Revenue source for the Ticket Sales chart. Admin-only — trainers get
// a 403 on /payments, so skip the request entirely for them (same
// pattern as the stats query above).
const { data: paymentsResponse, isLoading: paymentsListLoading } =
  useListPaymentsQuery(
    {
      page: 1,
      page_size: 200, // enough to cover a 6-month window for typical teams
      team_id: teamId,
      scope: 'team',
      status: 'success',
      sort_by: 'created_at',
      sort_order: 'desc',
    },
    {
      skip: !isAuthenticated || !teamId || !isAdmin,
      refetchOnMountOrArgChange: true,
    },
  );

const payments = paymentsResponse?.data?.payments ?? [];

  useEffect(() => {
    if (accountId) dispatch(setActiveAccount(accountId));
    if (teamId) dispatch(setActiveTeam(teamId));
  }, [accountId, teamId, dispatch]);

  const video = useVideoConnection();

  const { data: listResponse, isLoading: eventsLoading } = useListMyEventsQuery(
    {
      limit: 50,
      offset: 0,
      include_creator: false,
      scope: 'team',
      team_id: teamId,
    },
    { skip: !isAuthenticated || !teamId, refetchOnMountOrArgChange: true },
  );

  const { data: eventTypesResponse } = useGetEventTypesQuery();
  const { data: ticketTypesResponse } = useGetTicketTypesQuery();
  const eventTypes = eventTypesResponse?.data ?? [];
  const ticketTypes = ticketTypesResponse?.data ?? [];

  // Admin-only: skip entirely for trainers. The policy denies trainers
  // on /payments/stats, so this query would 403 anyway — skipping
  // avoids the failed request in the network tab.
  const { data: paymentStatsResponse, isLoading: paymentsLoading } =
    useGetPaymentStatsQuery(
      { team_id: teamId, scope: 'team' },
      {
        skip: !isAuthenticated || !teamId || !isAdmin,
        refetchOnMountOrArgChange: true,
      },
    );

  const { data: attendeesResponse, isLoading: attendeesLoading } =
    useGetAttendeesQuery(
      {
        page: 1,
        page_size: 1,
        team_id: teamId,
        scope: 'team',
      },
      { skip: !isAuthenticated || !teamId, refetchOnMountOrArgChange: true },
    );

  // Latest registrations for the team (newest first). Feeds the
  // registrations chart, the recent list, and the stat card.
  const { data: registrationsResponse, isLoading: registrationsLoading } =
    useListAllRegistrationsQuery(
      {
        page: 1,
        page_size: 100,
        team_id: teamId,
        scope: 'team',
        sort_by: 'created_at',
        sort_order: 'desc',
      },
      { skip: !isAuthenticated || !teamId, refetchOnMountOrArgChange: true },
    );

  const [createEvent] = useCreateEventMutation();

  const events: Event[] = listResponse?.data?.data ?? [];
  const paymentStats = paymentStatsResponse?.data;
  const totalAttendees = attendeesResponse?.data?.total ?? 0;
  const registrations = registrationsResponse?.data?.registrations ?? [];
  const totalRegistrations = registrationsResponse?.data?.total ?? 0;

  const zoomConnection = video.getConnection('zoom');
  const googleMeetConnection = video.getConnection('google_meet');
  const hasAnyConnection = !!zoomConnection || !!googleMeetConnection;
  const connectedCount =
    (zoomConnection ? 1 : 0) + (googleMeetConnection ? 1 : 0);

  const openPickerFromList = () => {
    setPickedPlatform(null);
    setIsPlatformPickerOpen(true);
  };

  const openPlatformDetail = (platform: VideoPlatform) => {
    setPickedPlatform(platform);
    setIsPlatformPickerOpen(true);
  };

  const handleEditAIDraft = useCallback(
    (draft: GeneratedEventDraft, eventTypeId: string) => {
      try {
        sessionStorage.setItem(AI_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error('Failed to stash AI draft for handoff:', err);
        toast.error(
          'Could not prepare the draft for editing. Please try again.',
        );
        return;
      }

      router.push(
        `/dashboard/${accountId}/${teamId}/events/new?from=ai&event_type_id=${encodeURIComponent(eventTypeId)}`,
      );
    },
    [router, accountId, teamId],
  );

  const handlePublishAIDraft = useCallback(
    async (draft: GeneratedEventDraft, eventTypeId: string) => {
      try {
        const payload = draftToPublishPayload(draft, eventTypeId);
        const response = await createEvent({
          teamId,
          data: payload,
        }).unwrap();
        toast.success('Event published successfully!');
        router.push(
          `/dashboard/${accountId}/${teamId}/events/${response.data.id}`,
        );
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'data' in err
            ? (err as { data?: { message?: string } }).data?.message
            : 'Failed to publish event';
        toast.error(message || 'Failed to publish event');
      }
    },
    [createEvent, router, accountId, teamId],
  );

  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const liveEvents = events.filter(isEventPublished).length;
    const draftEvents = events.filter(
      (e) => getEventStatusName(e) === 'Draft',
    ).length;
    const completedEvents = events.filter(
      (e) => getEventStatusName(e) === 'Completed',
    ).length;
    const cancelledEvents = events.filter(
      (e) => getEventStatusName(e) === 'Cancelled',
    ).length;

    const totalCpdHours = events.reduce((s, e) => {
      if (!e.certificate_enabled) return s;
      const minutes = parseDuration(getEventDuration(e));
      return s + Math.round(minutes / 60);
    }, 0);

    const grossRevenueMajor = (paymentStats?.total_revenue ?? 0) / 100;
    const netRevenueMajor = (paymentStats?.total_net ?? 0) / 100;

    return {
      totalEvents,
      liveEvents,
      draftEvents,
      completedEvents,
      cancelledEvents,
      totalCpdHours,
      totalAttendees,
      grossRevenue: grossRevenueMajor,
      netRevenue: netRevenueMajor,
      transactionCount: paymentStats?.transaction_count ?? 0,
    };
  }, [events, paymentStats, totalAttendees]);

  const confirmedRegistrations = useMemo(
    () => registrations.filter((r) => isConfirmedStatus(r.status)).length,
    [registrations],
  );

  // Daily registrations for the selected range (cancelled excluded from
  // "Registrations"; "Confirmed" counts confirmed ones only).
  const registrationsSeries = useMemo(() => {
    const days = buildDaySeries(range);
    const map = new Map(
      days.map((d) => [
        d.key,
        { label: d.label, registrations: 0, confirmed: 0 },
      ]),
    );
    registrations.forEach((r) => {
      const created = new Date(r.created_at);
      if (isNaN(created.getTime())) return;
      const row = map.get(dayKey(created));
      if (!row) return;
      if (!isCancelledStatus(r.status)) row.registrations += 1;
      if (isConfirmedStatus(r.status)) row.confirmed += 1;
    });
    return Array.from(map.values());
  }, [registrations, range]);

  const hasRegistrationActivity = registrationsSeries.some(
    (d) => d.registrations > 0 || d.confirmed > 0,
  );

  const monthlyData = useMemo(() => {
  const buckets: Record<
    string,
    { month: string; events: number; revenue: number; attendees: number }
  > = {};

  const ensure = (key: string, monthName: string) => {
    if (!buckets[key]) {
      buckets[key] = { month: monthName, events: 0, revenue: 0, attendees: 0 };
    }
    return buckets[key];
  };

  // Events → events + attendees
  events.forEach((event) => {
    const startDate = event.start_date ?? event.schedules?.[0]?.start_date;
    if (!startDate) return;

    const d = new Date(startDate);
    if (isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });

    const bucket = ensure(key, monthName);
    bucket.events += 1;
    bucket.attendees += event.current_attendees ?? 0;
  });

  // Payments → revenue (stored in cents on the backend)
  payments.forEach((p) => {
    const created = new Date(p.created_at);
    if (isNaN(created.getTime())) return;

    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
    const monthName = created.toLocaleDateString('en-US', { month: 'short' });

    const bucket = ensure(key, monthName);
    // Adjust `amount` if your Payment type uses a different field
    // (e.g. `total`, `amount_major`, `gross_amount`). Value is in cents.
    bucket.revenue += (p.amount ?? 0) / 100;
  });

    const isLoading =
    eventsLoading ||
    paymentsLoading ||
    paymentsListLoading ||
    attendeesLoading ||
    registrationsLoading;

  // Chronological, last 6 months
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}, [events, payments]);

  const statusDistribution = [
    { name: 'Published', value: metrics.liveEvents, color: COLORS.tertiary },
    { name: 'Draft', value: metrics.draftEvents, color: COLORS.secondary },
    {
      name: 'Completed',
      value: metrics.completedEvents,
      color: COLORS.primary,
    },
    { name: 'Cancelled', value: metrics.cancelledEvents, color: COLORS.error },
  ].filter((s) => s.value > 0);
  const statusTotal = statusDistribution.reduce((s, d) => s + d.value, 0);

  const typeDistribution = useMemo(() => {
    const types: Record<string, { name: string; value: number }> = {};

    events.forEach((event) => {
      const typeName =
        event.event_type?.display_name ||
        event.event_type?.name ||
        'Uncategorized';
      if (!types[typeName]) {
        types[typeName] = { name: typeName, value: 0 };
      }
      types[typeName].value += 1;
    });

    return Object.values(types).sort((a, b) => b.value - a.value);
  }, [events]);

  const recentEvents = useMemo(
    () =>
      events.slice(0, 5).map((event) => {
        const statusName = getEventStatusName(event);
        const startDate = event.start_date ?? event.schedules?.[0]?.start_date;

        const capacity = event.capacity ?? 0;
        const attendees = event.current_attendees ?? 0;
        const progress =
          capacity > 0 ? Math.round((attendees / capacity) * 100) : 0;

        return {
          id: event.id,
          title: event.display_name || event.name || 'Untitled Event',
          date: startDate
            ? new Date(startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'TBD',
          attendees,
          status: statusName,
          statusColor:
            STATUS_COLORS[statusName] ?? 'text-muted-foreground bg-muted',
          progress,
          isFeatured: event.is_featured,
          isPrivate: event.visibility === 'private',
        };
      }),
    [events],
  );

  // The event the schedule card and summary strip focus on: the next
  // upcoming published event, otherwise the most recent one.
  const featured = useMemo(() => {
    const dated = events
      .map((e) => ({
        event: e,
        t: Date.parse(e.start_date ?? e.schedules?.[0]?.start_date ?? ''),
      }))
      .filter((x) => !isNaN(x.t));

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const upcoming = dated
      .filter((x) => x.t >= cutoff && isEventPublished(x.event))
      .sort((a, b) => a.t - b.t);
    if (upcoming[0]) return { event: upcoming[0].event, isUpcoming: true };

    const latest = [...dated].sort((a, b) => b.t - a.t);
    if (latest[0]) return { event: latest[0].event, isUpcoming: false };

    return { event: events[0] ?? null, isUpcoming: false };
  }, [events]);

  const sortedFeaturedSessions = useMemo(
    () =>
      [...(featured.event?.schedules ?? [])].sort((a, b) =>
        `${a.start_date}T${a.start_time}`.localeCompare(
          `${b.start_date}T${b.start_time}`,
        ),
      ),
    [featured],
  );

   const scheduleRows = useMemo(() => {
    // 1. Flatten all schedules from all events
    const allSessions = events.flatMap((e) =>
      (e.schedules ?? []).map((s) => ({
        id: s.id,
        eventId: e.id, // <--- Make sure this is here
        eventName: e.display_name || e.name,
        title: s.session_name || `Session ${s.session_number ?? 1}`,
        date: s.start_date,
        start: s.start_time,
        end: s.end_time,
        location: s.is_virtual ? 'Virtual' : s.location || 'Location TBD',
        isVirtual: s.is_virtual,
        isDraft: getEventStatusName(e) === 'Draft',
      }))
    );

    // 2. Filter out past sessions
    const now = new Date().getTime();
    const upcoming = allSessions.filter((s) => {
      if (!s.date) return false;
      const sessionDate = new Date(`${s.date}T${s.start}`).getTime();
      return sessionDate >= now - 24 * 60 * 60 * 1000;
    });

    // 3. Sort by date and time ascending
    const sorted = upcoming.sort((a, b) =>
      `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`)
    );

    // 4. Fallback to all recent
    const toDisplay = sorted.length > 0 ? sorted : allSessions.sort((a, b) => 
      `${b.date}T${b.start}`.localeCompare(`${a.date}T${a.start}`)
    );

    // 5. Format for the UI (INCLUDING eventId)
    return toDisplay.slice(0, 5).map((s) => ({
      id: s.id,
      eventId: s.eventId, // <--- ADD THIS
      title: s.title,
      date: formatShortDate(s.date),
      start: formatTime(s.start),
      end: formatTime(s.end),
      location: `${s.eventName} · ${s.location}`,
      isVirtual: s.isVirtual,
    }));
  }, [events]);

  // ------------------------------------------------------------
  // Stat cards — Revenue appears only for admins.
  // ------------------------------------------------------------
  const compactStats = useMemo(() => {
    const base = [
      {
        label: 'Total Events',
        value: metrics.totalEvents.toString(),
        icon: Calendar,
        detail: `${metrics.liveEvents} live, ${metrics.draftEvents} draft`,
      },
      {
        label: 'Registrations',
        value: totalRegistrations.toLocaleString(),
        icon: ClipboardList,
        detail:
          registrations.length > 0 && registrations.length >= totalRegistrations
            ? `${confirmedRegistrations} confirmed`
            : 'All time',
      },
      {
        label: 'Attendees',
        value: metrics.totalAttendees.toLocaleString(),
        icon: Users,
        detail:
          metrics.transactionCount > 0
            ? `${metrics.transactionCount} paid`
            : 'All-time attendees',
      },
    ];

    if (isAdmin) {
      base.push({
        label: 'Revenue',
        value: formatPrice(metrics.grossRevenue),
        icon: CreditCard,
        detail:
          metrics.netRevenue > 0
            ? `${formatPrice(metrics.netRevenue)} net`
            : 'No payments yet',
      });
    }

    base.push({
      label: 'CPD Hours',
      value: metrics.totalCpdHours.toString(),
      icon: Award,
      detail: `${metrics.completedEvents} completed`,
    });

    return base;
  }, [
    metrics,
    isAdmin,
    totalRegistrations,
    registrations.length,
    confirmedRegistrations,
  ]);

  // ------------------------------------------------------------
  // Quick actions — Payments only for admins.
  // ------------------------------------------------------------
  const quickActions = useMemo(() => {
    const base: Array<{
      icon: typeof PlusCircle;
      label: string;
      href: string;
      color: string;
      bg: string;
      onClick?: () => void;
    }> = [
      {
        icon: PlusCircle,
        label: 'Create Event',
        href: `/dashboard/${accountId}/${teamId}/events/new`,
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: Users,
        label: 'Attendees',
        href: `/dashboard/${accountId}/${teamId}/attendees`,
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: Award,
        label: 'Certificates',
        href: `/dashboard/${accountId}/${teamId}/certificates`,
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
    ];

    if (isAdmin) {
      base.push({
        icon: CreditCard,
        label: 'Payments',
        href: `/dashboard/${accountId}/${teamId}/payments`,
        color: 'text-primary',
        bg: 'bg-primary/10',
      });
    }

    if (isAuthenticated && !video.isLoading) {
      base.push({
        icon: Plug,
        label: hasAnyConnection ? 'Manage platforms' : 'Connect platform',
        href: '#',
        color: 'text-primary',
        bg: 'bg-primary/10',
        onClick: openPickerFromList,
      });
    }

    return base;
  }, [
    video.isLoading,
    isAuthenticated,
    hasAnyConnection,
    accountId,
    teamId,
    isAdmin,
  ]);

  const isLoading =
    eventsLoading || paymentsLoading || attendeesLoading || registrationsLoading;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-sm text-muted-foreground">
              Please log in to view your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  // ------------------------------------------------------------
  // Summary strip values
  // ------------------------------------------------------------
  const fe = featured.event;
  const feFirst = sortedFeaturedSessions[0];
  const feStatus = fe ? getEventStatusName(fe) : '';
  const feInPerson = fe?.venue?.name || fe?.in_person_location;
  const feVenue = !fe
    ? ''
    : fe.is_hybrid
      ? `Hybrid${feInPerson ? ` · ${feInPerson}` : ''}`
      : fe.is_virtual
        ? 'Virtual'
        : feInPerson || 'Location TBD';
  const feStart = formatTime(feFirst?.start_time ?? fe?.time);
  const feEnd = formatTime(feFirst?.end_time);
  const feTime = feStart ? (feEnd ? `${feStart} – ${feEnd}` : feStart) : 'TBD';
  const feDate = fe ? formatDateRange(fe.start_date ?? fe.date, fe.end_date) : '';

  const summaryItems = fe
    ? [
        { icon: Calendar, label: 'Event', value: fe.display_name || fe.name },
        { icon: Calendar, label: 'Date', value: feDate },
        { icon: Video, label: 'Venue', value: feVenue },
        { icon: Activity, label: 'Time', value: feTime },
      ]
    : [];

  const recentRegistrations = registrations.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
      <TeamOnboardingBanner accountId={accountId} teamId={teamId} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name || 'User'}! Here&apos;s what&apos;s
            happening with your events.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsAIModalOpen(true)}
            size="lg"
            className={cn(
              'relative group overflow-hidden cursor-pointer',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'font-semibold shadow-sm hover:shadow',
              'transition-colors duration-200',
              'h-11 px-5 text-sm sm:text-base',
            )}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
            <span className="tracking-wide truncate">Create with AI</span>
          </Button>

          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 py-1.5 px-2.5"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary py-1.5 px-2.5"
          >
            <Activity className="h-3 w-3 mr-1" />
            Live: {metrics.liveEvents}
          </Badge>
        </div>
      </div>

      {/* Platform connection banner — same as before */}
      {!video.isLoading && (
        <div
          className={cn(
            'rounded-xl border p-4 flex items-start gap-3 relative overflow-hidden',
            hasAnyConnection
              ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10'
              : 'border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5',
          )}
        >
          <div
            className={cn(
              'p-2 rounded-lg shrink-0',
              'bg-primary text-primary-foreground',
            )}
          >
            {hasAnyConnection ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">
                {hasAnyConnection
                  ? `${connectedCount} platform${connectedCount > 1 ? 's' : ''} connected`
                  : 'Connect a video platform'}
              </p>
              {!hasAnyConnection && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-primary/30 text-primary bg-primary/5"
                >
                  Recommended
                </Badge>
              )}
              {hasAnyConnection && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-primary/30 text-primary bg-primary/5"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {hasAnyConnection ? (
                <>
                  Connected accounts:{' '}
                  <span className="font-medium text-foreground">
                    {[
                      zoomConnection ? 'Zoom' : null,
                      googleMeetConnection ? 'Google Meet' : null,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  . Meeting links are created automatically for your virtual
                  sessions.
                </>
              ) : (
                <>
                  We&apos;ll create meeting links for each virtual session and
                  track attendance automatically. Takes 30 seconds.
                </>
              )}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Button
                size="default"
                onClick={openPickerFromList}
                className={cn(
                  'cursor-pointer',
                  'bg-primary hover:bg-primary/90 text-primary-foreground',
                  'font-semibold shadow-sm',
                  'h-10 px-4',
                )}
              >
                <Plug className="h-4 w-4 mr-2" />
                {hasAnyConnection ? 'Manage platforms' : 'Connect platform'}
              </Button>

              <div className="flex items-center gap-1.5 ml-1">
                {PLATFORMS.map((meta: PlatformMeta) => {
                  const isConnected = !!video.getConnection(meta.platform);
                  return (
                    <button
                      key={meta.platform}
                      type="button"
                      disabled={!meta.available}
                      onClick={() =>
                        meta.available && openPlatformDetail(meta.platform)
                      }
                      title={
                        meta.available
                          ? `${isConnected ? 'Manage' : 'Connect'} ${meta.label}`
                          : `${meta.label} — coming soon`
                      }
                      aria-label={`${isConnected ? 'Manage' : 'Connect'} ${meta.label}`}
                      className={cn(
                        'relative h-10 w-10 rounded-lg transition-all',
                        'flex items-center justify-center',
                        'bg-background border border-border p-1.5',
                        meta.available
                          ? 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-95'
                          : 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <Image
                        src={meta.logo}
                        alt={`${meta.label} logo`}
                        width={28}
                        height={28}
                        className="h-full w-full object-contain"
                      />
                      {isConnected && (
                        <span
                          className={cn(
                            'absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full',
                            'bg-primary border-2 border-background',
                            'flex items-center justify-center',
                          )}
                          aria-hidden="true"
                        >
                          <CheckCircle2 className="h-2 w-2 text-primary-foreground" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="cursor-pointer text-xs text-muted-foreground"
                asChild
              >
               <Link href={`/dashboard/${accountId}/settings?tab=video-platforms`}>
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        className={cn(
          'grid grid-cols-2 gap-3 sm:gap-4',
          isAdmin
            ? 'sm:grid-cols-3 xl:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1'
            : 'sm:grid-cols-4',
        )}
      >
        {compactStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="rounded-xl border-border/70 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="truncate text-xl font-bold tabular-nums tracking-tight text-foreground sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {stat.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Registrations overview + schedule */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Panel
          title="Registrations Overview"
          subtitle="New registrations per day, cancelled excluded"
          action={<RangeToggle value={range} onChange={setRange} />}
          className="xl:col-span-2"
        >
          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-primary" />
              Registrations
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-5 rounded-full"
                style={{ backgroundColor: COLORS.tertiary }}
              />
              Confirmed
            </span>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            {!hasRegistrationActivity ? (
              <EmptyNote>No registrations in the last {range} days.</EmptyNote>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={registrationsSeries}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.tertiary}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.tertiary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="Registrations"
                    stroke={COLORS.primary}
                    fill="url(#regGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    name="Confirmed"
                    stroke={COLORS.tertiary}
                    fill="url(#confGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel
          title="Upcoming Schedule"
          action={
            <Link
              href={`/dashboard/${accountId}/${teamId}/events`}
              className="flex shrink-0 items-center gap-1 rounded-sm text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
         {scheduleRows.length === 0 ? (
            <EmptyNote>Create an event to see its sessions here.</EmptyNote>
          ) : (
            <ul className="divide-y divide-border -mx-2">
              {scheduleRows.map((row) => {
                const Icon = row.isVirtual ? Video : Calendar;
                return (
                  <li key={row.id}>
                    <Link
                      href={`/dashboard/${accountId}/${teamId}/events/${row.eventId}`}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-accent/60 transition-colors group border border-transparent hover:border-border"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <div className="w-[72px] shrink-0 sm:w-20">
                        <p className="text-xs font-semibold tabular-nums text-foreground">
                          {row.start || 'TBD'}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {row.end || row.date}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1 border-l border-border pl-3">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {row.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.location}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {scheduleRows.length > 5 && (
            <p className="mt-3 text-xs text-muted-foreground">
              +{scheduleRows.length - 5} more sessions
            </p>
          )}
        </Panel>
      </div>

      {/* Status / types / recent registrations */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Event Status" subtitle="All events on this team">
          {statusTotal === 0 ? (
            <EmptyNote>No events yet.</EmptyNote>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={66}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {statusTotal}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2">
                {statusDistribution.map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {s.name}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {s.value}
                    </span>
                    <span className="w-9 text-right tabular-nums text-muted-foreground">
                      {Math.round((s.value / statusTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title="Event Types" icon={PieChartIcon} subtitle="Share of your events">
          {typeDistribution.length === 0 ? (
            <EmptyNote>No types yet</EmptyNote>
          ) : (
            <ul className="space-y-3.5">
              {typeDistribution.slice(0, 5).map((type, index) => (
                <li key={type.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-muted-foreground">
                        {type.name}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums text-foreground">
                      {type.value}
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (type.value / Math.max(metrics.totalEvents, 1)) * 100,
                    )}
                    className="h-1.5"
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent Registrations"
          subtitle="Latest sign-ups"
          action={
            <ViewAll href={`/dashboard/${accountId}/${teamId}/registrations`} />
          }
          className="md:col-span-2 xl:col-span-1"
        >
          {recentRegistrations.length === 0 ? (
            <EmptyNote>
              Registrations will show up here as people sign up.
            </EmptyNote>
          ) : (
            <ul className="space-y-3">
              {recentRegistrations.map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(r.attendee_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.attendee_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.email || r.event_name}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                      registrationPill(r.status),
                    )}
                  >
                    {r.status_label || r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

            {/* Ticket Sales (Payments) + Event Types / Activity */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        {/* Ticket Sales Chart */}
        <Panel
      title="Ticket Sales"
      subtitle="Monthly revenue from successful payments"
      className="xl:col-span-2"
    >
    <div className="h-[220px] sm:h-[260px]">
      {monthlyData.length === 0 ? (
        <EmptyNote>
          {isAdmin
          ? 'No sales data available yet.'
          : 'Revenue data is only available to team admins.'}
      </EmptyNote>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyData}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          barSize={32}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `KSh ${val / 1000}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill={COLORS.primary}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
        </Panel>

        {/* Event Types (moved from earlier to balance the row) */}
        <Panel
          title="Event Types"
          icon={PieChartIcon}
          subtitle="Share of your events"
        >
          {typeDistribution.length === 0 ? (
            <EmptyNote>No types yet</EmptyNote>
          ) : (
            <ul className="space-y-3.5">
              {typeDistribution.slice(0, 5).map((type, index) => (
                <li key={type.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-muted-foreground">
                        {type.name}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums text-foreground">
                      {type.value}
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (type.value / Math.max(metrics.totalEvents, 1)) * 100,
                    )}
                    className="h-1.5"
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Recent events + quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Panel
          title="Recent Events"
          action={<ViewAll href={`/dashboard/${accountId}/${teamId}/events`} />}
          className="xl:col-span-2"
          bodyClassName="px-2 sm:px-3"
        >
          {recentEvents.length > 0 ? (
            <div className="space-y-1.5">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/${accountId}/${teamId}/events/${event.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-accent/60 transition-all border border-transparent hover:border-border group"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {event.title}
                        </p>
                        {event.isFeatured && (
                          <Badge className="bg-secondary text-secondary-foreground text-[10px] px-1.5">
                            <Star className="h-2 w-2 mr-0.5" />
                            Featured
                          </Badge>
                        )}
                        {event.isPrivate && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground border-border bg-muted text-[10px] px-1.5"
                          >
                            Private
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] border-0 px-1.5 py-0',
                            event.statusColor,
                          )}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <span>{event.date}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {event.attendees} attendees
                        </span>
                        {event.progress > 0 && event.progress < 100 && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-muted-foreground hidden sm:inline">
                              {event.progress}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                    {event.progress > 0 && event.progress < 100 && (
                      <div className="flex-1 sm:w-20">
                        <Progress value={event.progress} className="h-1" />
                      </div>
                    )}
                    {event.progress === 100 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyNote>
              No events found. Create your first event to get started.
            </EmptyNote>
          )}
        </Panel>

        <Panel title="Quick Actions" icon={Zap} bodyClassName="space-y-0.5 px-3 sm:px-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <div
                  className={cn(
                    'p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200',
                    action.bg,
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', action.color)} />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                  {action.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </>
            );

            return action.onClick ? (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border cursor-pointer text-left"
              >
                {content}
              </button>
            ) : (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border"
              >
                {content}
              </Link>
            );
          })}
        </Panel>
      </div>

      {/* Activity trend + tips */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Panel
          title="Activity Trend"
          subtitle="Events and attendees by month"
          action={
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Events
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/50" />
                Attendees
              </span>
            </div>
          }
          className="xl:col-span-2"
        >
          <div className="h-[200px] sm:h-[220px]">
            {monthlyData.length === 0 ? (
              <EmptyNote>
                Activity will appear here once you have scheduled events.
              </EmptyNote>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="eventsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="attendeesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="events"
                    name="Events"
                    stroke={COLORS.primary}
                    fill="url(#eventsGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendees"
                    name="Attendees"
                    stroke={COLORS.primary}
                    fill="url(#attendeesGradient)"
                    strokeWidth={2}
                    strokeOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title="Tips" icon={Lightbulb} bodyClassName="space-y-2">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-primary/5 p-2.5">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Send reminders to boost attendance
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-primary/5 p-2.5">
            <Award className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Issue certificates within 48 hours
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-primary/5 p-2.5">
            <Share2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Share replays for 45% more engagement
            </p>
          </div>
        </Panel>
      </div>

      {/* Event summary strip */}
      {fe && (
        <Card className="rounded-xl border-border/70 shadow-sm">
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p
                      className="truncate text-sm font-medium text-foreground"
                      title={item.value}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-0 font-medium',
                    STATUS_COLORS[feStatus] ?? 'text-muted-foreground bg-muted',
                  )}
                >
                  {feStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Event Generator Modal */}
      <GenerateWithAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        eventTypes={eventTypes}
        ticketTypes={ticketTypes}
        onEditDraft={handleEditAIDraft}
        onPublishDraft={handlePublishAIDraft}
      />

      {/* Platform Picker Modal */}
      <PlatformPickerModal
        open={isPlatformPickerOpen}
        onOpenChange={setIsPlatformPickerOpen}
        returnUrl={`/dashboard/${accountId}/${teamId}`}
        initialPlatform={pickedPlatform}
      />
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
}

/** Local-time YYYY-MM-DD key so daily buckets match what the user sees. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** The last `days` days (oldest first), ending today. */
function buildDaySeries(days: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({
      key: dayKey(d),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return out;
}

function isCancelledStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes('cancel') || s.includes('expired') || s.includes('failed');
}

function isConfirmedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes('confirm') || s.includes('paid') || s.includes('checked');
}

function registrationPill(status: string): string {
  if (isConfirmedStatus(status))
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  if (isCancelledStatus(status)) return 'bg-destructive/10 text-destructive';
  if (status.toLowerCase().includes('pend'))
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-muted text-muted-foreground';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** "09:00:00" -> "9:00 AM"; empty string when missing. */
function formatTime(t?: string): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${(m ?? '00').padStart(2, '0')} ${suffix}`;
}

/** Accepts "YYYY-MM-DD" or a full ISO timestamp. */
function parseAnyDate(value?: string): Date | null {
  if (!value) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatShortDate(value?: string): string {
  const d = parseAnyDate(value);
  return d
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';
}

function formatDateRange(start?: string, end?: string): string {
  const s = parseAnyDate(start);
  if (!s) return 'TBD';
  const e = parseAnyDate(end);
  const full: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  if (!e || e.toDateString() === s.toDateString()) {
    return s.toLocaleDateString('en-US', full);
  }
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', full)}`;
}