'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  price: number;
  date: string;
  host: string;
}

interface SearchBarProps {
  placeholder?: string;
}

// Mock data - will be replaced with API calls
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Data Science with Python Workshop',
    type: 'workshop',
    price: 2000,
    date: 'Tomorrow 10AM',
    host: 'eMobilis Training Institute',
  },
  {
    id: '2',
    title: 'Financial Literacy Webinar',
    type: 'webinar',
    price: 1000,
    date: 'In 2 days',
    host: 'ICPAK',
  },
  {
    id: '3',
    title: 'UI/UX Design Bootcamp',
    type: 'bootcamp',
    price: 8000,
    date: 'Next week',
    host: 'DevSchool',
  },
  {
    id: '4',
    title: 'Nairobi Tech Meetup',
    type: 'meetup',
    price: 500,
    date: 'This Saturday',
    host: 'Tech Community Nairobi',
  },
];

export function SearchBar({ placeholder }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length > 1) {
      setIsLoading(true);
      setTimeout(() => {
        const filtered = mockResults.filter((item) =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
      }, 300);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/events/${result.id}`);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim().length > 0) {
      e.preventDefault();
      setIsFocused(false);
      router.push(`/events?search=${encodeURIComponent(query.trim())}`);
    }
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

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          id="search-input"
          type="text"
          placeholder={placeholder || 'Search for training events, workshops, webinars... (Ctrl+K)'}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && (query.trim().length > 1 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </span>
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{result.type}</span>
                      <span>•</span>
                      <span>{result.host}</span>
                      <span>•</span>
                      <span>{result.date}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-primary">
                    KES {result.price.toLocaleString()}
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <Link
                  href={`/events?search=${encodeURIComponent(query.trim())}`}
                  className="text-sm text-primary hover:text-primary/80 font-medium inline-block"
                  onClick={() => setIsFocused(false)}
                >
                  View all results →
                </Link>
              </div>
            </div>
          ) : query.trim().length > 1 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No events found for &quot;{query}&quot;</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}