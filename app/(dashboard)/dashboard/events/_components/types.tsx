export type SortField =
  | 'name'
  | 'eventDate'
  | 'addedDate'
  | 'current_attendees'
  | 'price'
  | 'status';

export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'table' | 'grid';

export interface UIEvent {
  id: string;
  title: string;
  eventTypeId: string;
  eventStatusId: string;
  typeDisplayName: string;
  statusDisplayName: string;
  type: string;
  status: string;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  priceDisplay: string;
  priceValue: number;
  platform: string;
  cpdHours: number;
  description: string;
  host: string;
  location: string;
  image?: string;
  slug: string;
  rawDate: string;
  duration: string;
  certificatePrice: number;
  isVirtual: boolean;
  isFeatured: boolean;
  isPrivate: boolean;
  zoomLink?: string;
  meetLink?: string;
  createdAt: string;
  publishedAt?: string;
  deletedAt?: string;
  isDeleted: boolean;
}