'use client';

import React, { useState } from 'react';
import { useReservationsStore } from '@/store/reservationsStore';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Event, EventStatus } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';
import Toast from '@/components/ui/Toast';
import { formatDate, getAvailableSpots, getFillRate, cn } from '@/lib/utils';
import { EVENT_STATUS_CONFIG } from '@/lib/constants';

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
  isAdmin?: boolean;
  isReserved?: boolean;
}

export default function EventCard({
  event,
  showStatus = false,
  isAdmin = false,
  isReserved = false,
}: EventCardProps) {
  const { createReservation, error, clearError } = useReservationsStore();
  const availableSpots = getAvailableSpots(event.capacity, event.reservedSpots);
  const fillRate = getFillRate(event.capacity, event.reservedSpots);
  const eventId = event.id || event._id;
  const href = isAdmin ? `/dashboard/admin/events/${eventId}` : `/events/${eventId}`;

  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'info';
  } | null>(null);

  const handleReserve = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isReserved) {
      setToast({ message: 'Vous avez déjà réservé cet événement.', type: 'error' });
      return;
    }

    try {
      if (typeof eventId === 'string') {
        await createReservation(eventId);
      }
      setToast({ message: 'Réservation réussie !', type: 'success' });
    } catch {
      setToast({ message: error || 'Erreur lors de la réservation', type: 'error' });
      clearError();
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Link href={href}>
        <Card hover className="h-full">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700">
                {event.category}
              </span>
            </div>

            {showStatus && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    event.status === EventStatus.PUBLISHED
                      ? 'success'
                      : event.status === EventStatus.CANCELED
                      ? 'danger'
                      : 'default'
                  }
                >
                  {EVENT_STATUS_CONFIG[event.status]?.label || event.status}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold line-clamp-2">
              {event.title}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-500" />
                {event.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {availableSpots > 0
                    ? `${availableSpots} places disponibles`
                    : 'Complet'}
                </div>
                <span className="font-medium text-primary-600">
                  {fillRate}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full',
                    fillRate >= 90
                      ? 'bg-red-500'
                      : fillRate >= 70
                      ? 'bg-yellow-500'
                      : 'bg-primary-500'
                  )}
                  style={{ width: `${fillRate}%` }}
                />
              </div>
            </div>

            {!isAdmin && availableSpots > 0 && (
              isReserved ? (
                <div className="text-center text-green-600 font-semibold">
                  Réservation déjà effectuée
                </div>
              ) : (
                <button
                  onClick={handleReserve}
                  className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
                >
                  Réserver
                </button>
              )
            )}
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
