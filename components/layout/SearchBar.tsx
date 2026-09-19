'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ChevronDown,
  Calendar,
  Tag,
  Monitor,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  useListEventsQuery,
  useSearchEventsQuery,
  useGetCategoriesQuery,
} from '@/lib/store/api/eventsApi';
import type { Event, SearchEventsParams } from '@/lib/types/events';

// ============================================================
// TYPES
// ============================================================

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  /**
   * Scope overrides — e.g. `{ team_id, team_type }` when embedded
   * inside a team dashboard. Both endpoints accept these.
   */
  scope?: Pick<SearchEventsParams, 'team_id' | 'team_type'>;
  /** Fired before navigation, so parents can react to the query. */
  onSearch?: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  /** Category *slug* — resolved to a UUID before hitting the API. */
  category: string;
  /** 'virtual' | 'in-person' | 'hybrid' | '' — client-side only. */
  format: string;
}

type PriceInfo =
  | { kind: 'free' }
  | { kind: 'from'; amount: number; currency: string }
  | { kind: 'tbd' };

// ============================================================
// CONSTANTS
// ============================================================

const FORMATS = [
  { value: '', label: 'All Formats' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const BROWSE_PAGE_SIZE = 8;
const SEARCH_PAGE_SIZE = 8;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const CURRENCY = 'KES';

/** Deterministic placeholder tile colors — plays well with primary purple. */
const PLACEHOLDER_COLORS = [
  '#8B5CF6', // violet
  '#6366F1', // indigo
  '#0EA5E9', // sky
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
];

// ============================================================
// HOOKS
// ============================================================

/** Debounce any value. No lodash dependency. */
function useDebounced<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Derive the display format from the EventResponse shape.
 * The backend has no `format` field — it exposes `is_virtual` and
 * `is_hybrid` booleans. Order matters: hybrid wins over virtual.
 *
 * Used ONLY for rendering the badge and for the client-side format
 * refinement. Text search and category filtering are server-side.
 */
function deriveFormat(e: Event): 'virtual' | 'in-person' | 'hybrid' {
  if (e.is_hybrid) return 'hybrid';
  if (e.is_virtual) return 'virtual';
  return 'in-person';
}

/**
 * Resolve price display info from an EventResponse.
 *
 * Cases:
 *   is_free: true                           → 'free'
 *   is_free: false, active tickets w/ price → 'from' cheapest
 *   is_free: false, no tickets / zero price → 'tbd'
 *
 * Assumes KES — the backend currently doesn't send a currency field.
 */
function derivePriceInfo(e: Event): PriceInfo {
  if (e.is_free) return { kind: 'free' };

  const prices = (e.tickets ?? [])
    .filter((t) => t.is_active !== false)
    .map((t) => t.price)
    .filter((p): p is number => typeof p === 'number' && p > 0);

  if (prices.length === 0) return { kind: 'tbd' };

  return { kind: 'from', amount: Math.min(...prices), currency: CURRENCY };
}

/** Format a PriceInfo for display. */
function formatPrice(info: PriceInfo): string {
  switch (info.kind) {
    case 'free':
      return 'Free';
    case 'from':
      return `${info.currency} ${info.amount.toLocaleString()}`;
    case 'tbd':
      return 'See details';
  }
}

/** Prefer display_name, fall back to name. */
function deriveTitle(e: Event): string {
  return e.display_name || e.name;
}

/** Organizer display string, with a sensible fallback. */
function deriveHost(e: Event): string {
  return e.organizer?.display_name || e.organizer?.name || 'Unknown host';
}

/** Short date label, e.g. "Sep 19". */
function deriveDateLabel(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

/** Route target — slug is the public-friendly path. */
function deriveHref(e: Event): string {
  return `/events/${e.slug || e.id}`;
}

/**
 * Image URL for the dropdown row. Uses `image_url` only — the backend
 * omits the field entirely when an event has no image, so we return
 * null and the caller renders a colored placeholder tile.
 */
function deriveImage(e: Event): string | null {
  return e.image_url || null;
}

/** Deterministic placeholder color from the event id/slug. */
function placeholderColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

/** First letter of the event title, for the placeholder tile. */
function initialOf(title: string): string {
  return (title.trim()[0] || '?').toUpperCase();
}

// ============================================================
// COMPONENT
// ============================================================

export function SearchBar({
  placeholder,
  autoFocus,
  scope,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();

  // ---- State ----
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    format: '',
  });

  const searchRef = useRef<HTMLDivElement>(null);

  // ---- Debounced query ----
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounced(trimmedQuery, DEBOUNCE_MS);

  // ---- Mode detection ----
  // BROWSE: focused, no query (or < 2 chars)   → GET /events
  // SEARCH: focused, query >= 2 chars          → GET /events/search
  const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const isBrowseMode = isFocused && !isSearchMode;

  // ---- Reference data: categories ----
  // Cached by RTK Query via `providesTags: ['EventCategories']`.
  const { data: categoriesResp } = useGetCategoriesQuery();

  // The search/list endpoints want a `category_id` (UUID), not a slug.
  const categorySlugToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoriesResp?.data ?? []) {
      map.set(c.slug, c.id);
    }
    return map;
  }, [categoriesResp]);

  const categoryOptions = useMemo(() => {
    const cats = categoriesResp?.data ?? [];
    return [
      { value: '', label: 'All Categories' },
      ...cats.map((c) => ({
        value: c.slug,
        label: c.display_name || c.name,
      })),
    ];
  }, [categoriesResp]);

  const resolvedCategoryId = filters.category
    ? categorySlugToId.get(filters.category)
    : undefined;

  // ---- Query 1: browse (list events) ----
  // Backend-driven: pagination, sort, category.
  // Skipped whenever we're in search mode.
  const browse = useListEventsQuery(
    {
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
      sort_by: 'start_date',
      sort_order: 'asc',
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
      ...scope,
    },
    { skip: !isBrowseMode },
  );

  // ---- Query 2: search (search events) ----
  // Backend-driven: q, category_id, pagination, team scope.
  // NOT backend-driven: format — see the client-side filter below.
  const search = useSearchEventsQuery(
    {
      q: debouncedQuery,
      page: 1,
      page_size: SEARCH_PAGE_SIZE,
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
      ...scope,
    },
    { skip: !isSearchMode || !isFocused },
  );

  // ---- Unified result shape ----
  // NOTE: the two endpoints wrap their arrays differently:
  //   listEvents   → BaseResponse<OffsetEvents>     → data.data.data
  //   searchEvents → BaseResponse<PaginatedEvents>  → data.data.data
  // Both collapse to Event[] with the same access pattern, but for
  // different structural reasons. Comment kept as a reminder.
  const results: Event[] = useMemo(() => {
    if (isSearchMode) {
      const searchResults = search.data?.data?.data ?? [];
      // While the search is in flight and has no results yet, keep
      // showing the browse results to avoid a "no results" flash.
      if (searchResults.length === 0 && search.isFetching) {
        return browse.data?.data?.data ?? [];
      }
      return searchResults;
    }
    return browse.data?.data?.data ?? [];
  }, [isSearchMode, search.data, search.isFetching, browse.data]);

  const isLoading = isSearchMode ? search.isFetching : browse.isFetching;
  const isError = isSearchMode ? search.isError : browse.isError;

  // ---- Format refinement (client-side only) ----
  // The backend has no `format` / `is_virtual` / `is_hybrid` param on
  // /events/search or /events. The text query and category ARE server-
  // side. If the backend adds a `format` param later, pass it through
  // as a query param and delete this block.
  const filteredResults = useMemo(() => {
    if (!filters.format) return results;
    return results.filter((e) => deriveFormat(e) === filters.format);
  }, [results, filters.format]);

  // ---- Derived UI state ----
  const hasResults = filteredResults.length > 0;
  // Full-panel spinner only on the very first load with no data yet.
  // Subsequent refetches show the tiny inline spinner in the header.
  const isInitialLoad = isLoading && !hasResults;
  const showDropdown = isFocused;

  // ---- Actions ----

  const executeSearch = () => {
    onSearch?.(query, filters);

    const params = new URLSearchParams();
    if (trimmedQuery) params.set('search', trimmedQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.format) params.set('format', filters.format);

    const qs = params.toString();
    router.push(qs ? `/events?${qs}` : '/events');
    setIsFocused(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResultClick = (event: Event) => {
    router.push(deriveHref(event));
    setQuery('');
    setIsFocused(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((p) =>
        p < filteredResults.length - 1 ? p + 1 : p,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
        handleResultClick(filteredResults[selectedIndex]);
      } else {
        executeSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const clearAll = () => {
    setQuery('');
    setFilters({ category: '', format: '' });
    setSelectedIndex(-1);
  };

  // ---- Effects ----

  // Close on outside click.
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Reset keyboard selection whenever the visible list changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(-1);
  }, [filteredResults.length, isSearchMode]);

  // ---- Render ----

  return (
    <div ref={searchRef} className="relative w-full">
      {/* ---------- Bar ---------- */}
      <div
        className={cn(
          'flex flex-col md:flex-row items-stretch bg-slate-100/90 hover:bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200/70 transition-all duration-200 gap-1 md:gap-0',
          isFocused &&
            'bg-white border-primary/40 ring-2 md:ring-4 ring-primary/10 shadow-sm',
        )}
      >
        {/* Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-3 md:left-3.5 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 pointer-events-none shrink-0" />
          <input
            id="search-input"
            type="text"
            autoFocus={autoFocus}
            placeholder={
              placeholder || 'Search events, workshops, webinars...'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsFocused(true)}
            className="w-full h-8 md:h-10 pl-8 md:pl-10 pr-8 md:pr-9 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-lg focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear text"
              className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          )}
        </div>

        {/* Filters + Submit */}
        <div
          className={cn(
            'items-center gap-1.5 pl-1 md:pl-2 justify-between md:justify-start border-t md:border-t-0 md:border-l border-slate-200/60',
            isFocused ? 'flex' : 'hidden md:flex',
          )}
        >
          {/* Category — options from GET /events/categories */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Tag className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {categoryOptions.map((cat) => (
                <option
                  key={cat.value}
                  value={cat.value}
                  className="text-slate-800 bg-white"
                >
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Format — client-side only (backend has no format param) */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Monitor className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {FORMATS.map((fmt) => (
                <option
                  key={fmt.value}
                  value={fmt.value}
                  className="text-slate-800 bg-white"
                >
                  {fmt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={executeSearch}
            aria-label="Execute Search"
            className="h-8 md:h-10 px-3.5 md:px-4 bg-primary-400 hover:bg-primary/90 text-white text-[11px] md:text-xs font-medium rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Search className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </button>
        </div>
      </div>

      {/* ---------- Dropdown ---------- */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl md:rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 max-h-[360px] md:max-h-[420px] overflow-y-auto divide-y divide-slate-100">
          {/* Initial load — full-panel spinner */}
          {isInitialLoad ? (
            <div className="p-8 md:p-12 text-center">
              <Loader2 className="h-6 w-6 md:h-7 md:w-7 text-primary animate-spin mx-auto" />
              <p className="text-xs md:text-sm text-slate-500 mt-3 font-medium">
                {isSearchMode ? 'Searching events…' : 'Loading events…'}
              </p>
            </div>
          ) : isError ? (
            /* Error state */
            <div className="p-6 md:p-8 text-center">
              <p className="text-xs md:text-sm text-red-600 font-medium">
                Couldn&apos;t load events. Try again.
              </p>
            </div>
          ) : hasResults ? (
            /* Results */
            <div>
              <div className="px-3 md:px-4 py-2 md:py-2.5 bg-slate-50/90 backdrop-blur-sm sticky top-0 flex items-center justify-between border-b border-slate-100 z-10">
                <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isSearchMode ? 'Matching Events' : 'Upcoming Events'}
                </span>
                {/* Inline spinner — shows on refetch, avoids flicker */}
                {isLoading && (
                  <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />
                )}
              </div>

              <div className="py-1">
                {filteredResults.map((event, index) => {
                  const fmt = deriveFormat(event);
                  const priceInfo = derivePriceInfo(event);
                  const title = deriveTitle(event);
                  const host = deriveHost(event);
                  const dateLabel = deriveDateLabel(event.start_date);
                  const image = deriveImage(event);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleResultClick(event)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full px-3 md:px-4 py-2.5 md:py-3 text-left transition-all flex items-center gap-3 cursor-pointer group',
                        selectedIndex === index
                          ? 'bg-slate-100/70'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      {/* Image (falls back to colored initial tile) */}
                      <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/70">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(ev) => {
                              // Media can 404 after deletion or a CDN
                              // miss — hide the img and reveal the
                              // sibling placeholder tile.
                              const el = ev.currentTarget;
                              el.style.display = 'none';
                              const sib = el.nextElementSibling as
                                | HTMLElement
                                | null;
                              if (sib) sib.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full items-center justify-center text-white font-semibold text-sm md:text-base"
                          style={{
                            display: image ? 'none' : 'flex',
                            backgroundColor: placeholderColor(
                              event.id || event.slug,
                            ),
                          }}
                          aria-hidden="true"
                        >
                          {initialOf(title)}
                        </div>
                      </div>

                      {/* Text block */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                          {title}
                        </p>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 text-[11px] md:text-xs text-slate-500 flex-wrap">
                          {event.event_type?.display_name && (
                            <>
                              <span className="font-medium text-slate-600">
                                {event.event_type.display_name}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="truncate max-w-[10rem]">
                            {host}
                          </span>
                          {dateLabel && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {dateLabel}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize px-1.5 py-0.5 bg-slate-200/60 text-slate-700 rounded text-[9px] md:text-[10px] font-medium">
                            {fmt}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <span
                          className={cn(
                            'text-xs md:text-sm font-bold block',
                            priceInfo.kind === 'free'
                              ? 'text-emerald-600'
                              : priceInfo.kind === 'tbd'
                                ? 'text-slate-400'
                                : 'text-primary',
                          )}
                        >
                          {formatPrice(priceInfo)}
                        </span>
                        {priceInfo.kind === 'from' && (
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-medium">
                            from
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 md:p-2 bg-slate-50 border-t border-slate-100 sticky bottom-0">
                <Link
                  href={`/events?search=${encodeURIComponent(
                    trimmedQuery,
                  )}${filters.category ? `&category=${filters.category}` : ''}${
                    filters.format ? `&format=${filters.format}` : ''
                  }`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 md:py-2 px-3 text-[11px] md:text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg md:rounded-xl transition-colors cursor-pointer"
                >
                  View all results
                  <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="p-6 md:p-8 text-center">
              <p className="text-slate-600 font-medium text-xs md:text-sm">
                {isSearchMode
                  ? 'No matching events found'
                  : 'No events available yet'}
              </p>
              <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                {isSearchMode
                  ? 'Try adjusting your filters or keyword'
                  : 'Check back later for upcoming events'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}