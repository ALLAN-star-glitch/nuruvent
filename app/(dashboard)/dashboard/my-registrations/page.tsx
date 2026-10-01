// app/(dashboard)/dashboard/registrations/page.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CalendarX2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Ticket,
  Video,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useGetMySessionLinksQuery } from '@/lib/store/api/attendanceApi';
import type { SessionLink, SessionLinkGroup } from '@/lib/types/attendance';

// ============================================================
// TYPES
// ============================================================

type SortField = 'name' | 'eventDate' | 'sessions';
type SortDirection = 'asc' | 'desc';
type StatusTab = 'all' | 'upcoming' | 'past';

interface UIRegistration {
  registrationId: string;
  eventId: string;
  title: string;
  slug: string;
  eventDate: string;
  rawDate: string;
  sessionCount: number;
  joinableCount: number;
  platforms: string[];
  links: SessionLink[];
  isUpcoming: boolean;
  isPast: boolean;
  nextSession: SessionLink | null;
}

// ============================================================
// PLATFORM HELPERS
// ============================================================

interface PlatformMeta {
  label: string;
  logo?: string;
}

function getPlatformMeta(platform: string): PlatformMeta {
  switch (platform) {
    case 'zoom':
      return { label: 'Zoom', logo: '/platforms/zoom.png' };
    case 'google_meet':
      return { label: 'Google Meet', logo: '/platforms/google-meet.png' };
    case 'in_person':
      return { label: 'In-Person' };
    default:
      return { label: platform || 'Virtual' };
  }
}

function PlatformBadge({ platform }: { platform: string }) {
  const meta = getPlatformMeta(platform);
  return (
    <Badge
      variant="outline"
      className="text-xs font-normal inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 h-6"
    >
      {meta.logo ? (
        <span className="relative h-3.5 w-3.5 shrink-0">
          <Image
            src={meta.logo}
            alt=""
            fill
            sizes="14px"
            className="object-contain"
          />
        </span>
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
      <span>{meta.label}</span>
    </Badge>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateLong(dateString: string | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function toUIRegistration(group: SessionLinkGroup): UIRegistration {
  const now = Date.now();
  const eventTs = new Date(group.event_date).getTime();
  const sessionCount = group.links.length;
  const joinableLinks = group.links.filter(
    (l) => l.join_url && new Date(l.expires_at).getTime() > now,
  );

  const sortedUpcoming = [...joinableLinks].sort(
    (a, b) =>
      new Date(a.scheduled_start).getTime() -
      new Date(b.scheduled_start).getTime(),
  );
  const futureSession =
    sortedUpcoming.find((l) => new Date(l.scheduled_start).getTime() > now) ??
    sortedUpcoming[0] ??
    null;

  // Collect every distinct platform present on this registration.
  // Order preserved by first appearance so the primary platform stays
  // first in the badges row.
  const platforms: string[] = [];
  for (const l of group.links) {
    if (l.platform && !platforms.includes(l.platform)) {
      platforms.push(l.platform);
    }
  }

  return {
    registrationId: group.registration_id,
    eventId: group.event_id,
    title: group.event_name,
    slug: group.event_slug,
    eventDate: formatDateShort(group.event_date),
    rawDate: group.event_date,
    sessionCount,
    joinableCount: joinableLinks.length,
    platforms,
    links: group.links,
    isUpcoming: eventTs > now,
    isPast: eventTs <= now,
    nextSession: futureSession,
  };
}

// ============================================================
// PAGE
// ============================================================

export default function RegistrationsDashboardPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMySessionLinksQuery();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups: SessionLinkGroup[] = response?.data?.groups ?? [];

  const registrations: UIRegistration[] = useMemo(
    () => groups.map(toUIRegistration),
    [groups],
  );

  const filtered = useMemo(() => {
    let out = [...registrations];

    if (activeTab === 'upcoming') {
      out = out.filter((r) => r.isUpcoming);
    } else if (activeTab === 'past') {
      out = out.filter((r) => r.isPast);
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      out = out.filter((r) => r.title.toLowerCase().includes(q));
    }

    out.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'eventDate':
          cmp = new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
          break;
        case 'sessions':
          cmp = a.sessionCount - b.sessionCount;
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return out;
  }, [registrations, activeTab, debouncedSearchQuery, sortField, sortDirection]);

  const totalRegistrations = registrations.length;
  const upcomingCount = registrations.filter((r) => r.isUpcoming).length;
  const totalJoinable = registrations.reduce((s, r) => s + r.joinableCount, 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
    );
  };

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Refreshing registrations…',
      success: 'Registrations refreshed',
      error: 'Failed to refresh',
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('all');
    setSortField('eventDate');
    setSortDirection('asc');
  };

  // ============================================================
  // RENDER GATES
  // ============================================================

  if (isLoading && !response) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your registrations…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Failed to load registrations
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Something went wrong while fetching your registrations.
            </p>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Events I&apos;m Attending
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Events you&apos;re attending. Join your sessions from here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')}
            />
            Refresh
          </Button>
          <Link href="/dashboard/events" className="cursor-pointer">
            <Button size="sm" className="cursor-pointer">
              <Calendar className="h-4 w-4 mr-2" />
              Browse events
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Registrations"
          value={totalRegistrations}
          sub={upcomingCount > 0 ? `${upcomingCount} upcoming` : 'no upcoming'}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          label="Joinable"
          value={totalJoinable}
          sub="links ready"
          icon={<Video className="h-4 w-4" />}
        />
        <StatCard
          label="Attended"
          value={registrations.filter((r) => r.isPast).length}
          sub="past events"
          icon={<CalendarX2 className="h-4 w-4" />}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="inline-flex items-center p-0.5 rounded-lg bg-muted shrink-0 self-start sm:self-auto">
          {(['all', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium capitalize rounded-md transition-colors cursor-pointer',
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by event name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 cursor-text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {(searchQuery || activeTab !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground mb-1">
              {debouncedSearchQuery
                ? `No registrations match "${debouncedSearchQuery}"`
                : activeTab !== 'all'
                  ? `No ${activeTab} registrations`
                  : 'No registrations yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {debouncedSearchQuery || activeTab !== 'all'
                ? 'Try a different search or filter.'
                : 'Events you register for will appear here with your session links.'}
            </p>
            {!debouncedSearchQuery && activeTab === 'all' && (
              <Link href="/dashboard/events" className="cursor-pointer">
                <Button className="cursor-pointer">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse events
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registrations list */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <RegistrationCard
              key={r.registrationId}
              reg={r}
              expanded={expandedId === r.registrationId}
              onToggle={() =>
                setExpandedId((prev) =>
                  prev === r.registrationId ? null : r.registrationId,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

function StatCard({
  label,
  value,
  sub,
  icon,
  className,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums leading-none mt-1">
            {value}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
            {sub}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RegistrationCard({
  reg,
  expanded,
  onToggle,
}: {
  reg: UIRegistration;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sessionCount = reg.links.length;
  const hasMultipleSessions = sessionCount > 1;
  const hasAnySessions = sessionCount > 0;

  // A single-session registration shows the row inline — no toggle,
  // no collapse. The user just sees their one join button.
  const showInline = sessionCount === 1;
  const showToggle = hasMultipleSessions;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        expanded && 'border-primary/40 shadow-md',
      )}
    >
      {/* Header — clicking anywhere here toggles the sessions when
          there's more than one; otherwise it's inert. */}
      <button
        type="button"
        onClick={showToggle ? onToggle : undefined}
        disabled={!showToggle}
        aria-expanded={showToggle ? expanded : undefined}
        className={cn(
          'w-full text-left p-4 sm:p-5 group',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          showToggle ? 'cursor-pointer hover:bg-accent/30' : 'cursor-default',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                {reg.title}
              </h3>
              {reg.isUpcoming ? (
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40"
                >
                  Upcoming
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 text-muted-foreground bg-muted border-border"
                >
                  Past
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDateLong(reg.rawDate)}</span>
            </div>
          </div>

          {showToggle && (
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200',
                expanded && 'rotate-180',
              )}
            />
          )}
        </div>

        {/* Metadata row — one badge per distinct platform */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-3 pt-3 border-t border-border">
          {reg.platforms.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {reg.platforms.map((p) => (
                <PlatformBadge key={p} platform={p} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            <span>
              <span className="font-semibold text-foreground tabular-nums">
                {reg.joinableCount}
              </span>
              <span className="mx-0.5">/</span>
              <span className="tabular-nums">{reg.sessionCount}</span>{' '}
              joinable
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ticket className="h-3.5 w-3.5" />
            <span className="font-mono">
              REG {reg.registrationId.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Session toggle — only when there's more than one session */}
        {showToggle && (
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground">
              {sessionCount} sessions
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2',
                'text-sm font-semibold transition-all duration-200',
                'border shadow-sm',
                expanded
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15 hover:border-primary/50',
              )}
            >
              {expanded ? 'Hide sessions' : 'View sessions'}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  expanded && 'rotate-180',
                )}
              />
            </span>
          </div>
        )}
      </button>

      {/* Single-session inline row — no toggle needed */}
      {showInline && hasAnySessions && (
        <div className="border-t border-border bg-muted/20 p-3 sm:p-4">
          <SessionLinkRow link={reg.links[0]} />
        </div>
      )}

      {/* Multi-session collapsible list */}
      {hasMultipleSessions && (
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            expanded
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border bg-muted/20 p-3 sm:p-4 space-y-2">
              {reg.links.map((link) => (
                <SessionLinkRow key={link.session_id} link={link} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function SessionLinkRow({ link }: { link: SessionLink }) {
  const expiresAt = new Date(link.expires_at);
  // eslint-disable-next-line react-hooks/purity
  const isExpired = expiresAt.getTime() < Date.now();
  const isJoinable = !!link.join_url && !isExpired;
  const meta = getPlatformMeta(link.platform);

  return (
    <div className="rounded-lg border border-border bg-background p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Left: logo + info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0 h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center p-1.5">
          {meta.logo ? (
            <div className="relative h-full w-full">
              <Image
                src={meta.logo}
                alt={meta.label}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {link.session_title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {formatTimeRange(link.scheduled_start, link.scheduled_end)}
            </span>
            <span className="text-border">·</span>
            <span>{meta.label}</span>
          </div>
        </div>
      </div>

      {/* Right: join action */}
      <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
        {isJoinable ? (
          <Button
            size="sm"
            className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            onClick={() =>
              window.open(link.join_url, '_blank', 'noopener,noreferrer')
            }
          >
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Join session
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic whitespace-nowrap px-2">
            Link expired
          </span>
        )}
      </div>
    </div>
  );
}