// app/(dashboard)/dashboard/page.tsx

'use client';

import { useCallback, useMemo, useState } from 'react';
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
  CreditCard,
  Lightbulb,
  Loader2,
  MessageSquare,
  PieChart as PieChartIcon,
  PlusCircle,
  Share2,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
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

import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';
import {
  useCreateEventMutation,
  useGetEventTypesQuery,
  useGetTicketTypesQuery,
  useListMyEventsQuery,
} from '@/lib/store/api/eventsApi';
import type { Event, GeneratedEventDraft } from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventMinPrice,
  getEventStatusName,
  isEventPublished,
} from '@/lib/utils/eventDisplay';

import { GenerateWithAIModal } from '@/components/events/ai/GenerateWithAIModal';
import { draftToPublishPayload } from '@/components/events/ai/draftToPublishPayload';

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

const QUICK_ACTIONS = [
  { icon: PlusCircle, label: 'Create Event', href: '/dashboard/events/new', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Users, label: 'Attendees', href: '/dashboard/attendees', color: 'text-tertiary', bg: 'bg-tertiary/10' },
  { icon: Award, label: 'Certificates', href: '/dashboard/certificates', color: 'text-secondary', bg: 'bg-secondary/10' },
  { icon: Video, label: 'Replays', href: '/dashboard/replays', color: 'text-purple-600', bg: 'bg-purple-50' },
];

/**
 * Must match the key the CreateEventWizard reads from sessionStorage
 * when it loads the handoff draft.
 */
const AI_DRAFT_STORAGE_KEY = 'nuruvent_ai_draft';

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
    <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-light">
      <p className="text-sm font-medium text-neutral-dark">{label}</p>
      {payload.map((p, index) => {
        const value = p.value ?? 0;
        const displayValue =
          p.name === 'Revenue' ? formatPrice(Number(value)) : value;
        return (
          <p key={index} className="text-sm text-neutral-gray">
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
    <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-light">
      <p className="text-sm font-medium text-neutral-dark">{data.name}</p>
      <p className="text-sm text-neutral-gray">{data.value} events</p>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // ---- AI modal state ----
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Events list — hits GET /events/me with the auth token.
  const {
    data: listResponse,
    isLoading: eventsLoading,
  } = useListMyEventsQuery(
    { limit: 50, offset: 0, include_creator: false },
    { skip: !isAuthenticated },
  );

  // ---- Reference data for the AI modal ----
  const { data: eventTypesResponse } = useGetEventTypesQuery();
  const { data: ticketTypesResponse } = useGetTicketTypesQuery();
  const eventTypes = eventTypesResponse?.data ?? [];
  const ticketTypes = ticketTypesResponse?.data ?? [];

  // ---- Create mutation for the AI "Publish as-is" path ----
  const [createEvent] = useCreateEventMutation();

  const events: Event[] = listResponse?.data?.data ?? [];

  // ---- AI handlers ----
  //
  // "Edit draft" stashes the AI draft in sessionStorage and navigates
  // to the create wizard. The wizard reads it on mount (see
  // CreateEventWizard's `?from=ai` pickup effect).
  //
  // If the sessionStorage write fails (private browsing, quota, or a
  // blocking extension), we do NOT navigate — otherwise the user
  // lands on an empty wizard with no explanation.
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
        `/dashboard/events/new?from=ai&event_type_id=${encodeURIComponent(eventTypeId)}`,
      );
    },
    [router],
  );

  const handlePublishAIDraft = useCallback(
    async (draft: GeneratedEventDraft, eventTypeId: string) => {
      try {
        const payload = draftToPublishPayload(draft, eventTypeId);
        const response = await createEvent(payload).unwrap();
        toast.success('Event published successfully!');
        router.push(`/dashboard/events/${response.data.id}`);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'data' in err
            ? (err as { data?: { message?: string } }).data?.message
            : 'Failed to publish event';
        toast.error(message || 'Failed to publish event');
      }
    },
    [createEvent, router],
  );

  // ---- Derived metrics ----
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const totalAttendees = events.reduce(
      (s, e) => s + (e.current_attendees ?? 0),
      0,
    );
    const totalRevenue = events.reduce(
      (s, e) => s + getEventMinPrice(e),
      0,
    );
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

    return {
      totalEvents,
      totalAttendees,
      totalRevenue,
      liveEvents,
      draftEvents,
      completedEvents,
      cancelledEvents,
      totalCpdHours,
    };
  }, [events]);

  // ---- Monthly aggregates for the area chart ----
  const monthlyData = useMemo(() => {
    const months: Record<
      string,
      { month: string; events: number; revenue: number; attendees: number }
    > = {};

    events.forEach((event) => {
      const startDate = event.start_date ?? event.schedules?.[0]?.start_date;
      if (!startDate) return;

      const d = new Date(startDate);
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      if (!months[key]) {
        months[key] = { month: monthName, events: 0, revenue: 0, attendees: 0 };
      }
      months[key].events += 1;
      months[key].revenue += getEventMinPrice(event);
      months[key].attendees += event.current_attendees ?? 0;
    });

    return Object.values(months).slice(-6);
  }, [events]);

  // ---- Status distribution for the pie chart ----
  const statusDistribution = [
    { name: 'Published', value: metrics.liveEvents, color: COLORS.tertiary },
    { name: 'Draft', value: metrics.draftEvents, color: COLORS.secondary },
    { name: 'Completed', value: metrics.completedEvents, color: COLORS.primary },
    { name: 'Cancelled', value: metrics.cancelledEvents, color: COLORS.error },
  ].filter((s) => s.value > 0);

  // ---- Event type distribution ----
  const typeDistribution = useMemo(() => {
    const types: Record<string, { name: string; value: number }> = {};

    events.forEach((event) => {
      const typeName =
        event.event_type?.display_name || event.event_type?.name || 'Uncategorized';
      if (!types[typeName]) {
        types[typeName] = { name: typeName, value: 0 };
      }
      types[typeName].value += 1;
    });

    return Object.values(types);
  }, [events]);

  // ---- Recent events (5 most recent) ----
  const recentEvents = useMemo(
    () =>
      events.slice(0, 5).map((event) => {
        const statusName = getEventStatusName(event);
        const startDate =
          event.start_date ?? event.schedules?.[0]?.start_date;

        const statusColorMap: Record<string, string> = {
          Draft: 'text-amber-600 bg-amber-50',
          Published: 'text-green-600 bg-green-50',
          Completed: 'text-blue-600 bg-blue-50',
          Cancelled: 'text-red-600 bg-red-50',
        };

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
          statusColor: statusColorMap[statusName] ?? 'text-gray-600 bg-gray-50',
          progress,
          isFeatured: event.is_featured,
          isPrivate: event.visibility === 'private',
        };
      }),
    [events],
  );

  // ---- Growth ----
  const previousMonthRevenue =
    monthlyData.length > 1
      ? monthlyData[monthlyData.length - 2]?.revenue ?? 0
      : 0;
  const currentMonthRevenue =
    monthlyData.length > 0
      ? monthlyData[monthlyData.length - 1]?.revenue ?? 0
      : 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

  // ---- Compact stats ----
  const compactStats = [
    {
      label: 'Total Events',
      value: metrics.totalEvents.toString(),
      icon: Calendar,
      color: 'text-primary',
      detail: `${metrics.liveEvents} live, ${metrics.draftEvents} draft`,
      growth: metrics.totalEvents > 0 ? '+12%' : '0%',
      growthTrend: 'up' as const,
    },
    {
      label: 'Attendees',
      value: metrics.totalAttendees.toLocaleString(),
      icon: Users,
      color: 'text-tertiary',
      detail: `Across ${metrics.totalEvents} events`,
      growth: metrics.totalAttendees > 0 ? '+8%' : '0%',
      growthTrend: 'up' as const,
    },
    {
      label: 'Revenue',
      value: formatPrice(metrics.totalRevenue),
      icon: CreditCard,
      color: 'text-secondary',
      detail: `${metrics.completedEvents} completed`,
      growth:
        revenueGrowth > 0
          ? `+${revenueGrowth.toFixed(0)}%`
          : `${revenueGrowth.toFixed(0)}%`,
      growthTrend: revenueGrowth >= 0 ? ('up' as const) : ('down' as const),
    },
    {
      label: 'CPD Hours',
      value: metrics.totalCpdHours.toString(),
      icon: Award,
      color: 'text-primary',
      detail: `${metrics.totalEvents} accredited`,
      growth: metrics.totalCpdHours > 0 ? '+5%' : '0%',
      growthTrend: 'up' as const,
    },
  ];

  // ============================================================
  // AUTH / LOADING GATES
  // ============================================================

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-50 rounded-full">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-sm text-gray-500">
              Please log in to view your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.name || 'User'}! Here&apos;s what&apos;s
            happening with your events.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsAIModalOpen(true)}
            size="sm"
            className={cn(
              'relative group overflow-hidden cursor-pointer border border-primary-300/40 text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] text-xs sm:text-sm h-9 px-3.5',
              'bg-gradient-to-r from-primary-700 via-primary-500 to-primary-400 hover:from-primary-600 hover:via-primary-400 hover:to-primary-300 ring-2 ring-primary-400/30',
            )}
          >
            {/* Shimmer light animation overlay */}
            <span
              aria-hidden="true"
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"
            />

            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-primary-100 animate-pulse transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
            <span className="font-semibold tracking-wide truncate">
              Generate Event with AI
            </span>
          </Button>

          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 py-1.5 px-2.5"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary py-1.5 px-2.5">
            <Activity className="h-3 w-3 mr-1" />
            Live: {metrics.liveEvents}
          </Badge>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column — 3/4 */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {compactStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-gray-50">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      {stat.growth !== '0%' && (
                        <div
                          className={`flex items-center gap-0.5 text-[10px] font-medium ${
                            stat.growthTrend === 'up'
                              ? 'text-tertiary'
                              : 'text-error'
                          }`}
                        >
                          {stat.growthTrend === 'up' ? (
                            <TrendingUp className="h-2.5 w-2.5" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5" />
                          )}
                          {stat.growth}
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {stat.detail}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue / attendees trend */}
            <Card className="lg:col-span-2 border-gray-200/80 shadow-sm">
              <CardHeader className="pb-1 px-4 sm:px-5 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Revenue Trend
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-tertiary" />
                      Attendees
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 pb-3">
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient
                          id="revenueGradient"
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
                            stopColor={COLORS.tertiary}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.tertiary}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
                      <XAxis
                        dataKey="month"
                        stroke="#5F6368"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#5F6368"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="attendees"
                        stroke={COLORS.tertiary}
                        fill="url(#attendeesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status pie */}
            <Card className="border-gray-200/80 shadow-sm">
              <CardHeader className="pb-1 px-4 sm:px-5 pt-3">
                <CardTitle className="text-sm font-semibold">
                  Event Status
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 pb-3">
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={20}
                        formatter={(value) => (
                          <span className="text-[10px] text-gray-500">
                            {value}
                          </span>
                        )}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent events */}
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-3 sm:pt-4">
              <CardTitle className="text-sm font-semibold">
                Recent Events
              </CardTitle>
              <Link
                href="/dashboard/events"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
              {recentEvents.length > 0 ? (
                <div className="space-y-1.5">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.id}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100 group"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </p>
                            {event.isFeatured && (
                              <Badge className="bg-secondary-500 text-white text-[10px] px-1.5">
                                <Star className="h-2 w-2 mr-0.5" />
                                Featured
                              </Badge>
                            )}
                            {event.isPrivate && (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] px-1.5"
                              >
                                Private
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${event.statusColor} border-0 px-1.5 py-0`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span>{event.date}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">
                              {event.attendees} attendees
                            </span>
                            {event.progress > 0 && event.progress < 100 && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-amber-600 hidden sm:inline">
                                  {event.progress}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                        {event.progress > 0 && event.progress < 100 && (
                          <div className="flex-1 sm:w-12">
                            <Progress value={event.progress} className="h-1" />
                          </div>
                        )}
                        {event.progress === 100 && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-tertiary flex-shrink-0" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  <p className="text-sm">
                    No events found. Create your first event to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — 1/4 */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick actions */}
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-0.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200"
                  >
                    <div
                      className={`p-1.5 rounded-lg ${action.bg} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors flex-1">
                      {action.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Event types */}
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-gray-400" />
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1.5">
                {typeDistribution.slice(0, 4).map((type, index) => (
                  <div
                    key={type.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-gray-600 truncate">
                        {type.name}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {type.value}
                    </span>
                  </div>
                ))}
                {typeDistribution.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No types yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-gray-200/80 shadow-sm">
            <CardHeader className="pb-1.5 px-4 pt-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-secondary" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-primary/5 border border-primary/10">
                <MessageSquare className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Send reminders to boost attendance
                </p>
              </div>
              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-tertiary/5 border border-tertiary/10">
                <Award className="h-3.5 w-3.5 text-tertiary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Issue certificates within 48 hours
                </p>
              </div>
              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-secondary/5 border border-secondary/10">
                <Share2 className="h-3.5 w-3.5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Share replays for 45% more engagement
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Event Generator Modal */}
      <GenerateWithAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        eventTypes={eventTypes}
        ticketTypes={ticketTypes}
        onEditDraft={handleEditAIDraft}
        onPublishDraft={handlePublishAIDraft}
      />
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Parse a duration string like "2h 30m" / "45m" / "3h" into minutes.
 */
function parseDuration(duration: string): number {
  if (!duration) return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
}