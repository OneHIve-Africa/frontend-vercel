import { create } from "zustand";
import InvestmentApi from "@/v1/api/InvestmentApi";
import { Investment } from "@/v1/api/types";

interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;
  fetchInvestments: () => Promise<void>;
}

const useInvestmentStore = create<InvestmentState>((set) => ({
  investments: [],
  isLoading: false,
  error: null,

  fetchInvestments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await InvestmentApi.getInvestments();
      if (response.data) {
        set({ investments: response.data, isLoading: false });
      } else if (response.error) {
        set({ error: response.error, isLoading: false });
      }
    } catch (e: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (typeof e === 'object' && e !== null && ('error' in e || 'message' in e)) {
        const error = e as { error?: string; message?: string };
        errorMessage = error.error || error.message || errorMessage;
      }
      set({ error: errorMessage, isLoading: false });
    }
  },
}));

export default useInvestmentStore;
