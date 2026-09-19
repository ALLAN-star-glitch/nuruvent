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
  scope?: Pick<SearchEventsParams, 'team_id' | 'team_type'>;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  category: string;
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

const PLACEHOLDER_COLORS = [
  '#8B5CF6',
  '#6366F1',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
];

// ============================================================
// HOOKS
// ============================================================

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

function deriveFormat(e: Event): 'virtual' | 'in-person' | 'hybrid' {
  if (e.is_hybrid) return 'hybrid';
  if (e.is_virtual) return 'virtual';
  return 'in-person';
}

function derivePriceInfo(e: Event): PriceInfo {
  if (e.is_free) return { kind: 'free' };

  const prices = (e.tickets ?? [])
    .filter((t) => t.is_active !== false)
    .map((t) => t.price)
    .filter((p): p is number => typeof p === 'number' && p > 0);

  if (prices.length === 0) return { kind: 'tbd' };

  return { kind: 'from', amount: Math.min(...prices), currency: CURRENCY };
}

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

function deriveTitle(e: Event): string {
  return e.display_name || e.name;
}

function deriveHost(e: Event): string {
  return e.organizer?.display_name || e.organizer?.name || 'Unknown host';
}

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

function deriveHref(e: Event): string {
  return `/events/${e.slug || e.id}`;
}

function deriveImage(e: Event): string | null {
  return e.image_url || null;
}

function placeholderColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

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

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    format: '',
  });

  const searchRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounced(trimmedQuery, DEBOUNCE_MS);

  const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const isBrowseMode = isFocused && !isSearchMode;

  const { data: categoriesResp } = useGetCategoriesQuery();

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

  const results: Event[] = useMemo(() => {
    if (isSearchMode) {
      const searchResults = search.data?.data?.data ?? [];
      if (searchResults.length === 0 && search.isFetching) {
        return browse.data?.data?.data ?? [];
      }
      return searchResults;
    }
    return browse.data?.data?.data ?? [];
  }, [isSearchMode, search.data, search.isFetching, browse.data]);

  const isLoading = isSearchMode ? search.isFetching : browse.isFetching;
  const isError = isSearchMode ? search.isError : browse.isError;

  // Format refinement (client-side only) — backend has no format param.
  const filteredResults = useMemo(() => {
    if (!filters.format) return results;
    return results.filter((e) => deriveFormat(e) === filters.format);
  }, [results, filters.format]);

  const hasResults = filteredResults.length > 0;
  const isInitialLoad = isLoading && !hasResults;
  const showDropdown = isFocused;

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(-1);
  }, [filteredResults.length, isSearchMode]);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* ---------- Bar ---------- */}
      <div
        className={cn(
          'flex flex-col md:flex-row items-stretch bg-muted/60 hover:bg-muted rounded-xl md:rounded-2xl border border-border transition-all duration-200 gap-1 md:gap-0',
          isFocused &&
            'bg-background border-primary/40 ring-2 md:ring-4 ring-primary/10 shadow-sm',
        )}
      >
        {/* Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-3 md:left-3.5 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground pointer-events-none shrink-0" />
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
            className="w-full h-8 md:h-10 pl-8 md:pl-10 pr-8 md:pr-9 text-xs md:text-sm text-foreground placeholder:text-muted-foreground bg-transparent rounded-lg focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear text"
              className="absolute right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          )}
        </div>

        {/* Filters + Submit */}
        <div
          className={cn(
            'items-center gap-1.5 pl-1 md:pl-2 justify-between md:justify-start border-t md:border-t-0 md:border-l border-border',
            isFocused ? 'flex' : 'hidden md:flex',
          )}
        >
          {/* Category */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Tag className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {categoryOptions.map((cat) => (
                <option
                  key={cat.value}
                  value={cat.value}
                  className="bg-popover text-popover-foreground"
                >
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Format */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Monitor className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {FORMATS.map((fmt) => (
                <option
                  key={fmt.value}
                  value={fmt.value}
                  className="bg-popover text-popover-foreground"
                >
                  {fmt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={executeSearch}
            aria-label="Execute Search"
            className="h-8 md:h-10 px-3.5 md:px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] md:text-xs font-medium rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Search className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </button>
        </div>
      </div>

      {/* ---------- Dropdown ---------- */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-xl md:rounded-2xl shadow-xl border border-border overflow-hidden z-50 max-h-[360px] md:max-h-[420px] overflow-y-auto divide-y divide-border">
          {isInitialLoad ? (
            <div className="p-8 md:p-12 text-center">
              <Loader2 className="h-6 w-6 md:h-7 md:w-7 text-primary animate-spin mx-auto" />
              <p className="text-xs md:text-sm text-muted-foreground mt-3 font-medium">
                {isSearchMode ? 'Searching events…' : 'Loading events…'}
              </p>
            </div>
          ) : isError ? (
            <div className="p-6 md:p-8 text-center">
              <p className="text-xs md:text-sm text-destructive font-medium">
                Couldn&apos;t load events. Try again.
              </p>
            </div>
          ) : hasResults ? (
            <div>
              <div className="px-3 md:px-4 py-2 md:py-2.5 bg-muted/60 backdrop-blur-sm sticky top-0 flex items-center justify-between border-b border-border z-10">
                <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {isSearchMode ? 'Matching Events' : 'Upcoming Events'}
                </span>
                {isLoading && (
                  <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
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
                          ? 'bg-accent'
                          : 'hover:bg-accent/60',
                      )}
                    >
                      {/* Image */}
                      <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-muted ring-1 ring-border">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(ev) => {
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

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {title}
                        </p>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 text-[11px] md:text-xs text-muted-foreground flex-wrap">
                          {event.event_type?.display_name && (
                            <>
                              <span className="font-medium text-foreground">
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
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {dateLabel}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[9px] md:text-[10px] font-medium">
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
                              ? 'text-tertiary'
                              : priceInfo.kind === 'tbd'
                                ? 'text-muted-foreground'
                                : 'text-primary',
                          )}
                        >
                          {formatPrice(priceInfo)}
                        </span>
                        {priceInfo.kind === 'from' && (
                          <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                            from
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 md:p-2 bg-muted/60 border-t border-border sticky bottom-0">
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
            <div className="p-6 md:p-8 text-center">
              <p className="text-foreground font-medium text-xs md:text-sm">
                {isSearchMode
                  ? 'No matching events found'
                  : 'No events available yet'}
              </p>
              <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
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