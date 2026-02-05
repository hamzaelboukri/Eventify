'use client';

import React from 'react';
import EventCard from './EventCard';
import { Event } from '@/types';
import Spinner from '@/components/ui/Spinner';

interface EventsGridProps {
  events: Event[];
  isLoading?: boolean;
  showStatus?: boolean;
  isAdmin?: boolean;
  emptyMessage?: string;
}

export default function EventsGrid({
  events,
  isLoading = false,
  showStatus = false,
  isAdmin = false,
  emptyMessage = 'Aucun événement trouvé',
}: EventsGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id || event._id}
          event={event}
          showStatus={showStatus}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
