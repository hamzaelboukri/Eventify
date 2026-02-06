'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { EVENT_CATEGORIES, EVENT_STATUS_CONFIG } from '@/lib/constants';
import { EventStatus } from '@/types';

interface EventFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
  showStatusFilter?: boolean;
  onClear: () => void;
}

export default function EventFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  showStatusFilter = false,
  onClear,
}: EventFiltersProps) {
  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...EVENT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: EventStatus.DRAFT, label: EVENT_STATUS_CONFIG.draft.label },
    { value: EventStatus.PUBLISHED, label: EVENT_STATUS_CONFIG.published.label },
    { value: EventStatus.CANCELED, label: EVENT_STATUS_CONFIG.canceled.label },
  ];

  const hasFilters = search || category || (showStatusFilter && status);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>

        {/* Status Filter (Admin only) */}
        {showStatusFilter && setStatus && (
          <div className="w-full md:w-48">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" onClick={onClear} className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Effacer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
