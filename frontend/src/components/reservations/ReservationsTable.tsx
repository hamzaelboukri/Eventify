'use client';

import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Reservation, ReservationStatus, Event, User as UserType } from '@/types';
import { Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { RESERVATION_STATUS_CONFIG } from '@/lib/constants';

interface ReservationsTableProps {
  reservations: Reservation[];
  onConfirm?: (id: string) => void;
  onRefuse?: (id: string) => void;
  onCancel?: (id: string) => void;
  isLoading?: boolean;
  showParticipant?: boolean;
}

export default function ReservationsTable({
  reservations,
  onConfirm,
  onRefuse,
  onCancel,
  isLoading = false,
  showParticipant = true,
}: ReservationsTableProps) {
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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">Aucune réservation trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Événement
              </th>
              {showParticipant && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const event = reservation.event as Event;
              const participant = reservation.participant as UserType;
              const canManage = reservation.status === ReservationStatus.PENDING;
              const canCancel = reservation.status === ReservationStatus.PENDING || 
                              reservation.status === ReservationStatus.CONFIRMED;

              return (
                <tr key={reservation.id || reservation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{event?.title || 'N/A'}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                        {event && (
                          <>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(event.date, 'dd/MM/yyyy')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  {showParticipant && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{participant?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{participant?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(reservation.createdAt, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                      {RESERVATION_STATUS_CONFIG[reservation.status]?.label || reservation.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {canManage && onConfirm && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onConfirm(reservation.id || reservation._id || '')}
                          disabled={isLoading}
                        >
                          Confirmer
                        </Button>
                      )}
                      {canManage && onRefuse && (
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
