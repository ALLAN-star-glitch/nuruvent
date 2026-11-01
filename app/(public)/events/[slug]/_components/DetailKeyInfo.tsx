// app/(public)/events/[slug]/_components/DetailKeyInfo.tsx

'use client';

import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface DetailKeyInfoProps {
  /** True when the event is recurring or spans multiple days. */
  isRange: boolean;
  /** Long-form date label, e.g. "Monday, January 4, 2027" or a range. */
  dateLabel: string;
  /** 12-hour time range, e.g. "10:00 AM – 12:00 PM". */
  timeRange: string;
  /** Human-readable location or "Virtual". */
  location: string;
}

/**
 * Three key info cards: Date (or Dates), Time, Location.
 *
 * Labels switch to "Dates" for recurring or multi-day events. Values
 * wrap up to 3 lines so date ranges fit without truncation.
 */
export function DetailKeyInfo({
  isRange,
  dateLabel,
  timeRange,
  location,
}: DetailKeyInfoProps) {
  const cards = [
    {
      label: isRange ? 'Dates' : 'Date',
      value: dateLabel,
      icon: CalendarIcon,
    },
    {
      label: 'Time',
      value: timeRange,
      icon: ClockIcon,
    },
    {
      label: 'Location',
      value: location,
      icon: MapPinIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {cards.map((item) => (
        <Card
          key={item.label}
          className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm"
        >
          <CardContent className="flex items-start gap-3 p-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="text-sm font-semibold leading-snug text-foreground line-clamp-3">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}