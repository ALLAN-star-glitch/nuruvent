// app/(public)/page.tsx

import { HeroSection } from '@/components/home/HeroSection';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EventGrid } from '@/components/home/EventGrid';

export const revalidate = 2592000

export default function HomePage() {
  return (
    <>
      <HeroSection />
      
      <section id="events" className="container mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Category Filter */}
          <div className="lg:w-64 flex-shrink-0">
            <CategoryFilter />
          </div>

          {/* Right: Events */}
          <div className="flex-1">
            <EventGrid />
          </div>
        </div>
      </section>
    </>
  );
}