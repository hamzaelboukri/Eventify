'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { EventsGrid, EventFilters } from '@/components/events';
import { Pagination } from '@/components/common';
import { useEventsStore } from '@/store/eventsStore';
import { EventStatus } from '@/types';

export default function AdminEventsPage() {
  const { fetchAllEvents, events, pagination, isLoading, publishEvent, cancelEvent, deleteEvent } = useEventsStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const loadEvents = useCallback(() => {
    fetchAllEvents({
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      page: currentPage,
      limit: 12,
    });
  }, [fetchAllEvents, search, category, status, currentPage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timeoutId = setTimeout(loadEvents, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [loadEvents, mounted]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des événements</h1>
            <p className="text-gray-600">Créez et gérez vos événements</p>
          </div>
          <Link href="/dashboard/admin/events/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Nouvel événement
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <EventFilters
          search={search}
          setSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          category={category}
          setCategory={(value) => {
            setCategory(value);
            setCurrentPage(1);
          }}
          status={status}
          setStatus={(value) => {
            setStatus(value);
            setCurrentPage(1);
          }}
          showStatusFilter={true}
          onClear={handleClearFilters}
        />

        {/* Events Grid */}
        <EventsGrid
          events={events}
          isLoading={isLoading}
          showStatus={true}
          isAdmin={true}
          emptyMessage="Aucun événement trouvé"
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
