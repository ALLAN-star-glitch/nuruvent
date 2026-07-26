// components/home/EventGrid.tsx

'use client';

import { EventCard } from './EventCard';

const dummyEvents = [
  {
    id: '1',
    title: 'Data Science with Python Workshop',
    type: 'workshop' as const,
    date: 'Tomorrow, 20 July 2026',
    time: '10:00 AM - 1:00 PM',
    price: 2000,
    host: 'eMobilis Training Institute',
    location: 'Virtual (Zoom)',
  },
  {
    id: '2',
    title: 'Financial Literacy for Professionals',
    type: 'webinar' as const,
    date: 'Thursday, 23 July 2026',
    time: '2:00 PM - 4:00 PM',
    price: 1000,
    host: 'ICPAK',
    location: 'Virtual (Google Meet)',
  },
  {
    id: '3',
    title: 'UI/UX Design Bootcamp',
    type: 'bootcamp' as const,
    date: 'Monday, 27 July 2026',
    time: '9:00 AM - 5:00 PM',
    price: 8000,
    host: 'DevSchool',
    location: 'Virtual (Zoom)',
  },
  {
    id: '4',
    title: 'Nairobi Tech Community Meetup',
    type: 'meetup' as const,
    date: 'Saturday, 25 July 2026',
    time: '3:00 PM - 6:00 PM',
    price: 500,
    host: 'Tech Community Nairobi',
    location: 'Virtual (Google Meet)',
  },
  {
    id: '5',
    title: 'Digital Marketing Masterclass',
    type: 'workshop' as const,
    date: 'Wednesday, 29 July 2026',
    time: '6:00 PM - 8:00 PM',
    price: 3000,
    host: 'eMobilis Training Institute',
    location: 'Virtual (Zoom)',
  },
  {
    id: '6',
    title: 'Leadership & Management Webinar',
    type: 'webinar' as const,
    date: 'Friday, 31 July 2026',
    time: '11:00 AM - 1:00 PM',
    price: 0,
    host: 'IHRM',
    location: 'Virtual (Google Meet)',
  },
];

export function EventGrid() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        <p className="text-gray-600">Discover and register for professional training events in Kenya</p>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-10">
        <button className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
          Load More Events
        </button>
      </div>
    </div>
  );
}