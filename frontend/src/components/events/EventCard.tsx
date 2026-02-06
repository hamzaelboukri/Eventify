'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Event, EventStatus } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatDate, getAvailableSpots, getFillRate, cn } from '@/lib/utils';
import { EVENT_STATUS_CONFIG } from '@/lib/constants';

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
  isAdmin?: boolean;
}

export default function EventCard({ event, showStatus = false, isAdmin = false }: EventCardProps) {
  const availableSpots = getAvailableSpots(event.capacity, event.reservedSpots);
  const fillRate = getFillRate(event.capacity, event.reservedSpots);
  const eventId = event.id || event._id;
  const href = isAdmin ? `/dashboard/admin/events/${eventId}` : `/events/${eventId}`;

  return (
    <Link href={href}>
      <Card hover className="h-full rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 bg-white">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-t-2xl overflow-hidden">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          )}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
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
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary-500" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary-500" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Capacity */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {availableSpots > 0
                    ? `${availableSpots} places disponibles`
                    : 'Complet'}
                </span>
              </div>
              <span className="text-sm font-medium text-primary-600">{fillRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-yellow-500' : 'bg-primary-500'
                )}
                style={{ width: `${fillRate}%` }}
              />
            </div>
          </div>

          {/* Price */}
          {event.price && (
            <div className="text-lg font-bold text-primary-600">
              {event.price === '0' || event.price === 'Gratuit' ? 'Gratuit' : `${event.price} €`}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
