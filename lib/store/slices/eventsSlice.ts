// lib/store/slices/eventsSlice.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================
// TYPES
// ============================================================

// ✅ NEW: Creator information
export interface CreatorInfo {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  phone?: string;
  account_type: string;
  institution_name?: string;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  display_name?: string;
  description?: string;
  event_type_id: string;
  event_status_id: string;
  account_id: string;
  created_by: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  certificate_price: number;
  location?: string;
  is_virtual: boolean;
  is_featured?: boolean;
  is_private?: boolean;
  zoom_link?: string;
  meet_link?: string;
  max_attendees: number;
  current_attendees: number;
  image_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  deleted_at?: string | null;
  deleted_by?: string;
  restored_at?: string | null;
  restored_by?: string;
  created_at: string;
  updated_at: string;
  // ✅ NEW: Creator information
  creator: CreatorInfo;
}

export interface EventType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface EventStatus {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface MediaInfo {
  id: string;
  url: string;
  media_type: string;
  entity_id: string;
  uploaded_by: string;
  created_at: string;
}

export interface EventsState {
  // Current selected event
  currentEvent: Event | null;
  // Event types and statuses (cached)
  eventTypes: EventType[];
  eventStatuses: EventStatus[];
  // Loading states
  isLoading: boolean;
  error: string | null;
  // Pagination
  currentPage: number;
  pageSize: number;
  totalEvents: number;
  // Filters
  filters: {
    eventTypeId?: string;
    eventStatusId?: string;
    searchQuery?: string;
    includeDeleted?: boolean;
  };
}

// ============================================================
// INITIAL STATE
// ============================================================

// ✅ Helper to create empty creator
const emptyCreator = (): CreatorInfo => ({
  id: '',
  name: '',
  display_name: '',
  email: '',
  phone: '',
  account_type: '',
  institution_name: '',
});

const initialState: EventsState = {
  currentEvent: null,
  eventTypes: [],
  eventStatuses: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 5,
  totalEvents: 0,
  filters: {},
};

// ============================================================
// SLICE
// ============================================================

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    setEventTypes: (state, action: PayloadAction<EventType[]>) => {
      state.eventTypes = action.payload;
    },
    setEventStatuses: (state, action: PayloadAction<EventStatus[]>) => {
      state.eventStatuses = action.payload;
    },
    setEventsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setEventsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setTotalEvents: (state, action: PayloadAction<number>) => {
      state.totalEvents = action.payload;
    },
    setEventTypeFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.eventTypeId = action.payload;
      state.currentPage = 1;
    },
    setEventStatusFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.eventStatusId = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string | undefined>) => {
      state.filters.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setIncludeDeleted: (state, action: PayloadAction<boolean>) => {
      state.filters.includeDeleted = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    clearEventsState: (state) => {
      state.currentEvent = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

// ============================================================
// EXPORTS
// ============================================================

export const {
  setCurrentEvent,
  setEventTypes,
  setEventStatuses,
  setEventsLoading,
  setEventsError,
  setCurrentPage,
  setPageSize,
  setTotalEvents,
  setEventTypeFilter,
  setEventStatusFilter,
  setSearchQuery,
  setIncludeDeleted,
  clearFilters,
  clearEventsState,
} = eventsSlice.actions;

export default eventsSlice.reducer;