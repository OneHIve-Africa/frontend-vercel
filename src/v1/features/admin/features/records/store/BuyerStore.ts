import { create } from "zustand";
import BuyersApi, { Buyer } from "../api/BuyersApi";

interface BuyerStore {
  buyers: Buyer[];
  isLoading: boolean;
  error: string | null;
  
  fetchBuyers: () => Promise<void>;
  createBuyer: (data: Partial<Buyer>) => Promise<Buyer | null>;
}

export const useBuyerStore = create<BuyerStore>((set) => ({
  buyers: [],
  isLoading: false,
  error: null,

  fetchBuyers: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = BuyersApi.getInstance();
      const response = await api.listBuyers();
      if (response.data) {
        set({ buyers: response.data, isLoading: false });
      } else {
        set({ error: "Failed to fetch buyers", isLoading: false });
      }
    } catch (error) {
      set({ error: "An unexpected error occurred", isLoading: false });
    }
  },

  createBuyer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const api = BuyersApi.getInstance();
      const response = await api.createBuyer(data);
      if (response.data) {
        set((state) => ({ 
          buyers: [response.data as Buyer, ...state.buyers], 
          isLoading: false 
        }));
        return response.data;
      }
      set({ error: "Failed to create buyer", isLoading: false });
      return null;
    } catch (error) {
       set({ error: "An unexpected error occurred", isLoading: false });
       return null;
    }
  },
}));
