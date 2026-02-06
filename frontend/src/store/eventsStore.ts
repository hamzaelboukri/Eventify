import { create } from 'zustand';
import api from '@/lib/api';
import { Event, CreateEventDto, UpdateEventDto, EventStats, PaginatedResponse, QueryParams } from '@/types';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  stats: EventStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Actions
  fetchPublishedEvents: (params?: QueryParams) => Promise<void>;
  fetchAllEvents: (params?: QueryParams) => Promise<void>;
  fetchMyEvents: (params?: QueryParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<Event>;
  fetchEventByIdAdmin: (id: string) => Promise<Event>;
  createEvent: (data: CreateEventDto) => Promise<Event>;
  updateEvent: (id: string, data: UpdateEventDto) => Promise<Event>;
  publishEvent: (id: string) => Promise<Event>;
  cancelEvent: (id: string) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  fetchStats: () => Promise<EventStats>;
  fetchUpcoming: (limit?: number) => Promise<Event[]>;
  fetchCategories: () => Promise<{ category: string; count: number }[]>;
  checkAvailability: (id: string) => Promise<{ available: boolean; availableSpots: number; message?: string }>;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  currentEvent: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  fetchPublishedEvents: async (params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/events', { params });
      const data = response.data;
      const eventsArray = data?.events || data?.data || (Array.isArray(data) ? data : []);
      set({
        events: Array.isArray(eventsArray) ? eventsArray : [],
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des événements';
      set({ error: message, isLoading: false, events: [] });
    }
  },

  fetchAllEvents: async (params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/events/admin/all', { params });
      const data = response.data;
      const eventsArray = data?.events || data?.data || (Array.isArray(data) ? data : []);
      set({
        events: Array.isArray(eventsArray) ? eventsArray : [],
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des événements';
      set({ error: message, isLoading: false, events: [] });
    }
  },

  fetchMyEvents: async (params?: QueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/events/my-events', { params });
      const data = response.data;
      const eventsArray = data?.events || data?.data || (Array.isArray(data) ? data : []);
      set({
        events: Array.isArray(eventsArray) ? eventsArray : [],
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des événements';
      set({ error: message, isLoading: false, events: [] });
    }
  },

  fetchEventById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Event>(`/events/${id}`);
      set({ currentEvent: response.data, isLoading: false });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Événement non trouvé';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchEventByIdAdmin: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Event>(`/events/admin/${id}`);
      set({ currentEvent: response.data, isLoading: false });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Événement non trouvé';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createEvent: async (data: CreateEventDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Event>('/events', data);
      set((state) => ({
        events: [response.data, ...state.events],
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: string, data: UpdateEventDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Event>(`/events/${id}`, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id || e._id === id ? response.data : e)),
        currentEvent: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  publishEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Event>(`/events/${id}/publish`);
      set((state) => ({
        events: state.events.map((e) => (e.id === id || e._id === id ? response.data : e)),
        currentEvent: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la publication';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  cancelEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Event>(`/events/${id}/cancel`);
      set((state) => ({
        events: state.events.map((e) => (e.id === id || e._id === id ? response.data : e)),
        currentEvent: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'annulation";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/events/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id && e._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get<EventStats>('/events/stats');
      set({ stats: response.data });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques';
      set({ error: message });
      throw error;
    }
  },

  fetchUpcoming: async (limit = 5) => {
    try {
      const response = await api.get<Event[]>('/events/upcoming', { params: { limit } });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement';
      set({ error: message });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get<{ category: string; count: number }[]>('/events/categories');
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des catégories';
      set({ error: message });
      throw error;
    }
  },

  checkAvailability: async (id: string) => {
    try {
      const response = await api.get<{ available: boolean; availableSpots: number; message?: string }>(`/events/${id}/availability`);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la vérification';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
