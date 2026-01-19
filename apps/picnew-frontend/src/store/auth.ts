import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      const { token, user } = response.data;
      apiClient.setToken(token);
      set({ user, token, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    apiClient.clearToken();
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await apiClient.getCurrentUser();
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
