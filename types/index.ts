// types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'attendee' | 'admin';
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  date: string;
  time: string;
  price: number;
  host: string;
  hostId: string;
  image?: string;
  location: 'virtual' | 'physical';
  zoomLink?: string;
  meetLink?: string;
  certificatePrice?: number;
  attendees: number;
  maxAttendees?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  type?: string;
  priceRange?: string;
  date?: string;
  search?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}