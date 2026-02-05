'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout';
import { ReservationCard } from '@/components/reservations';
import { Pagination } from '@/components/common';
import { Select, Spinner } from '@/components/ui';
import { useReservationsStore } from '@/store/reservationsStore';
import { Reservation, ReservationStatus } from '@/types';
import { RESERVATION_STATUS_CONFIG } from '@/lib/constants';
import { generateTicketPDF } from '@/lib/pdf';
import { getErrorMessage } from '@/lib/utils';

export default function ParticipantReservationsPage() {
  const { 
    fetchMyReservations, 
    myReservations, 
    pagination, 
    isLoading,
    cancelReservation 
  } = useReservationsStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const loadReservations = useCallback(() => {
    fetchMyReservations({
      status: statusFilter || undefined,
      page: currentPage,
      limit: 12,
    });
  }, [fetchMyReservations, statusFilter, currentPage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadReservations();
    }
  }, [loadReservations, mounted]);

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id);
      toast.success('Réservation annulée !');
      loadReservations();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || "Erreur lors de l'annulation");
    }
  };

  const handleDownloadTicket = (reservation: Reservation) => {
    try {
      generateTicketPDF(reservation);
      toast.success('Ticket téléchargé !');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: ReservationStatus.PENDING, label: RESERVATION_STATUS_CONFIG.pending.label },
    { value: ReservationStatus.CONFIRMED, label: RESERVATION_STATUS_CONFIG.confirmed.label },
    { value: ReservationStatus.REFUSED, label: RESERVATION_STATUS_CONFIG.refused.label },
    { value: ReservationStatus.CANCELED, label: RESERVATION_STATUS_CONFIG.canceled.label },
  ];

  if (!mounted) return null;

  return (
    <DashboardLayout requiredRole="participant">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
          <p className="text-gray-600">Gérez vos réservations d&apos;événements</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Select
                label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={statusOptions}
              />
            </div>
          </div>
        </div>

        {/* Reservations Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : myReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 mb-4">Vous n&apos;avez aucune réservation</p>
            <a href="/events" className="text-primary-600 hover:underline">
              Découvrir les événements
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id || reservation._id}
                reservation={reservation}
                onCancel={handleCancel}
                onDownloadTicket={handleDownloadTicket}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </DashboardLayout>
  );
}
