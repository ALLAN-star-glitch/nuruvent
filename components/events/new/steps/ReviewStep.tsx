// components/events/new/steps/ReviewStep.tsx

'use client';

import { Shield } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { EventType as EventTypeModel } from '@/lib/types/events';

import { EventPreviewCard } from '../EventPreviewCard';

import { deriveVirtualFlags, type EventFormData } from '../../types';

// ============================================================
// REVIEW STEP (Step 5)
// ============================================================
//
// Read-only summary of everything the user entered, followed by the
// same preview card used in the desktop sidebar. Nothing here mutates
// state.
//
// Event-level derived fields (is_virtual, is_hybrid, location, venue)
// are computed on the fly from `formData.schedules` — the backend
// computes them the same way from the same source.

interface ReviewStepProps {
  formData: EventFormData;
  selectedEventType?: EventTypeModel;
}

function durationMinutes(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => isNaN(n))) return null;
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : null;
}

export function ReviewStep({ formData, selectedEventType }: ReviewStepProps) {
  const primary = formData.schedules?.[0];
  const additionalSchedules = Math.max(
    0,
    (formData.schedules?.length ?? 0) - 1,
  );

  // ---- Derived event-level display values ----
  const derived = deriveVirtualFlags(formData.schedules);
  const isVirtual = derived.allVirtual;
  const isHybrid = derived.isHybrid;
  const primaryLocation = primary?.location ?? '';

  const formatLabel = isHybrid
    ? 'Hybrid'
    : isVirtual
      ? 'Virtual'
      : 'In-person';

  const dateLabel = primary?.start_date || 'Not set';
  const endDateLabel =
    primary?.end_date && primary.end_date !== primary.start_date
      ? primary.end_date
      : null;
  const timeLabel = primary?.start_time
    ? `${primary.start_time}${primary.end_time ? ` – ${primary.end_time}` : ''}`
    : 'Not set';
  const duration =
    primary?.start_time && primary?.end_time
      ? durationMinutes(primary.start_time, primary.end_time)
      : null;

  // ---- Tickets ----
  const usableTickets = formData.tickets.filter(
    (t) => t.ticket_type_id && (t.quantity ?? 0) > 0,
  );
  const ticketCount = usableTickets.length;

  let priceLabel: string;
  if (ticketCount === 0) {
    priceLabel = 'No tickets yet';
  } else {
    const prices = usableTickets.map((t) => t.price ?? 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === 0 && max === 0) priceLabel = 'Free';
    else if (min === max) priceLabel = `${min} KES`;
    else if (min === 0) priceLabel = `Free – ${max} KES`;
    else priceLabel = `From ${min} KES`;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-neutral-light">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-neutral-gray">
              <Shield className="h-4 w-4 text-primary-500" />
              <span>Review your event details before publishing</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Event Name */}
              <div className="col-span-2">
                <p className="text-neutral-gray">Event Name</p>
                <p className="font-medium text-neutral-dark">
                  {formData.name || 'Not set'}
                </p>
              </div>

              {/* Type */}
              <div>
                <p className="text-neutral-gray">Type</p>
                <p className="font-medium text-neutral-dark">
                  {selectedEventType?.display_name ||
                    selectedEventType?.name ||
                    'Not set'}
                </p>
              </div>

              {/* Category */}
              <div>
                <p className="text-neutral-gray">Category</p>
                <p className="font-medium text-neutral-dark">
                  {formData.category_id ? 'Set' : 'None'}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-neutral-gray">
                  {endDateLabel ? 'Start Date' : 'Date'}
                </p>
                <p className="font-medium text-neutral-dark">{dateLabel}</p>
              </div>

              {/* End Date */}
              {endDateLabel && (
                <div>
                  <p className="text-neutral-gray">End Date</p>
                  <p className="font-medium text-neutral-dark">
                    {endDateLabel}
                  </p>
                </div>
              )}

              {/* Time */}
              <div>
                <p className="text-neutral-gray">Time</p>
                <p className="font-medium text-neutral-dark">{timeLabel}</p>
              </div>

              {/* Duration */}
              <div>
                <p className="text-neutral-gray">Duration</p>
                <p className="font-medium text-neutral-dark">
                  {duration ? `${duration} minutes` : 'Not set'}
                </p>
              </div>

              {/* Additional schedules */}
              {additionalSchedules > 0 && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Additional Sessions</p>
                  <p className="font-medium text-neutral-dark">
                    {additionalSchedules}{' '}
                    {additionalSchedules === 1 ? 'session' : 'sessions'}
                  </p>
                </div>
              )}

              {/* Recurring */}
              {formData.is_recurring && formData.recurrence?.pattern && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Recurring</p>
                  <p className="font-medium text-neutral-dark capitalize">
                    {formData.recurrence.pattern}
                    {formData.recurrence.interval &&
                      formData.recurrence.interval > 1 &&
                      ` every ${formData.recurrence.interval}`}
                  </p>
                </div>
              )}

              {/* Tickets */}
              <div>
                <p className="text-neutral-gray">Tickets</p>
                <p className="font-medium text-neutral-dark">
                  {ticketCount} {ticketCount === 1 ? 'type' : 'types'}
                </p>
              </div>

              {/* Price */}
              <div>
                <p className="text-neutral-gray">Price</p>
                <p className="font-medium text-neutral-dark">{priceLabel}</p>
              </div>

              {/* Capacity */}
              <div className="col-span-2">
                <p className="text-neutral-gray">Max Attendees</p>
                <p className="font-medium text-neutral-dark">
                  {formData.capacity && formData.capacity > 0
                    ? formData.capacity
                    : 'Unlimited'}
                </p>
              </div>

              {/* Format — derived from schedules */}
              <div className="col-span-2">
                <p className="text-neutral-gray">Format</p>
                <p className="font-medium text-neutral-dark">
                  {formatLabel}
                </p>
              </div>

              {/* Location — derived from the primary schedule */}
              {!isVirtual && primaryLocation && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Location</p>
                  <p className="font-medium text-neutral-dark">
                    {primaryLocation}
                  </p>
                </div>
              )}

              {/* Certificate */}
              {formData.certificate_enabled && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Certificate</p>
                  <p className="font-medium text-neutral-dark">
                    Available
                    {formData.certificate_price &&
                      formData.certificate_price > 0 &&
                      ` — ${formData.certificate_price} KES`}
                  </p>
                </div>
              )}

              {/* Featured */}
              <div className="col-span-2">
                <p className="text-neutral-gray">Featured</p>
                <p className="font-medium text-neutral-dark">
                  {formData.is_featured ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Private */}
              <div className="col-span-2">
                <p className="text-neutral-gray">Private</p>
                <p className="font-medium text-neutral-dark">
                  {formData.is_private ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Waitlist */}
              {formData.waitlist_enabled && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Waitlist</p>
                  <p className="font-medium text-neutral-dark">Enabled</p>
                </div>
              )}

              {/* Invite only */}
              {formData.invite_only && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Invite only</p>
                  <p className="font-medium text-neutral-dark">
                    Yes — {formData.invited_emails.length}{' '}
                    {formData.invited_emails.length === 1
                      ? 'email'
                      : 'emails'}
                  </p>
                </div>
              )}

              {/* Speakers */}
              {formData.speakers.length > 0 && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Speakers</p>
                  <p className="font-medium text-neutral-dark">
                    {formData.speakers.length}{' '}
                    {formData.speakers.length === 1 ? 'speaker' : 'speakers'}
                  </p>
                </div>
              )}

              {/* Materials */}
              {formData.materials.length > 0 && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Materials</p>
                  <p className="font-medium text-neutral-dark">
                    {formData.materials.length}{' '}
                    {formData.materials.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              )}

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="col-span-2">
                  <p className="text-neutral-gray">Tags</p>
                  <p className="font-medium text-neutral-dark">
                    {formData.tags.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Short Description */}
            {formData.short_description && (
              <div className="pt-4 border-t border-neutral-light">
                <p className="text-neutral-gray text-sm">
                  Short Description
                </p>
                <p className="text-sm text-neutral-dark mt-1">
                  {formData.short_description}
                </p>
              </div>
            )}

            {/* Full Description */}
            {formData.description && (
              <div className="pt-4 border-t border-neutral-light">
                <p className="text-neutral-gray text-sm">Description</p>
                <p className="text-sm text-neutral-dark mt-1 whitespace-pre-wrap">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Image */}
            {formData.imagePreview && (
              <div className="pt-4 border-t border-neutral-light">
                <p className="text-neutral-gray text-sm">Event Image</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imagePreview}
                  alt="Event preview"
                  className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EventPreviewCard data={formData} eventType={selectedEventType} />
    </div>
  );
}