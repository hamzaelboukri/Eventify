'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout';
import { ReservationsTable } from '@/components/reservations';
import { Pagination } from '@/components/common';
import { Select } from '@/components/ui';
import { useReservationsStore } from '@/store/reservationsStore';
import { ReservationStatus } from '@/types';
import { RESERVATION_STATUS_CONFIG } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';

export default function AdminReservationsPage() {
  const { 
    fetchAllReservations, 
    reservations, 
    pagination, 
    isLoading,
    updateReservationStatus,
    cancelReservation 
  } = useReservationsStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const loadReservations = useCallback(() => {
    fetchAllReservations({
      status: statusFilter || undefined,
      page: currentPage,
      limit: 20,
    });
  }, [fetchAllReservations, statusFilter, currentPage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadReservations();
    }
  }, [loadReservations, mounted]);

  const handleConfirm = async (id: string) => {
    try {
      await updateReservationStatus(id, ReservationStatus.CONFIRMED);
      toast.success('Réservation confirmée !');
      loadReservations();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la confirmation');
    }
  };

  const handleRefuse = async (id: string) => {
    try {
      await updateReservationStatus(id, ReservationStatus.REFUSED);
      toast.success('Réservation refusée !');
      loadReservations();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors du refus');
    }
  };

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
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des réservations</h1>
            <p className="text-gray-600">Gérez les demandes de réservation</p>
          </div>
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

        {/* Reservations Table */}
        <ReservationsTable
          reservations={reservations}
          onConfirm={handleConfirm}
          onRefuse={handleRefuse}
          onCancel={handleCancel}
          isLoading={isLoading}
          showParticipant={true}
        />

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
