'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown, Calendar, Tag, Monitor, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  price: number;
  date: string;
  host: string;
  format?: 'virtual' | 'in-person' | 'hybrid';
  category?: string;
}

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  category: string;
  format: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Data Science with Python Workshop',
    type: 'workshop',
    price: 2000,
    date: 'Tomorrow 10AM',
    host: 'eMobilis Training Institute',
    format: 'virtual',
    category: 'workshops',
  },
  {
    id: '2',
    title: 'Financial Literacy Webinar',
    type: 'webinar',
    price: 1000,
    date: 'In 2 days',
    host: 'ICPAK',
    format: 'virtual',
    category: 'webinars',
  },
  {
    id: '3',
    title: 'UI/UX Design Bootcamp',
    type: 'bootcamp',
    price: 8000,
    date: 'Next week',
    host: 'DevSchool',
    format: 'in-person',
    category: 'bootcamps',
  },
  {
    id: '4',
    title: 'Nairobi Tech Meetup',
    type: 'meetup',
    price: 500,
    date: 'This Saturday',
    host: 'Tech Community Nairobi',
    format: 'in-person',
    category: 'meetups',
  },
];

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'webinars', label: 'Webinars' },
  { value: 'bootcamps', label: 'Bootcamps' },
  { value: 'meetups', label: 'Meetups' },
  { value: 'conferences', label: 'Conferences' },
  { value: 'training', label: 'Training' },
];

const formats = [
  { value: '', label: 'All Formats' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
];

export function SearchBar({ placeholder, autoFocus, onSearch }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    format: '',
  });
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = mockResults.filter((item) => {
    const trimmed = query.trim().toLowerCase();
    const matchesQuery = !trimmed || item.title.toLowerCase().includes(trimmed);
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesFormat = !filters.format || item.format === filters.format;
    return matchesQuery && matchesCategory && matchesFormat;
  });

  const executeSearch = () => {
    if (onSearch) {
      onSearch(query, filters);
    }

    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (filters.category) params.set('category', filters.category);
    if (filters.format) params.set('format', filters.format);

    const queryString = params.toString();
    router.push(queryString ? `/events?${queryString}` : '/events');
    setIsFocused(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/events/${result.id}`);
    setQuery('');
    setIsFocused(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
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
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Bar Wrapper - removed padding */}
      <div
        className={cn(
          "flex flex-col md:flex-row items-stretch bg-slate-100/90 hover:bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200/70 transition-all duration-200 gap-1 md:gap-0",
          isFocused && "bg-white border-primary/40 ring-2 md:ring-4 ring-primary/10 shadow-sm"
        )}
      >
        {/* Main Input Field - adjusted padding */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-3 md:left-3.5 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 pointer-events-none shrink-0" />
          <input
            id="search-input"
            type="text"
            autoFocus={autoFocus}
            placeholder={placeholder || 'Search events, workshops, webinars...'}
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

        {/* Filter Dropdowns & Execute Button - removed padding */}
        <div
          className={cn(
            "items-center gap-1.5 pl-1 md:pl-2 justify-between md:justify-start border-t md:border-t-0 md:border-l border-slate-200/60",
            isFocused ? "flex" : "hidden md:flex"
          )}
        >
          {/* Category Dropdown */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Tag className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-slate-800 bg-white">
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-0.5" />
          </div>

          {/* Format Dropdown */}
          <div className="relative flex-1 md:flex-none flex items-center cursor-pointer group">
            <Monitor className="absolute left-2 md:left-2.5 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
            <select
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="w-full md:w-auto h-8 md:h-10 pl-7 md:pl-8 pr-6 md:pr-7 text-[11px] md:text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value} className="text-slate-800 bg-white">
                  {fmt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 md:right-2 h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-0.5" />
          </div>

          {/* Search Button */}
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

      {/* Live Search Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl md:rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 max-h-[360px] md:max-h-[420px] overflow-y-auto divide-y divide-slate-100">
          {filteredResults.length > 0 ? (
            <div>
              <div className="px-3 md:px-4 py-2 md:py-2.5 bg-slate-50/90 backdrop-blur-sm sticky top-0 flex items-center justify-between border-b border-slate-100 z-10">
                <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Matching Events
                </span>
              </div>

              <div className="py-1">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-3 md:px-4 py-2.5 md:py-3 text-left transition-all flex items-start gap-2.5 md:gap-3 cursor-pointer group",
                      selectedIndex === index ? "bg-slate-100/70" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 text-[11px] md:text-xs text-slate-500 flex-wrap">
                        <span className="font-medium text-slate-600 capitalize">{result.type}</span>
                        <span>•</span>
                        <span>{result.host}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {result.date}
                        </span>
                        {result.format && (
                          <>
                            <span>•</span>
                            <span className="capitalize px-1.5 py-0.5 bg-slate-200/60 text-slate-700 rounded text-[9px] md:text-[10px] font-medium">
                              {result.format}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs md:text-sm font-bold text-primary block">
                        KES {result.price.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Footer */}
              <div className="p-1.5 md:p-2 bg-slate-50 border-t border-slate-100 sticky bottom-0">
                <Link
                  href={`/events?search=${encodeURIComponent(query.trim())}${filters.category ? `&category=${filters.category}` : ''}${filters.format ? `&format=${filters.format}` : ''}`}
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
              <p className="text-slate-600 font-medium text-xs md:text-sm">No matching events found</p>
              <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">Try adjusting your filters or keyword</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}