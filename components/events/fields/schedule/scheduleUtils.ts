// components/events/fields/schedule/scheduleUtils.ts

import type { VideoPlatform } from '@/lib/types/events';
import type { ScheduleForm } from '../../types';
import { PLATFORMS, type PlatformMeta } from '../../video/PlatformPickerModal';

// ============================================================
// CLIPBOARD
// ============================================================

/**
 * Copy text to the clipboard. Uses the modern Clipboard API when
 * available and falls back to a hidden textarea + execCommand for
 * older browsers and non-secure contexts.
 *
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ============================================================
// LINK RESOLUTION
// ============================================================

/**
 * Return the schedule's join link, preferring Zoom over Meet.
 * Returns undefined if neither is set.
 */
export function scheduleLink(s: ScheduleForm): string | undefined {
  return s.zoom_link || s.meet_link || undefined;
}

/**
 * Determine which platform metadata applies to a schedule. Priority:
 *   1. Explicit `platform` field on the schedule.
 *   2. URL shape — `zoom.us` in zoom_link → zoom.
 *   3. URL shape — `meet.google.com` in meet_link → google_meet.
 *   4. No platform (undefined).
 */
export function resolvePlatformMeta(
  schedule: ScheduleForm,
): PlatformMeta | undefined {
  if (schedule.platform) {
    return PLATFORMS.find((p) => p.platform === schedule.platform);
  }
  if (schedule.zoom_link) {
    return PLATFORMS.find((p) => p.platform === 'zoom');
  }
  if (schedule.meet_link) {
    return PLATFORMS.find((p) => p.platform === 'google_meet');
  }
  return undefined;
}

/**
 * Apply a platform change to a schedule, clearing the other platform's
 * link and dropping the stale video_meeting_id.
 *
 * Used by SchedulesField when the user picks a different platform tile.
 * Returns the patch object to merge into the schedule.
 */
export function buildPlatformChangePatch(
  schedule: ScheduleForm,
  nextPlatform: VideoPlatform | undefined,
): Partial<ScheduleForm> {
  return {
    platform: nextPlatform ?? undefined,
    zoom_link: nextPlatform === 'zoom' ? schedule.zoom_link : '',
    meet_link: nextPlatform === 'google_meet' ? schedule.meet_link : '',
    video_meeting_id: null,
  };
}

/**
 * Apply a toggle-to-in-person patch. Clears platform, links, and
 * meeting id so the schedule is cleanly in-person.
 */
export function buildToggleToInPersonPatch(): Partial<ScheduleForm> {
  return {
    is_virtual: false,
    platform: undefined,
    zoom_link: '',
    meet_link: '',
    video_meeting_id: null,
  };
}