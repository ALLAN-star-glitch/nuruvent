// lib/utils/meetingUrl.ts

import type { Event, Schedule, VideoPlatform } from '@/lib/types/events';
import { getEventHostName } from '@/lib/utils/eventDisplay';

/**
 * Resolve the platform-side meeting code for a schedule.
 *
 * Sources, in priority order:
 *
 *  1. `video_meeting_external_id` — set by the video module at
 *     creation time. "spaces/abc-defg-hij" for Google Meet, a
 *     numeric string for Zoom. Matches video_meetings.external_id.
 *
 *  2. The raw provider link (`meet_link` / `zoom_link`) — parsed
 *     for legacy rows that predate the external-ID column.
 *
 * IMPORTANT: never read `video_meeting_id` here. That field is the
 * FK to video_meetings.id and holds a Nuruvent UUID, not a platform
 * code. Passing it to Google Meet or Zoom produces a 404.
 */
export function platformMeetingCode(
  schedule: Schedule,
  platform: VideoPlatform,
): string | undefined {
  // The join URL carries the code the platform's URL scheme expects.
  // For Google Meet, video_meeting_external_id is a resource name
  // ("spaces/xxx") that does NOT match the URL code ("abc-defg-hij").
  // Prefer the URL.
  const raw = schedule.meet_link || schedule.zoom_link;
  if (raw) {
    if (platform === 'google_meet') {
      const m = raw.match(/meet\.google\.com\/([a-z-]+)/i);
      if (m) return m[1];
    }
    if (platform === 'zoom') {
      const m = raw.match(/\/j\/(\d+)/);
      if (m) return m[1];
    }
  }

  // Fall back to the external ID only when there is no URL to parse.
  const ext = (schedule as { video_meeting_external_id?: string })
    .video_meeting_external_id;
  if (ext) {
    if (platform === 'google_meet' && ext.startsWith('spaces/')) {
      return ext.slice('spaces/'.length);
    }
    return ext;
  }

  return undefined;
}

/**
 * Classify a schedule's platform from its explicit field or from the
 * shape of its links.
 */
export function schedulePlatform(
  s: Schedule,
): VideoPlatform | undefined {
  if (s.platform) return s.platform;
  if (s.zoom_link) return 'zoom';
  if (s.meet_link) return 'google_meet';
  return undefined;
}

/**
 * Build the Nuruvent-hosted meeting URL for a schedule:
 *
 *   https://www.nuruvent.com/meeting/{code}?name=...&platform=...&return=...
 *
 * Returns undefined when no platform or no meeting code can be
 * resolved — the caller should hide any join action in that case.
 */
export function nuruventMeetingUrl(
  schedule: Schedule,
  event: Event,
): string | undefined {
  const platform = schedulePlatform(schedule);
  if (!platform) return undefined;

  const code = platformMeetingCode(schedule, platform);
  if (!code) return undefined;

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.nuruvent.com';

  const hostName = getEventHostName(event);

  const params = new URLSearchParams({
    name: event.display_name || event.name,
    return: `/dashboard/events/${event.id}`,
    platform,
  });
  if (hostName) params.set('host', hostName);

  return `${origin}/meeting/${encodeURIComponent(code)}?${params.toString()}`;
}