// components/home/CategoryFilter.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutGrid, 
  BookOpen, 
  Monitor, 
  GraduationCap, 
  Users, 
  Building2, 
  Briefcase, 
  Globe,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

// Map event type slug to icon
const getCategoryIcon = (slug: string) => {
  const normalized = slug?.toLowerCase() || '';
  
  if (normalized.includes('workshop')) return <BookOpen className="h-4 w-4" />;
  if (normalized.includes('webinar')) return <Monitor className="h-4 w-4" />;
  if (normalized.includes('bootcamp')) return <GraduationCap className="h-4 w-4" />;
  if (normalized.includes('meetup')) return <Users className="h-4 w-4" />;
  if (normalized.includes('conference')) return <Users className="h-4 w-4" />;
  if (normalized.includes('training')) return <Building2 className="h-4 w-4" />;
  if (normalized.includes('professional')) return <Briefcase className="h-4 w-4" />;
  if (normalized.includes('ngo')) return <Globe className="h-4 w-4" />;
  if (normalized.includes('seminar')) return <BookOpen className="h-4 w-4" />;
  if (normalized.includes('networking')) return <Users className="h-4 w-4" />;
  
  return <LayoutGrid className="h-4 w-4" />;
};

// Price range options - Will be used for display only
const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free' },
  { id: '1-5k', label: 'KES 1,000 - 5,000' },
  { id: '5-10k', label: 'KES 5,000 - 10,000' },
  { id: '10-20k', label: 'KES 10,000 - 20,000' },
  { id: '20k+', label: 'KES 20,000+' },
];

// Date options
const dateOptions = [
  { id: 'all', label: 'All Dates' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'upcoming', label: 'Upcoming' },
];

// Sort options
const sortOptions = [
  { id: 'date', label: 'Date: Newest', icon: Calendar },
  { id: 'date-asc', label: 'Date: Oldest', icon: Calendar },
  { id: 'price-low', label: 'Price: Low to High', icon: TrendingUp },
  { id: 'price-high', label: 'Price: High to Low', icon: TrendingDown },
  { id: 'popular', label: 'Most Popular', icon: Zap },
];

interface CategoryFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  category: string;
  price: string;
  date: string;
  sort: string;
}

export function CategoryFilter({ onFilterChange }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const { data: eventTypes, isLoading } = useGetEventTypesQuery();
  
  // Get filters from URL
  const typeFilter = searchParams.get('type') || '';
  const priceFilter = searchParams.get('price') || 'all';
  const dateFilter = searchParams.get('date') || 'all';
  const sortFilter = searchParams.get('sort') || 'date';
  
  const [selectedCategory, setSelectedCategory] = useState(typeFilter);
  const [selectedPrice, setSelectedPrice] = useState(priceFilter);
  const [selectedDate, setSelectedDate] = useState(dateFilter);
  const [selectedSort, setSelectedSort] = useState(sortFilter);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Update state when URL changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(typeFilter);
    setSelectedPrice(priceFilter);
    setSelectedDate(dateFilter);
    setSelectedSort(sortFilter);
  }, [typeFilter, priceFilter, dateFilter, sortFilter]);

  // Scroll lock for mobile when filter is open
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

  // ✅ Immediate filter update - no apply button needed
  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('type', selectedCategory);
    if (selectedPrice !== 'all') params.set('price', selectedPrice);
    if (selectedDate !== 'all') params.set('date', selectedDate);
    if (selectedSort !== 'date') params.set('sort', selectedSort);
    
    const queryString = params.toString();
    router.replace(`/events${queryString ? `?${queryString}` : ''}`);
    
    onFilterChange?.({
      category: selectedCategory,
      price: selectedPrice,
      date: selectedDate,
      sort: selectedSort,
    });
  };

  // ✅ Handle category click with immediate filter
  const handleCategoryClick = (id: string) => {
    const newCategory = selectedCategory === id ? '' : id;
    setSelectedCategory(newCategory);
    // Update URL immediately
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set('type', newCategory);
    } else {
      params.delete('type');
    }
    router.replace(`/events?${params.toString()}`);
    onFilterChange?.({
      category: newCategory,
      price: selectedPrice,
      date: selectedDate,
      sort: selectedSort,
    });
  };

  // ✅ Handle price click with immediate filter
  const handlePriceClick = (id: string) => {
    const newPrice = selectedPrice === id ? 'all' : id;
    setSelectedPrice(newPrice);
    const params = new URLSearchParams(searchParams.toString());
    if (newPrice !== 'all') {
      params.set('price', newPrice);
    } else {
      params.delete('price');
    }
    router.replace(`/events?${params.toString()}`);
    onFilterChange?.({
      category: selectedCategory,
      price: newPrice,
      date: selectedDate,
      sort: selectedSort,
    });
  };

  // ✅ Handle date click with immediate filter
  const handleDateClick = (id: string) => {
    const newDate = selectedDate === id ? 'all' : id;
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    if (newDate !== 'all') {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    router.replace(`/events?${params.toString()}`);
    onFilterChange?.({
      category: selectedCategory,
      price: selectedPrice,
      date: newDate,
      sort: selectedSort,
    });
  };

  // ✅ Handle sort click with immediate filter
  const handleSortClick = (id: string) => {
    const newSort = selectedSort === id ? 'date' : id;
    setSelectedSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'date') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    router.replace(`/events?${params.toString()}`);
    onFilterChange?.({
      category: selectedCategory,
      price: selectedPrice,
      date: selectedDate,
      sort: newSort,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedPrice('all');
    setSelectedDate('all');
    setSelectedSort('date');
    router.replace('/events');
    onFilterChange?.({
      category: '',
      price: 'all',
      date: 'all',
      sort: 'date',
    });
    setIsMobileOpen(false);
  };

  const getSelectedLabel = () => {
    if (selectedCategory && eventTypes) {
      const found = eventTypes.find(c => c.id === selectedCategory);
      return found?.display_name || found?.name || 'Category';
    }
    return 'All Events';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedPrice !== 'all') count++;
    if (selectedDate !== 'all') count++;
    if (selectedSort !== 'date') count++;
    return count;
  };

  // Scroll categories horizontally
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = categoriesRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      categoriesRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading filters...</span>
      </div>
    );
  }

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile Floating Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-30 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 cursor-pointer"
      >
        <Filter className="h-5 w-5" />
        <span className="text-sm font-medium">{getSelectedLabel()}</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 lg:hidden
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        max-h-[85vh] overflow-hidden
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 pb-28" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCategoryClick('')}
                className={`
                  px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer
                  ${!selectedCategory 
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                  }
                `}
              >
                All Categories
              </button>
              {eventTypes?.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-primary' : 'text-gray-400'}>
                      {Icon}
                    </span>
                    <span className="truncate">{category.display_name || category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              Price Range
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {priceRanges.map((range) => {
                const isActive = selectedPrice === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => handlePriceClick(range.id)}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Date */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Date
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {dateOptions.map((date) => {
                const isActive = selectedDate === date.id;
                return (
                  <button
                    key={date.id}
                    onClick={() => handleDateClick(date.id)}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    {date.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Sort */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              Sort By
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((sort) => {
                const Icon = sort.icon;
                const isActive = selectedSort === sort.id;
                return (
                  <button
                    key={sort.id}
                    onClick={() => handleSortClick(sort.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {sort.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex-1 cursor-pointer"
          >
            Clear All
          </Button>
          <Button
            onClick={() => setIsMobileOpen(false)}
            className="flex-1 bg-primary hover:bg-primary-600 text-white cursor-pointer"
          >
            View Results
          </Button>
        </div>
      </div>

      {/* Desktop Filter */}
      <div className="hidden lg:block sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
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
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick('')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                  ${!selectedCategory 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <LayoutGrid className={`h-4 w-4 ${!selectedCategory ? 'text-primary' : 'text-gray-400'}`} />
                All Categories
              </button>
              {eventTypes?.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-primary' : 'text-gray-400'}>
                      {Icon}
                    </span>
                    <span className="truncate">{category.display_name || category.name}</span>
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

          <div className="border-t border-gray-100 my-4" />

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              Price Range
            </h4>
            <div className="space-y-1">
              {priceRanges.map((range) => {
                const isActive = selectedPrice === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => handlePriceClick(range.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Date */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Date
            </h4>
            <div className="space-y-1">
              {dateOptions.map((date) => {
                const isActive = selectedDate === date.id;
                return (
                  <button
                    key={date.id}
                    onClick={() => handleDateClick(date.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {date.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Sort */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Sort By
            </h4>
            <div className="space-y-1">
              {sortOptions.map((sort) => {
                const Icon = sort.icon;
                const isActive = selectedSort === sort.id;
                return (
                  <button
                    key={sort.id}
                    onClick={() => handleSortClick(sort.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {sort.label}
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