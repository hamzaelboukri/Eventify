'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ClipboardList, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useReservationsStore } from '@/store/reservationsStore';
import { useEventsStore } from '@/store/eventsStore';
import { useAuthStore } from '@/store/authStore';
import { Reservation, Event, ReservationStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { RESERVATION_STATUS_CONFIG } from '@/lib/constants';

export default function ParticipantDashboardPage() {
  const { user } = useAuthStore();
  const { fetchMyReservations, myReservations } = useReservationsStore();
  const { fetchPublishedEvents, events } = useEventsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMyReservations({ limit: 5 });
    fetchPublishedEvents({ limit: 4 });
  }, [fetchMyReservations, fetchPublishedEvents]);

  const pendingReservations = myReservations.filter(
    (r) => r.status === ReservationStatus.PENDING
  ).length;
  const confirmedReservations = myReservations.filter(
    (r) => r.status === ReservationStatus.CONFIRMED
  ).length;

  if (!mounted) return null;

  return (
    <DashboardLayout requiredRole="participant">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.name} ! 👋
          </h1>
          <p className="text-gray-600">
            Gérez vos réservations et découvrez de nouveaux événements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total réservations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{myReservations.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{confirmedReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Reservations */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Mes réservations</h2>
                <Link
                  href="/dashboard/participant/reservations"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {myReservations.slice(0, 5).map((reservation: Reservation) => {
                const event = reservation.event as Event;
                return (
                  <div
                    key={reservation.id || reservation._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {event?.title || 'Événement'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {event ? formatDate(event.date) : ''} • {event?.time || ''}
                        </p>
                      </div>
                      <Badge
                        variant={
                          reservation.status === ReservationStatus.CONFIRMED
                            ? 'success'
                            : reservation.status === ReservationStatus.PENDING
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {RESERVATION_STATUS_CONFIG[reservation.status]?.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {myReservations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune réservation</p>
                  <Link href="/events">
                    <Button variant="outline" size="sm" className="mt-4">
                      Découvrir les événements
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Événements à venir</h2>
                <Link
                  href="/events"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {events.slice(0, 4).map((event: Event) => (
                <Link
                  key={event.id || event._id}
                  href={`/events/${event.id || event._id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.date)} • {event.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {events.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucun événement disponible
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
