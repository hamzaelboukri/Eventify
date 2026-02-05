'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Eye, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, Button, Badge, Modal } from '@/components/ui';
import { EventForm } from '@/components/events';
import { ReservationsTable } from '@/components/reservations';
import { useEventsStore } from '@/store/eventsStore';
import { useReservationsStore } from '@/store/reservationsStore';
import { Event, EventStatus, ReservationStatus } from '@/types';
import { formatDateTime, getAvailableSpots, getFillRate, getErrorMessage } from '@/lib/utils';
import { EVENT_STATUS_CONFIG } from '@/lib/constants';

export default function AdminEventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { fetchEventByIdAdmin, currentEvent, updateEvent, publishEvent, cancelEvent, deleteEvent, isLoading } = useEventsStore();
  const { fetchReservationsByEvent, reservations, updateReservationStatus, cancelReservation, isLoading: reservationsLoading } = useReservationsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (eventId) {
      fetchEventByIdAdmin(eventId);
      fetchReservationsByEvent(eventId);
    }
  }, [eventId, fetchEventByIdAdmin, fetchReservationsByEvent]);

  const handleUpdate = async (data: Partial<Event>) => {
    try {
      await updateEvent(eventId, data);
      toast.success('Événement mis à jour !');
      setIsEditing(false);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la mise à jour');
    }
  };

  const handlePublish = async () => {
    try {
      await publishEvent(eventId);
      toast.success('Événement publié !');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la publication');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelEvent(eventId);
      toast.success('Événement annulé !');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || "Erreur lors de l'annulation");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(eventId);
      toast.success('Événement supprimé !');
      router.push('/dashboard/admin/events');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la suppression');
    }
  };

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      await updateReservationStatus(reservationId, ReservationStatus.CONFIRMED);
      toast.success('Réservation confirmée !');
      fetchReservationsByEvent(eventId);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la confirmation');
    }
  };

  const handleRefuseReservation = async (reservationId: string) => {
    try {
      await updateReservationStatus(reservationId, ReservationStatus.REFUSED);
      toast.success('Réservation refusée !');
      fetchReservationsByEvent(eventId);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors du refus');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
      toast.success('Réservation annulée !');
      fetchReservationsByEvent(eventId);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || "Erreur lors de l'annulation");
    }
  };

  if (!mounted || !currentEvent) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const event = currentEvent;
  const availableSpots = getAvailableSpots(event.capacity, event.reservedSpots);
  const fillRate = getFillRate(event.capacity, event.reservedSpots);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <Link
              href="/dashboard/admin/events"
              className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux événements
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
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
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/events/${eventId}`} target="_blank">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            {event.status === EventStatus.DRAFT && (
              <Button size="sm" onClick={handlePublish} isLoading={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Publier
              </Button>
            )}
            {event.status === EventStatus.PUBLISHED && (
              <Button variant="outline" size="sm" onClick={handleCancel} isLoading={isLoading}>
                <XCircle className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informations</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Date et heure</p>
                  <p className="font-medium">{formatDateTime(event.date, event.time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <p className="font-medium">{event.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-medium">{event.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Capacité</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Places</span>
                  </div>
                  <span className="font-semibold">
                    {event.reservedSpots} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      fillRate >= 90
                        ? 'bg-red-500'
                        : fillRate >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${fillRate}%` }}
                  />
                </div>
                <p className="text-center text-gray-600">
                  {availableSpots} places disponibles ({fillRate}% rempli)
                </p>
                {event.price && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {event.price === '0' || event.price === 'Gratuit' ? 'Gratuit' : `${event.price} €`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Réservations ({reservations.length})</h2>
          <ReservationsTable
            reservations={reservations}
            onConfirm={handleConfirmReservation}
            onRefuse={handleRefuseReservation}
            onCancel={handleCancelReservation}
            isLoading={reservationsLoading}
            showParticipant={true}
          />
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Modifier l'événement"
          size="xl"
        >
          <EventForm
            event={event}
            onSubmit={handleUpdate}
            isLoading={isLoading}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer l&apos;événement <strong>{event.title}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
