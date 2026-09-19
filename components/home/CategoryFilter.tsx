/* eslint-disable react-hooks/set-state-in-effect */
// components/home/CategoryFilter.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Filter,
  Globe,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Monitor,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import type { EventSortBy } from '@/lib/types/events';

// ============================================================
// ICON MAPPING
// ============================================================

function getCategoryIcon(slug: string | undefined) {
  const s = (slug ?? '').toLowerCase();
  if (s.includes('workshop')) return <BookOpen className="h-4 w-4" />;
  if (s.includes('webinar')) return <Monitor className="h-4 w-4" />;
  if (s.includes('bootcamp')) return <GraduationCap className="h-4 w-4" />;
  if (s.includes('meetup')) return <Users className="h-4 w-4" />;
  if (s.includes('conference')) return <Users className="h-4 w-4" />;
  if (s.includes('training')) return <Building2 className="h-4 w-4" />;
  if (s.includes('professional')) return <Briefcase className="h-4 w-4" />;
  if (s.includes('ngo')) return <Globe className="h-4 w-4" />;
  if (s.includes('seminar')) return <BookOpen className="h-4 w-4" />;
  if (s.includes('networking')) return <Users className="h-4 w-4" />;
  return <LayoutGrid className="h-4 w-4" />;
}

// ============================================================
// SORT OPTIONS
// ============================================================

interface SortOption {
  id: string;
  label: string;
  sortBy: EventSortBy;
  sortOrder: 'asc' | 'desc';
}

const SORT_OPTIONS: SortOption[] = [
  {
    id: 'date',
    label: 'Newest first',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  {
    id: 'date-asc',
    label: 'Start date (earliest)',
    sortBy: 'start_date',
    sortOrder: 'asc',
  },
  {
    id: 'name',
    label: 'Name (A–Z)',
    sortBy: 'name',
    sortOrder: 'asc',
  },
];

const DEFAULT_SORT_ID = 'date';

// ============================================================
// PROPS
// ============================================================

interface CategoryFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  category: string;
  sort: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function CategoryFilter({ onFilterChange }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const { data: typesResponse, isLoading } = useGetEventTypesQuery();
  const eventTypes = typesResponse?.data ?? [];

  const typeFilter = searchParams.get('type') || '';
  const sortFilter = searchParams.get('sort') || DEFAULT_SORT_ID;

  const [selectedCategory, setSelectedCategory] = useState(typeFilter);
  const [selectedSort, setSelectedSort] = useState(sortFilter);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(typeFilter);
    setSelectedSort(sortFilter);
  }, [typeFilter, sortFilter]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const replaceUrl = (updates: { type?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.type !== undefined) {
      if (updates.type) params.set('type', updates.type);
      else params.delete('type');
    }

    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== DEFAULT_SORT_ID) {
        params.set('sort', updates.sort);
      } else {
        params.delete('sort');
      }
    }

    const queryString = params.toString();
    router.replace(`/events${queryString ? `?${queryString}` : ''}`);
  };

  const handleCategoryClick = (id: string) => {
    const newCategory = selectedCategory === id ? '' : id;
    setSelectedCategory(newCategory);
    replaceUrl({ type: newCategory });
    onFilterChange?.({
      category: newCategory,
      sort: selectedSort,
    });
  };

  const handleSortClick = (id: string) => {
    setSelectedSort(id);
    replaceUrl({ sort: id });
    onFilterChange?.({
      category: selectedCategory,
      sort: id,
    });
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedSort(DEFAULT_SORT_ID);
    router.replace('/events');
    onFilterChange?.({ category: '', sort: DEFAULT_SORT_ID });
    setIsMobileOpen(false);
  };

  const getSelectedLabel = () => {
    if (selectedCategory) {
      const found = eventTypes.find((c) => c.id === selectedCategory);
      return found?.display_name || found?.name || 'Category';
    }
    return 'All Events';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedSort !== DEFAULT_SORT_ID) count++;
    return count;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading filters...</span>
      </div>
    );
  }

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* ---- Mobile floating button ---- */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-30 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 cursor-pointer"
      >
        <Filter className="h-5 w-5" />
        <span className="text-sm font-medium">{getSelectedLabel()}</span>
        {activeFilterCount > 0 && (
          <span className="bg-background text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ---- Mobile overlay ---- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ---- Mobile drawer ---- */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 bg-background text-foreground rounded-t-3xl shadow-2xl z-50 lg:hidden
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[85vh] overflow-hidden
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="overflow-y-auto p-4 pb-28"
          style={{ maxHeight: 'calc(85vh - 70px)' }}
        >
          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCategoryClick('')}
                className={`
                  px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer
                  ${
                    !selectedCategory
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                  }
                `}
              >
                All Categories
              </button>
              {eventTypes.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                      {getCategoryIcon(category.slug)}
                    </span>
                    <span className="truncate">
                      {category.display_name || category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Sort */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Sort By
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => {
                const isActive = selectedSort === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSortClick(option.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                      }
                    `}
                  >
                    <Calendar
                      className={`h-4 w-4 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex-1 cursor-pointer"
          >
            Clear All
          </Button>
          <Button
            onClick={() => setIsMobileOpen(false)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            View Results
          </Button>
        </div>
      </div>

      {/* ---- Desktop sidebar ---- */}
      <div className="hidden lg:block sticky top-50 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:text-primary-700 font-medium transition-colors cursor-pointer"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick('')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                  ${
                    !selectedCategory
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
              >
                <LayoutGrid
                  className={`h-4 w-4 ${
                    !selectedCategory ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                All Categories
              </button>
              {eventTypes.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }
                    `}
                  >
                    <span
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    >
                      {getCategoryIcon(category.slug)}
                    </span>
                    <span className="truncate">
                      {category.display_name || category.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-primary text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Sort */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Sort By
            </h4>
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => {
                const isActive = selectedSort === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSortClick(option.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }
                    `}
                  >
                    <Calendar
                      className={`h-4 w-4 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}