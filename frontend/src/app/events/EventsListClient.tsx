'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Event } from '@/types';
import { EventsGrid, EventFilters } from '@/components/events';
import { useReservationsStore } from '@/store/reservationsStore';
import { Pagination } from '@/components/common';
import { useEventsStore } from '@/store/eventsStore';

interface EventsListClientProps {
  initialEvents: Event[];
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: { category: string; count: number }[];
}

export default function EventsListClient({
  initialEvents,
  initialPagination,
  categories,
}: EventsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchPublishedEvents, events, pagination, isLoading } = useEventsStore();
  const { fetchMyReservations, myReservations } = useReservationsStore();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || initialPagination.page
  );
  const [displayEvents, setDisplayEvents] = useState(initialEvents);
  const [displayPagination, setDisplayPagination] = useState(initialPagination);
  const [isClient, setIsClient] = useState(false);
  const [reservedEventIds, setReservedEventIds] = useState<string[]>([]);
  // Fetch user reservations on mount
  useEffect(() => {
    if (isClient) {
      fetchMyReservations();
    }
  }, [isClient, fetchMyReservations]);

  // Map reserved event IDs when myReservations changes
  useEffect(() => {
    if (myReservations && myReservations.length > 0) {
      setReservedEventIds(
        myReservations
          .map(r => typeof r.event === 'string' ? r.event : r.event.id || r.event._id)
          .filter((id): id is string => typeof id === 'string')
      );
    } else {
      setReservedEventIds([]);
    }
  }, [myReservations]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update URL with filters
  const updateURL = useCallback((newSearch: string, newCategory: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newPage > 1) params.set('page', String(newPage));
    
    const queryString = params.toString();
    router.push(`/events${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  // Fetch events when filters change (client-side)
  useEffect(() => {
    if (isClient) {
      const timeoutId = setTimeout(() => {
        fetchPublishedEvents({
          search: search || undefined,
          category: category || undefined,
          page: currentPage,
          limit: 12,
        });
        updateURL(search, category, currentPage);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [search, category, currentPage, fetchPublishedEvents, isClient, updateURL]);

  // Update display data when store updates
  useEffect(() => {
    if (isClient && events.length >= 0) {
      setDisplayEvents(events);
      setDisplayPagination(pagination);
    }
  }, [events, pagination, isClient]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
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
        onClear={handleClearFilters}
      />

      <EventsGrid
        events={displayEvents}
        isLoading={isClient && isLoading}
        emptyMessage="Aucun événement ne correspond à vos critères"
        reservedEventIds={reservedEventIds}
      />

      <Pagination
        currentPage={displayPagination.page}
        totalPages={displayPagination.totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
