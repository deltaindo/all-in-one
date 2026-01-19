import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface MasterData {
  bidangs: any[];
  trainingPrograms: any[];
  trainingClasses: any[];
  personnelTypes: any[];
  documentTypes: any[];
  regions: any[];
  pics: any[];
  marketing: any[];
}

interface DataStore {
  masterData: MasterData | null;
  links: any[];
  registrations: any[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMasterData: () => Promise<void>;
  fetchLinks: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchRegistrations: (linkId?: string, status?: string, page?: number, limit?: number) => Promise<void>;
  clearError: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  masterData: null,
  links: [],
  registrations: [],
  loading: false,
  error: null,

  fetchMasterData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.getMasterData();
      set({ masterData: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch master data',
        loading: false,
      });
    }
  },

  fetchLinks: async (page = 1, limit = 10, search = '') => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.getLinks(page, limit, search);
      set({ links: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch links',
        loading: false,
      });
    }
  },

  fetchRegistrations: async (linkId?, status?, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.getRegistrations(linkId, status, page, limit);
      set({ registrations: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch registrations',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
