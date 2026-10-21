// lib/server/events.ts
import 'server-only';
import type { Event, BaseResponse } from '@/lib/types/events';

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
const SUPABASE_TRANSFORM_ENABLED =
  process.env.SUPABASE_IMAGE_TRANSFORM_ENABLED === 'true';

// ============================================================
// FETCH — BY ID
// ============================================================

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
// FETCH — BY SLUG
// ============================================================

export async function fetchEventBySlug(slug: string): Promise<Event | null> {
  if (!slug || !API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/events/slug/${slug}`, {
      next: { revalidate: 300, tags: [`event-slug:${slug}`] },
      headers: {
        Accept: 'application/json',
        ...(PUBLIC_API_KEY ? { 'X-Api-Key': PUBLIC_API_KEY } : {}),
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as BaseResponse<Event>;
    return json?.data ?? null;
  } catch (err) {
    console.error('[server/events] fetchEventBySlug failed:', err);
    return null;
  }
}

// ============================================================
// PATH HELPERS
// ============================================================

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
 *   1. Cloudinary transform (forced JPEG, 1200x630)
 *   2. Supabase transform (if enabled in env)
 *   3. Imgix transform (forced JPEG, 1200x630)
 *   4. Raw URL pass-through
 *   5. Fallback brand asset at /og-default.png
 */
export function toOgImage(
  event: Event | null,
  publicSiteUrl: string,
): string {
  const raw = event?.image_url || event?.thumbnail_url || '';
  
  if (!raw) {
    return `${publicSiteUrl}/og-default.png`;
  }

  // 1. Cloudinary
  if (raw.includes('res.cloudinary.com') && raw.includes('/upload/')) {
    return raw.replace(
      '/upload/',
      '/upload/c_fill,w_1200,h_630,q_auto:good,f_jpg/',
    );
  }

  // 2. Supabase
  if (raw.includes('.supabase.co/storage/v1/object/public/')) {
    if (SUPABASE_TRANSFORM_ENABLED) {
      const base = raw
        .replace(
          '/storage/v1/object/public/',
          '/storage/v1/render/image/public/',
        )
        .split('?')[0];
      return `${base}?width=1200&height=630&resize=cover&quality=80`;
    }
    // Fallback to raw if transforms are off
    return raw;
  }

  // 3. Imgix
  if (raw.includes('?') && raw.includes('ixlib=')) {
    return `${raw}&w=1200&h=630&fit=crop&fm=jpg&q=80`;
  }

  // 4. Fallback: raw URL
  return raw;
}