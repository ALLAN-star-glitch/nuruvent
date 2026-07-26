'use client';

import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Categories', icon: LayoutGrid },
  { id: 'workshop', label: 'Workshops', icon: BookOpen },
  { id: 'webinar', label: 'Webinars', icon: Monitor },
  { id: 'bootcamp', label: 'Bootcamps', icon: GraduationCap },
  { id: 'meetup', label: 'Meetups', icon: Users },
  { id: 'training', label: 'Training Institutes', icon: Building2 },
  { id: 'professional', label: 'Professional Bodies', icon: Briefcase },
  { id: 'ngo', label: 'NGOs', icon: Globe },
];

const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free' },
  { id: '1-5k', label: 'KES 1,000 - 5,000' },
  { id: '5-10k', label: 'KES 5,000 - 10,000' },
  { id: '10k+', label: 'KES 10,000+' },
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
  onPriceChange?: (price: string) => void;
  onDateChange?: (date: string) => void;
}

export function CategoryFilter({ 
  onCategoryChange, 
  onPriceChange, 
  onDateChange 
}: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id);
    onCategoryChange?.(id);
  };

  const handlePriceClick = (id: string) => {
    setSelectedPrice(id);
    onPriceChange?.(id);
  };

  const handleDateClick = (id: string) => {
    setSelectedDate(id);
    onDateChange?.(id);
  };

  const getSelectedLabel = () => {
    if (selectedCategory !== 'all') {
      return categories.find(c => c.id === selectedCategory)?.label;
    }
    return 'All Categories';
  };

  return (
    <>
      {/* Mobile Floating Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-30 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
      >
        <Filter className="h-5 w-5" />
        <span className="text-sm font-medium">{getSelectedLabel()}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer - Slides up from bottom */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 lg:hidden
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        max-h-[80vh] overflow-hidden
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 pb-24" style={{ maxHeight: 'calc(80vh - 70px)' }}>
          {/* Categories - Mobile */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryClick(category.id);
                      setIsMobileOpen(false);
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range - Mobile */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              {priceRanges.map((range) => {
                const isActive = selectedPrice === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => {
                      handlePriceClick(range.id);
                      setIsMobileOpen(false);
                    }}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm transition-colors text-left
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

          {/* Date - Mobile */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Date</h4>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'Today', 'This Week', 'This Month'].map((date) => {
                const id = date.toLowerCase().replace(' ', '-');
                const isActive = selectedDate === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      handleDateClick(id);
                      setIsMobileOpen(false);
                    }}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Filter - Sticky with scroll */}
      <div className="hidden lg:block sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Categories - Desktop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Price Range - Desktop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-1">
              {priceRanges.map((range) => {
                const isActive = selectedPrice === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => handlePriceClick(range.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
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

          <div className="border-t border-gray-200" />

          {/* Date - Desktop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Date</h3>
            <div className="space-y-1">
              {['All', 'Today', 'This Week', 'This Month'].map((date) => {
                const id = date.toLowerCase().replace(' ', '-');
                const isActive = selectedDate === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleDateClick(id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {date}
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