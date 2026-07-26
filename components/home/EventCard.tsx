// components/home/EventCard.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  id: string;
  title: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  date: string;
  time: string;
  price: number;
  host: string;
  location: string;
  image?: string;
}

const typeColors = {
  workshop: 'bg-blue-100 text-blue-700',
  webinar: 'bg-purple-100 text-purple-700',
  bootcamp: 'bg-orange-100 text-orange-700',
  meetup: 'bg-green-100 text-green-700',
};

const typeLabels = {
  workshop: 'Workshop',
  webinar: 'Webinar',
  bootcamp: 'Bootcamp',
  meetup: 'Meetup',
};

export function EventCard({
  id,
  title,
  type,
  date,
  time,
  price,
  host,
  location,
  image,
}: EventCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <span className="text-4xl opacity-20">📚</span>
          </div>
        )}
        
        {/* Type Badge */}
        <span className={`
          absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
          ${typeColors[type]}
        `}>
          {typeLabels[type]}
        </span>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-primary">
            {price === 0 ? 'FREE' : `KES ${price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-500" />
          </div>
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{host}</span>
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Register Button */}
        <Link href={`/events/${id}`}>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 group/btn"
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}