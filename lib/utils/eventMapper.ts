// lib/utils/eventMapper.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  EventResponse, 
  EventTypeResponse, 
  EventStatusResponse 
} from '@/lib/store/api/eventsApi';

/**
 * Map backend event data (which may have uppercase fields like ID, Name)
 * to frontend EventResponse (lowercase fields like id, name)
 */
export const mapEventResponse = (data: any): EventResponse => ({
  id: data.id || data.ID || '',
  slug: data.slug || data.Slug || '',
  name: data.name || data.Name || '',
  display_name: data.display_name || data.DisplayName || '',
  description: data.description || data.Description || '',
  event_type_id: data.event_type_id || data.EventTypeID || '',
  event_status_id: data.event_status_id || data.EventStatusID || '',
  image_url: data.image_url || data.ImageURL || '',
  thumbnail_url: data.thumbnail_url || data.ThumbnailURL || '',
  date: data.date || data.Date || '',
  time: data.time || data.Time || '',
  duration: data.duration || data.Duration || 0,
  price: data.price || data.Price || 0,
  certificate_price: data.certificate_price || data.CertificatePrice || 0,
  location: data.location || data.Location || '',
  is_virtual: data.is_virtual ?? data.IsVirtual ?? true,
  is_featured: data.is_featured ?? data.IsFeatured ?? false,
  is_private: data.is_private ?? data.IsPrivate ?? false,
  zoom_link: data.zoom_link || data.ZoomLink || '',
  meet_link: data.meet_link || data.MeetLink || '',
  max_attendees: data.max_attendees || data.MaxAttendees || 0,
  current_attendees: data.current_attendees || data.CurrentAttendees || 0,
  account_id: data.account_id || data.AccountID || '',
  created_by: data.created_by || data.CreatedBy || '',
  is_active: data.is_active ?? data.IsActive ?? true,
  deleted_at: data.deleted_at || data.DeletedAt || null,
  deleted_by: data.deleted_by || data.DeletedBy || '',
  restored_at: data.restored_at || data.RestoredAt || null,
  restored_by: data.restored_by || data.RestoredBy || '',
  created_at: data.created_at || data.CreatedAt || '',
  updated_at: data.updated_at || data.UpdatedAt || '',
});

/**
 * Map backend event type data to frontend EventTypeResponse
 */
export const mapEventType = (data: any): EventTypeResponse => ({
  id: data.id || data.ID || '',
  name: data.name || data.Name || '',
  slug: data.slug || data.Slug || '',
  description: data.description || data.Description || '',
  icon: data.icon || data.Icon || '',
  color: data.color || data.Color || '',
});

/**
 * Map backend event status data to frontend EventStatusResponse
 */
export const mapEventStatus = (data: any): EventStatusResponse => ({
  id: data.id || data.ID || '',
  name: data.name || data.Name || '',
  slug: data.slug || data.Slug || '',
  color: data.color || data.Color || '',
});

/**
 * Map an array of events
 */
export const mapEventsArray = (data: any[]): EventResponse[] => {
  if (!Array.isArray(data)) return [];
  return data.map(mapEventResponse);
};

/**
 * Map paginated response
 */
export const mapPaginatedEvents = (response: any): {
  data: EventResponse[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
} => {
  // Handle response.data.data format
  if (response?.data?.data && Array.isArray(response.data.data)) {
    return {
      data: response.data.data.map(mapEventResponse),
      page: response.data.page || 1,
      page_size: response.data.page_size || 20,
      total: response.data.total || 0,
      total_pages: response.data.total_pages || 0,
    };
  }

  // Handle response.data format
  if (response?.data && Array.isArray(response.data)) {
    return {
      data: response.data.map(mapEventResponse),
      page: response.page || 1,
      page_size: response.page_size || 20,
      total: response.total || response.data.length,
      total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / 20),
    };
  }

  // Fallback
  return {
    data: [],
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  };
};