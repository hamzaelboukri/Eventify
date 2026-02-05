import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, UserRole, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
  isParticipant: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/login', { email, password });
          const { access_token, user } = response.data;
          
          Cookies.set('token', access_token, { expires: 7 });
          set({ user, token: access_token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
          const { access_token, user } = response.data;
          
          Cookies.set('token', access_token, { expires: 7 });
          set({ user, token: access_token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        const token = Cookies.get('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.get<User>('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false, token });
        } catch (error) {
          Cookies.remove('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.ADMIN;
      },

      isParticipant: () => {
        const { user } = get();
        return user?.role === UserRole.PARTICIPANT;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
