'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ClipboardList, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useEventsStore } from '@/store/eventsStore';
import { useReservationsStore } from '@/store/reservationsStore';
import { EventStatus, ReservationStatus, Event, Reservation } from '@/types';
import { formatDate, getFillRate } from '@/lib/utils';
import { EVENT_STATUS_CONFIG, RESERVATION_STATUS_CONFIG } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { fetchStats, stats, fetchAllEvents, events } = useEventsStore();
  const { fetchAllReservations, reservations } = useReservationsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
    fetchAllEvents({ limit: 5 });
    fetchAllReservations({ limit: 5 });
  }, [fetchStats, fetchAllEvents, fetchAllReservations]);

  if (!mounted) return null;

  const statCards = [
    {
      title: 'Événements',
      value: stats?.totalEvents || 0,
      subtext: `${stats?.publishedEvents || 0} publiés`,
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/dashboard/admin/events',
    },
    {
      title: 'Réservations',
      value: stats?.totalReservedSpots || 0,
      subtext: `Sur ${stats?.totalCapacity || 0} places`,
      icon: ClipboardList,
      color: 'bg-green-500',
      href: '/dashboard/admin/reservations',
    },
    {
      title: 'Taux de remplissage',
      value: `${stats?.averageFillRate || 0}%`,
      subtext: 'Moyenne globale',
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/dashboard/admin/events',
    },
    {
      title: 'À venir',
      value: stats?.upcomingEvents || 0,
      subtext: 'Événements planifiés',
      icon: Users,
      color: 'bg-orange-500',
      href: '/dashboard/admin/events',
    },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue dans votre espace d&apos;administration</p>
          </div>
          <Link href="/dashboard/admin/events/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Nouvel événement
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.href}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Événements récents</h2>
                <Link href="/dashboard/admin/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {events.slice(0, 5).map((event: Event) => (
                <Link
                  key={event.id || event._id}
                  href={`/dashboard/admin/events/${event.id || event._id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(event.date)} • {event.reservedSpots}/{event.capacity} places
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.status === EventStatus.PUBLISHED
                          ? 'success'
                          : event.status === EventStatus.CANCELED
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {EVENT_STATUS_CONFIG[event.status]?.label}
                    </Badge>
                  </div>
                </Link>
              ))}
              {events.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucun événement
                </div>
              )}
            </div>
          </Card>

          {/* Recent Reservations */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Réservations récentes</h2>
                <Link href="/dashboard/admin/reservations" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {reservations.slice(0, 5).map((reservation: Reservation) => {
                const event = reservation.event as Event;
                const participant = reservation.participant as { name?: string; email?: string };
                return (
                  <div
                    key={reservation.id || reservation._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {participant?.name || 'Participant'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {event?.title || 'Événement'}
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
              {reservations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucune réservation
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
