// lib/hooks/useEventDestination.ts

'use client';

import { useMemo } from 'react';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import type { Event } from '@/lib/types/events';

interface EventDestination {
  href: string;
  /** Button label on the card. */
  cta: 'register' | 'view';
  /** True if the destination is inside the dashboard. */
  isDashboard: boolean;
}

/**
 * Decides where an event card should link.
 *
 * - Private events always go to the dashboard (they have no public page).
 * - Events belonging to a team the user is a member of go to the dashboard,
 *   even if they're public. This is the "manage" flow.
 * - Everything else goes to the public /events/[slug] page.
 */
export function useEventDestination(event: Event): EventDestination {
  const { data: teamsData } = useGetUserTeamsQuery();
  const memberTeamIds = useMemo(
    () => new Set((teamsData?.teams ?? []).map((t) => t.id)),
    [teamsData],
  );

  const isMemberOfOwningTeam = memberTeamIds.has(event.team_id);
  const isPrivate = event.visibility === 'private' || event.is_private === true;

  const isDashboard = isPrivate || isMemberOfOwningTeam;

  const href = isDashboard
    ? `/dashboard/${event.account_id}/${event.team_id}/events/${event.id}`
    : `/events/${event.slug}`;

  return {
    href,
    cta: isDashboard ? 'view' : 'register',
    isDashboard,
  };
}