// components/home/EventCategories.tsx

'use client';

import Link from 'next/link';
import { useGetEventTypesQuery } from '@/lib/store/api/eventsApi';
import { 
  BookOpen, 
  Monitor, 
  GraduationCap, 
  Users, 
  Building2, 
  Briefcase, 
  Globe,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map event type slug to icon and color
const getCategoryStyle = (slug: string) => {
  const normalized = slug?.toLowerCase() || '';
  
  const styleMap: Record<string, { icon: React.ReactNode; bgColor: string; hoverColor: string }> = {
    'workshop': { 
      icon: <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-blue-50 text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    'webinar': { 
      icon: <Monitor className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-purple-50 text-purple-600',
      hoverColor: 'hover:bg-purple-100'
    },
    'bootcamp': { 
      icon: <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-green-50 text-green-600',
      hoverColor: 'hover:bg-green-100'
    },
    'meetup': { 
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-orange-50 text-orange-600',
      hoverColor: 'hover:bg-orange-100'
    },
    'conference': { 
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-red-50 text-red-600',
      hoverColor: 'hover:bg-red-100'
    },
    'training': { 
      icon: <Building2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-teal-50 text-teal-600',
      hoverColor: 'hover:bg-teal-100'
    },
    'professional': { 
      icon: <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-indigo-50 text-indigo-600',
      hoverColor: 'hover:bg-indigo-100'
    },
    'ngo': { 
      icon: <Globe className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-emerald-50 text-emerald-600',
      hoverColor: 'hover:bg-emerald-100'
    },
    'seminar': { 
      icon: <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-amber-50 text-amber-600',
      hoverColor: 'hover:bg-amber-100'
    },
    'networking': { 
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
      bgColor: 'bg-rose-50 text-rose-600',
      hoverColor: 'hover:bg-rose-100'
    },
  };

  // Find matching style
  for (const [key, value] of Object.entries(styleMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Default
  return { 
    icon: <LayoutGrid className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />, 
    bgColor: 'bg-gray-50 text-gray-600',
    hoverColor: 'hover:bg-gray-100'
  };
};

export function EventCategories() {
  const { data: eventTypes, isLoading, error } = useGetEventTypesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !eventTypes || eventTypes.length === 0) {
    return null;
  }

  // ✅ Filter out "uncategorized" and show up to 6 categories
  const categories = eventTypes
    .filter((category) => {
      const name = category.display_name?.toLowerCase() || category.name?.toLowerCase() || '';
      const slug = category.slug?.toLowerCase() || '';
      // Filter out uncategorized
      return !name.includes('uncategorized') && !slug.includes('uncategorized');
    })
    .slice(0, 6);

  // If no categories after filtering, don't show anything
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
      {categories.map((category) => {
        const { icon, bgColor, hoverColor } = getCategoryStyle(category.slug);
        
        return (
          <Link
            key={category.id}
            href={`/events?type=${category.id}`}
            className="group flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer"
          >
            {/* Circular Icon - Larger on desktop */}
            <div className={cn(
              "flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full transition-all duration-300",
              bgColor,
              hoverColor,
              "group-hover:scale-110 group-hover:shadow-lg"
            )}>
              {icon}
            </div>
            
            {/* Category Name - Larger text */}
            <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 text-center group-hover:text-primary-600 transition-colors max-w-[70px] sm:max-w-[90px] lg:max-w-[120px] truncate">
              {category.display_name || category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}