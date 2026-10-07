'use client';

import {
  ArrowDown,
  ArrowUp,
  Filter,
  Grid3x3,
  List,
  Loader2,
  Search,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { SortField, SortDirection, ViewMode } from './types';

const TABS = ['all', 'live', 'upcoming', 'draft', 'ended'] as const;

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Title' },
  { value: 'eventDate', label: 'Event Date' },
  { value: 'addedDate', label: 'Added Date' },
  { value: 'current_attendees', label: 'Registrations' },
  { value: 'price', label: 'Price' },
  { value: 'status', label: 'Status' },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;

  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;

  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;

  sortDirection: SortDirection;
  onToggleSortDirection: () => void;

  count: number;
  isFetching: boolean;

  onReset: () => void;

  /** Optional slot rendered below the filter row (e.g., bulk actions bar) */
  bulkActions?: React.ReactNode;
}

export function EventsFilterBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onToggleSortDirection,
  count,
  isFetching,
  onReset,
  bulkActions,
}: Props) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Row 1 — tabs + search */}
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 md:w-auto md:pb-0">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full cursor-text pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2 — view / sort / count / reset */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-3 sm:flex-row">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => onViewModeChange('table')}
                  className={`cursor-pointer rounded-md p-1.5 transition-colors ${
                    viewMode === 'table'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Table view"
                  aria-label="Table view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  className={`cursor-pointer rounded-md p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>

              <span className="hidden text-xs text-muted-foreground sm:inline">
                |
              </span>

              {/* Sort */}
              <div className="flex items-center gap-1">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Sort by:
                </span>
                <Select
                  value={sortField}
                  onValueChange={(v) => onSortFieldChange(v as SortField)}
                >
                  <SelectTrigger className="h-8 w-[130px] cursor-pointer border-0 bg-transparent text-xs focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="cursor-pointer text-sm"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  onClick={onToggleSortDirection}
                  className="cursor-pointer rounded-md p-1 transition-colors hover:bg-accent"
                  title={
                    sortDirection === 'asc'
                      ? 'Sort descending'
                      : 'Sort ascending'
                  }
                  aria-label={
                    sortDirection === 'asc'
                      ? 'Sort descending'
                      : 'Sort ascending'
                  }
                >
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {isFetching && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {count} event{count !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 cursor-pointer text-xs"
                onClick={onReset}
              >
                <Filter className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk actions slot */}
        {bulkActions}
      </CardContent>
    </Card>
  );
}