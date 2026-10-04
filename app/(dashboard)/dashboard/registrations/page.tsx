/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Ticket } from 'lucide-react';

import { SegmentedTabs } from './_components/SegmentedTabs';
import { StatsCards } from './_components/StatsCards';
import { HostingTab } from './_components/HostingTab';
import { AttendingTab } from './_components/AttendingTab';

import {
  useListAllRegistrationsQuery,
  useListMyRegistrationsQuery,
} from '@/lib/store/api/registrationsApi';

type Tab = 'hosting' | 'attending';

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: Tab = tabParam === 'attending' ? 'attending' : 'hosting';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { data: hostingData } = useListAllRegistrationsQuery({
    page: 1,
    page_size: 100,
  });
  const { data: mineData } = useListMyRegistrationsQuery({
    page: 1,
    page_size: 100,
  });

  const hostingRows = hostingData?.data?.registrations ?? [];
  const hostingTotal = hostingData?.data?.total ?? 0;
  const mineRows = mineData?.data?.registrations ?? [];
  const mineTotal = mineData?.data?.total ?? 0;

  const hostingStats = useMemo(() => {
    const confirmed = hostingRows.filter((r) => r.status === 'confirmed').length;
    const pending = hostingRows.filter((r) => r.status === 'pending').length;
    const guests = hostingRows.filter((r) => r.is_guest).length;
    return { confirmed, pending, guests };
  }, [hostingRows]);

  const attendingStats = useMemo(() => {
    const now = Date.now();
    const upcoming = mineRows.filter(
      (r) => r.event_start_date && new Date(r.event_start_date).getTime() > now,
    ).length;
    const past = mineRows.filter(
      (r) => r.event_start_date && new Date(r.event_start_date).getTime() <= now,
    ).length;
    return { upcoming, past };
  }, [mineRows]);

  const stats =
    activeTab === 'hosting'
      ? [
          {
            label: 'Total',
            value: hostingTotal,
            sub: 'across your events',
            tone: 'primary' as const,
            icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
          },
          {
            label: 'Confirmed',
            value: hostingStats.confirmed,
            sub: 'on this page',
            tone: 'emerald' as const,
            icon: null,
          },
          {
            label: 'Pending',
            value: hostingStats.pending,
            sub: 'awaiting payment',
            tone: 'amber' as const,
            icon: null,
          },
          {
            label: 'Guests',
            value: hostingStats.guests,
            sub: 'no account',
            tone: 'sky' as const,
            icon: null,
          },
        ]
      : [
          {
            label: 'Total',
            value: mineTotal,
            sub: 'my registrations',
            tone: 'primary' as const,
            icon: <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />,
          },
          {
            label: 'Upcoming',
            value: attendingStats.upcoming,
            sub: 'events ahead',
            tone: 'emerald' as const,
            icon: null,
          },
          {
            label: 'Past',
            value: attendingStats.past,
            sub: 'events behind',
            tone: 'amber' as const,
            icon: null,
          },
          {
            label: 'Join ready',
            value: mineRows.filter((r) => r.is_virtual || r.is_hybrid).length,
            sub: 'with links',
            tone: 'sky' as const,
            icon: null,
          },
        ];

  return (
    <div className="space-y-5 sm:space-y-8 pb-44 md:pb-20">
      {/* Header */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1.5 sm:mb-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Registration center
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Registrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-1.5">
          Manage registrations for your events, or view yours.
        </p>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:block">
        <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <StatsCards stats={stats} />

      <div
        key={activeTab}
        className="animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
      >
        {activeTab === 'hosting' ? <HostingTab /> : <AttendingTab />}
      </div>

      {/* Mobile floating bottom nav */}
      <MobileBottomTabs activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

/* ============================================================
 * Mobile floating bottom tabs
 * ============================================================ */

function MobileBottomTabs({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: 'hosting',
      label: 'Hosting',
      sub: 'Your events',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'attending',
      label: 'Attending',
      sub: 'Your tickets',
      icon: <Ticket className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <div className="mx-auto max-w-md px-4">
        <div className="pointer-events-auto rounded-2xl border border-border/70 bg-background/85 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/40 p-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange(t.id)}
                  aria-pressed={active}
                  className={[
                    'relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5',
                    'transition-all duration-200 cursor-pointer select-none',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      active
                        ? 'bg-primary-foreground/15 text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {t.icon}
                  </span>
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="text-sm font-semibold leading-tight">
                      {t.label}
                    </span>
                    <span
                      className={[
                        'text-[10px] leading-tight truncate',
                        active
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {t.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}