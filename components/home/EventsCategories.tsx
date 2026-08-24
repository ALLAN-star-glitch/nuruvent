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
      icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-blue-50 text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    'webinar': { 
      icon: <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-purple-50 text-purple-600',
      hoverColor: 'hover:bg-purple-100'
    },
    'bootcamp': { 
      icon: <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-green-50 text-green-600',
      hoverColor: 'hover:bg-green-100'
    },
    'meetup': { 
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-orange-50 text-orange-600',
      hoverColor: 'hover:bg-orange-100'
    },
    'conference': { 
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-red-50 text-red-600',
      hoverColor: 'hover:bg-red-100'
    },
    'training': { 
      icon: <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-teal-50 text-teal-600',
      hoverColor: 'hover:bg-teal-100'
    },
    'professional': { 
      icon: <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-indigo-50 text-indigo-600',
      hoverColor: 'hover:bg-indigo-100'
    },
    'ngo': { 
      icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-emerald-50 text-emerald-600',
      hoverColor: 'hover:bg-emerald-100'
    },
    'seminar': { 
      icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />, 
      bgColor: 'bg-amber-50 text-amber-600',
      hoverColor: 'hover:bg-amber-100'
    },
    'networking': { 
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />, 
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
    icon: <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />, 
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

  // Show up to 6 categories to keep it compact
  const categories = eventTypes.slice(0, 6);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
      {categories.map((category) => {
        const { icon, bgColor, hoverColor } = getCategoryStyle(category.slug);
        
        return (
          <Link
            key={category.id}
            href={`/events?type=${category.id}`}
            className="group flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer"
          >
            {/* Circular Icon */}
            <div className={cn(
              "flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-300",
              bgColor,
              hoverColor,
              "group-hover:scale-110 group-hover:shadow-md"
            )}>
              {icon}
            </div>
            
            {/* Category Name - Small text below */}
            <span className="text-[10px] sm:text-xs font-medium text-gray-600 text-center group-hover:text-primary-600 transition-colors max-w-[60px] sm:max-w-[80px] truncate">
              {category.display_name || category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}