// app/(public)/events/page.tsx

import { Calendar } from 'lucide-react';
import { EventGrid } from '@/components/home/EventGrid';

export const metadata = {
  title: 'Events | Nuruvent',
  description: 'Discover and register for professional training events in Kenya. Workshops, webinars, bootcamps, and meetups.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 via-white to-secondary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Events</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Discover Training Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Find and register for professional training events in Kenya.
              Workshops, webinars, bootcamps, and meetups from top training providers.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    Reset
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-1">
                    {['All Events', 'Workshops', 'Webinars', 'Bootcamps', 'Meetups'].map((cat) => (
                      <button
                        key={cat}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          cat === 'All Events'
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
                  <div className="space-y-1">
                    {['All', 'Free', 'KES 1,000 - 5,000', 'KES 5,000 - 10,000', 'KES 10,000+'].map((price) => (
                      <button
                        key={price}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          price === 'All'
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Date */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Date</h4>
                  <div className="space-y-1">
                    {['All', 'Today', 'This Week', 'This Month'].map((date) => (
                      <button
                        key={date}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          date === 'All'
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            <EventGrid />
          </div>
        </div>
      </section>
    </div>
  );
}