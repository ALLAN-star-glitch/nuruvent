// lib/server/events.ts
import 'server-only';
import type { Event, BaseResponse } from '@/lib/types/events';

// ============================================================
// CONFIG
// ============================================================

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

/**
 * Toggle Supabase's on-the-fly image resize.
 * Requires Image Transformations enabled on the Supabase project
 * (Pro plan and above).
 *
 * Set SUPABASE_IMAGE_TRANSFORM_ENABLED=true in .env.local to opt in.
 * When false, raw public URLs are returned unchanged.
 */
const SUPABASE_TRANSFORM_ENABLED =
  process.env.SUPABASE_IMAGE_TRANSFORM_ENABLED === 'true';

// ============================================================
// FETCH
// ============================================================

/**
 * Server-only fetch of a single event.
 * Cached for 5 minutes so repeat OG scrapes don't hammer the API.
 * Returns null if the event is missing, the API is unreachable, or
 * the API responds with a non-2xx status.
 */
export async function fetchEventById(id: string): Promise<Event | null> {
  if (!id || !API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      next: { revalidate: 300, tags: [`event:${id}`] },
      headers: {
        Accept: 'application/json',
        ...(PUBLIC_API_KEY ? { 'X-Api-Key': PUBLIC_API_KEY } : {}),
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as BaseResponse<Event>;
    return json?.data ?? null;
  } catch (err) {
    console.error('[server/events] fetchEventById failed:', err);
    return null;
  }
}

// ============================================================
// PATH HELPERS
// ============================================================

/**
 * Extracts the event UUID from a `/dashboard/events/<uuid>` path.
 * Used to pull the event out of the meeting URL's `return` param.
 *
 *   "/dashboard/events/9796fc87-91f6-4fde-b3ff-33dfd2c5485b"
 *     → "9796fc87-91f6-4fde-b3ff-33dfd2c5485b"
 *   "/dashboard/events/9796fc87-.../attendees"
 *     → "9796fc87-..."
 *   "not a path"
 *     → null
 */
export function extractEventIdFromPath(
  path: string | undefined,
): string | null {
  if (!path) return null;
  const match = path.match(
    /\/events\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  return match ? match[1] : null;
}

// ============================================================
// OG IMAGE RESOLUTION
// ============================================================

/**
 * Resolves the best Open Graph image URL for the given event.
 *
 * Priority:
 *   1. Supabase transform (if enabled) — 1200×630 cover crop
 *   2. Cloudinary transform — 1200×630 cover crop
 *   3. Imgix transform — 1200×630 cover crop
 *   4. Raw URL pass-through
 *   5. Fallback brand asset at /og-default.png
 */
export function toOgImage(
  event: Event | null,
  publicSiteUrl: string,
): string {
  const raw = event?.image_url || event?.thumbnail_url || '';
  if (!raw) return `${publicSiteUrl}/og-default.png`;

  // ---- Supabase Storage ----
  // /storage/v1/object/public/... → /storage/v1/render/image/public/...?...
  if (
    SUPABASE_TRANSFORM_ENABLED &&
    raw.includes('.supabase.co/storage/v1/object/public/')
  ) {
    const base = raw
      .replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/',
      )
      .split('?')[0];

    return `${base}?width=1200&height=630&resize=cover&quality=80`;
  }

  // ---- Cloudinary ----
  if (raw.includes('res.cloudinary.com') && raw.includes('/upload/')) {
    return raw.replace(
      '/upload/',
      '/upload/c_fill,w_1200,h_630,q_auto,f_auto/',
    );
  }

  // ---- Imgix ----
  if (raw.includes('?') && raw.includes('ixlib=')) {
    return `${raw}&w=1200&h=630&fit=crop`;
  }

  // ---- Fallback: raw URL ----
  return raw;
}