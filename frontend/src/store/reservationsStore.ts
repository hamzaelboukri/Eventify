import { create } from 'zustand';
import api from '@/lib/api';
import { Reservation, ReservationStatus, PaginatedResponse, QueryParams } from '@/types';

interface ReservationsState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  myReservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Actions
  fetchAllReservations: (params?: QueryParams) => Promise<void>;
  fetchMyReservations: (params?: QueryParams) => Promise<void>;
  fetchReservationsByEvent: (eventId: string, params?: QueryParams) => Promise<void>;
  fetchReservationById: (id: string) => Promise<Reservation>;
  createReservation: (eventId: string, notes?: string) => Promise<Reservation>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<Reservation>;
  deleteReservation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useReservationsStore = create<ReservationsState>()((set) => ({
  reservations: [],
  currentReservation: null,
  myReservations: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  fetchAllReservations: async (params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PaginatedResponse<Reservation>>('/reservations/admin/all', { params });
      set({
        reservations: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des réservations';
      set({ error: message, isLoading: false });
    }
  },

  fetchMyReservations: async (params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PaginatedResponse<Reservation>>('/reservations/my-reservations', { params });
      set({
        myReservations: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement de vos réservations';
      set({ error: message, isLoading: false });
    }
  },

  fetchReservationsByEvent: async (eventId: string, params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PaginatedResponse<Reservation>>(`/reservations/event/${eventId}`, { params });
      set({
        reservations: response.data.data,
        pagination: {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des réservations';
      set({ error: message, isLoading: false });
    }
  },

  fetchReservationById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Reservation>(`/reservations/${id}`);
      set({ currentReservation: response.data, isLoading: false });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Réservation non trouvée';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createReservation: async (eventId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Reservation>('/reservations', { eventId, notes });
      set((state) => ({
        myReservations: [response.data, ...state.myReservations],
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la réservation';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateReservationStatus: async (id: string, status: ReservationStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Reservation>(`/reservations/${id}/status`, { status });
      set((state) => ({
        reservations: state.reservations.map((r) => 
          (r.id === id || r._id === id ? response.data : r)
        ),
        currentReservation: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  cancelReservation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Reservation>(`/reservations/${id}/cancel`);
      set((state) => ({
        myReservations: state.myReservations.map((r) => 
          (r.id === id || r._id === id ? response.data : r)
        ),
        reservations: state.reservations.map((r) => 
          (r.id === id || r._id === id ? response.data : r)
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'annulation";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteReservation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/reservations/${id}`);
      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id && r._id !== id),
        myReservations: state.myReservations.filter((r) => r.id !== id && r._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
