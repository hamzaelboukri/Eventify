'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Textarea, Modal } from '@/components/ui';
import { Event } from '@/types';
import { formatDate, getAvailableSpots } from '@/lib/utils';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const reservationSchema = z.object({
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSubmit: (notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ReservationModal({
  isOpen,
  onClose,
  event,
  onSubmit,
  isLoading = false,
}: ReservationModalProps) {
  const availableSpots = getAvailableSpots(event.capacity, event.reservedSpots);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  });

  const handleFormSubmit = async (data: ReservationFormData) => {
    await onSubmit(data.notes);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirmer la réservation" size="lg">
      <div className="space-y-6">
        {/* Event Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{event.title}</h3>
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
              <span>{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary-500" />
              <span>{availableSpots} places disponibles sur {event.capacity}</span>
            </div>
          </div>
          {event.price && (
            <div className="mt-3 text-lg font-bold text-primary-600">
              {event.price === '0' || event.price === 'Gratuit' ? 'Gratuit' : `${event.price} €`}
            </div>
          )}
        </div>

        {/* Reservation Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Textarea
            label="Notes (optionnel)"
            placeholder="Ajoutez des informations supplémentaires..."
            {...register('notes')}
            error={errors.notes?.message}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important :</strong> Votre réservation sera soumise pour validation. 
              Vous recevrez une confirmation une fois que l&apos;organisateur aura approuvé votre demande.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={availableSpots === 0}>
              {availableSpots === 0 ? 'Complet' : 'Confirmer la réservation'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
