'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { Reservation, ReservationStatus, Event } from '@/types';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';
import { RESERVATION_STATUS_CONFIG } from '@/lib/constants';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onRefuse?: (id: string) => void;
  onDownloadTicket?: (reservation: Reservation) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function ReservationCard({
  reservation,
  onCancel,
  onConfirm,
  onRefuse,
  onDownloadTicket,
  isAdmin = false,
  isLoading = false,
}: ReservationCardProps) {
  const event = reservation.event as Event;
  const statusConfig = RESERVATION_STATUS_CONFIG[reservation.status];
  const canCancel = reservation.status === ReservationStatus.PENDING || 
                   reservation.status === ReservationStatus.CONFIRMED;
  const canConfirm = isAdmin && reservation.status === ReservationStatus.PENDING;
  const canRefuse = isAdmin && reservation.status === ReservationStatus.PENDING;
  const canDownload = reservation.status === ReservationStatus.CONFIRMED;

  const getStatusBadgeVariant = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'success';
      case ReservationStatus.PENDING:
        return 'warning';
      case ReservationStatus.REFUSED:
      case ReservationStatus.CANCELED:
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              href={`/events/${event?.id || event?._id || ''}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {event?.title || 'Événement inconnu'}
            </Link>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {event && (
                <>
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
                </>
              )}
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(reservation.status)}>
            {statusConfig?.label || reservation.status}
          </Badge>
        </div>

        {reservation.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 flex items-start">
              <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
              {reservation.notes}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          Réservé le {formatDate(reservation.createdAt, 'dd/MM/yyyy à HH:mm')}
        </div>

        <div className="flex flex-wrap gap-2">
          {canDownload && onDownloadTicket && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onDownloadTicket(reservation)}
              disabled={isLoading}
            >
              Télécharger le ticket
            </Button>
          )}
          
          {canConfirm && onConfirm && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onConfirm(reservation.id || reservation._id || '')}
              disabled={isLoading}
            >
              Confirmer
            </Button>
          )}
          
          {canRefuse && onRefuse && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRefuse(reservation.id || reservation._id || '')}
              disabled={isLoading}
            >
              Refuser
            </Button>
          )}
          
          {canCancel && onCancel && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(reservation.id || reservation._id || '')}
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
