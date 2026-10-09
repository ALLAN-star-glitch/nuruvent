// lib/utils/team-switch.ts

/**
 * Segments that are safe to carry over when switching teams.
 * Anything else (e.g. `settings/members`, `events/<id>/edit`)
 * resets to the team dashboard root so the user doesn't land on a
 * route that may 403 in the target team.
 */
export const SAFE_TEAM_SEGMENTS = new Set<string>([
  '',
  'events',
  'registrations',
  'tickets',
  'attendees',
  'certificates',
  'payments',
  'replays',
  'revenue',
  'trash',
  'settings',
]);

/**
 * Build the target URL when switching from one team to another.
 *
 * Behavior:
 *  - Safe trailing segment → replace accountId + teamId, keep the rest.
 *  - Unsafe/deep segment  → drop to team root.
 *  - Not on a team-scoped route → drop to team root.
 *
 * Works across accounts: switching from Acme's team to a Personal
 * team while on `/events` keeps you on `/events`.
 */
export function buildTeamSwitchHref(
  pathname: string,
  nextAccountId: string,
  nextTeamId: string,
): string {
  const teamRoot = `/dashboard/${nextAccountId}/${nextTeamId}`;

  const match = pathname.match(
    /^\/dashboard\/([^/]+)\/[^/]+(?:\/(.*))?$/,
  );

  // Not on a team-scoped route → team root.
  if (!match) return teamRoot;

  const trailingFull = match[2] ?? '';
  const trailingFirst = trailingFull.split('/')[0];

  // Safe segment → preserve the relative path.
  if (SAFE_TEAM_SEGMENTS.has(trailingFirst)) {
    return `${teamRoot}${trailingFull ? `/${trailingFull}` : ''}`;
  }

  // Unsafe/deep segment → team root.
  return teamRoot;
}