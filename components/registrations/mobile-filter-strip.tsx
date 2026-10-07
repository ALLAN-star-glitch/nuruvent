'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFilterStripProps {
  searchValue: string;
  onSearchClick: () => void;
  filterCount: number;
  onFilterClick: () => void;
  sortLabel: string;
  sortDirection: 'asc' | 'desc';
  onSortClick: () => void;
  bottomOffset?: number;
  className?: string;
}

export function MobileFilterStrip({
  searchValue,
  onSearchClick,
  filterCount,
  onFilterClick,
  sortLabel,
  sortDirection,
  onSortClick,
  bottomOffset = 40,
  className,
}: MobileFilterStripProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 z-40 px-4 pointer-events-none md:hidden',
        className,
      )}
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)`,
      }}
    >
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="rounded-full border border-border/70 bg-background/85 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/40">
          <div className="flex items-center justify-between gap-1 px-2.5 py-1.5">
            <button
              type="button"
              onClick={onSearchClick}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-muted/70 cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span
                className={cn(
                  'truncate text-sm',
                  searchValue ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {searchValue || 'Search'}
              </span>
            </button>

            <div className="h-5 w-px shrink-0 bg-border/70" />

            <button
              type="button"
              onClick={onFilterClick}
              className="relative flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-muted/70 cursor-pointer"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Filters</span>
              {filterCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {filterCount}
                </span>
              )}
            </button>

            <div className="h-5 w-px shrink-0 bg-border/70" />

            <button
              type="button"
              onClick={onSortClick}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-muted/70 cursor-pointer"
            >
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[64px] truncate text-sm text-foreground">
                {sortLabel}
              </span>
              {sortDirection === 'asc' ? (
                <ArrowUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}