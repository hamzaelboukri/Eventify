'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { Event } from '@/types';
import { Button, Badge } from '@/components/ui';
import { ReservationModal } from '@/components/reservations';
import { useAuthStore } from '@/store/authStore';
import { useReservationsStore } from '@/store/reservationsStore';
import { formatDateTime, getAvailableSpots, getFillRate, cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/utils';
import Image from 'next/image';

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { createReservation, isLoading } = useReservationsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableSpots = getAvailableSpots(event.capacity, event.reservedSpots);
  const fillRate = getFillRate(event.capacity, event.reservedSpots);
  const isAvailable = availableSpots > 0;

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour réserver');
      router.push(`/login?redirect=/events/${event.id || event._id}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitReservation = async (notes?: string) => {
    try {
      await createReservation(event.id || event._id || '', notes);
      toast.success('Réservation effectuée avec succès !');
      setIsModalOpen(false);
      router.push('/dashboard/participant/reservations');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la réservation');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux événements
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-96 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl overflow-hidden mb-6">
            {event.image && (
              <Image
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                width={600}
                height={200}
              />
            )}
            <div className="absolute top-4 left-4">
              <Badge variant="info">{event.category}</Badge>
            </div>
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Partager
            </button>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails de l&apos;événement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDateTime(event.date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Heure</p>
                  <p className="font-medium text-gray-900">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Tag className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-medium text-gray-900">{event.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar - Reservation Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg">
            {/* Price */}
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-primary-600">
                {event.price === '0' || event.price === 'Gratuit' || !event.price
                  ? 'Gratuit'
                  : `${event.price} €`}
              </p>
            </div>

            {/* Capacity Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Places disponibles</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {availableSpots} / {event.capacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn(
                    'h-3 rounded-full transition-all',
                    fillRate >= 90
                      ? 'bg-red-500'
                      : fillRate >= 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  )}
                  style={{ width: `${fillRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center">
                {fillRate}% de remplissage
              </p>
            </div>

            {/* Reserve Button */}
            <Button
              onClick={handleReserve}
              disabled={!isAvailable}
              className="w-full"
              size="lg"
            >
              {isAvailable ? 'Réserver ma place' : 'Complet'}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-gray-500 text-center mt-3">
                <Link href="/login" className="text-primary-600 hover:underline">
                  Connectez-vous
                </Link>{' '}
                pour réserver
              </p>
            )}

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Confirmation instantanée
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Ticket téléchargeable
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Annulation gratuite
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        onSubmit={handleSubmitReservation}
        isLoading={isLoading}
      />
    </div>
  );
}
