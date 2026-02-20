import { create } from "zustand";
import ProductionApi, { ProductionRecord } from "../api/ProductionApi";

interface ProductionStore {
  records: ProductionRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (params?: any) => Promise<void>;
  createRecord: (data: Partial<ProductionRecord>) => Promise<boolean>;
  createRevenue: (data: Partial<any>) => Promise<boolean>;
  updateRecord: (id: number, data: Partial<ProductionRecord>) => Promise<boolean>;
  deleteRecord: (id: number) => Promise<boolean>;
}

export const useProductionStore = create<ProductionStore>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const api = ProductionApi.getInstance();
      const response = await api.listProduction(params);
      if (response.data) {
        set({ records: response.data, isLoading: false });
      } else {
        set({ error: response.message || "Failed to fetch records", isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.error || error.message || "An unexpected error occurred while fetching records", isLoading: false });
    }
  },

  createRecord: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const api = ProductionApi.getInstance();
      const response = await api.createProduction(data);
      if (response.data) {
        set((state) => ({ 
          records: [response.data as ProductionRecord, ...state.records], 
          isLoading: false 
        }));
        return true;
      }
      set({ error: response.message || "Failed to create record", isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.error || error.message || "An unexpected error occurred while creating record", isLoading: false });
      return false;
    }
  },

  createRevenue: async (data: Partial<any>) => {
    set({ isLoading: true, error: null });
    try {
      const api = ProductionApi.getInstance();
      const response = await api.createRevenue(data);
      if (response.data) {
        set({ isLoading: false });
        // Optionally update a revenue list if we had one
        return true;
      }
      set({ error: response.message || "Failed to create revenue record", isLoading: false });
      return false;
    } catch (error: any) {
       set({ error: error.error || error.message || "An unexpected error occurred while creating revenue", isLoading: false });
       return false;
    }
  },

  updateRecord: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const api = ProductionApi.getInstance();
      const response = await api.updateProduction(id, data);
      if (response.data) {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? (response.data as ProductionRecord) : r)),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || "Failed to update record", isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.error || error.message || "An unexpected error occurred while updating record", isLoading: false });
      return false;
    }
  },

  deleteRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const api = ProductionApi.getInstance();
      const response = await api.deleteProduction(id);
      if (!response.error) {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || "Failed to delete record", isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.error || error.message || "An unexpected error occurred while deleting record", isLoading: false });
      return false;
    }
  },
}));
