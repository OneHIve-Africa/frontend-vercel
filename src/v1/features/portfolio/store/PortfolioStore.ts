import { create } from "zustand";
import { Filters, PortfolioStore } from "../lib/types";
import {
  DUMMY_DATA,
  STATUS_OPTIONS,
  HIVE_STATUS_OPTIONS,
} from "../lib/dummydata";

const usePortfolioStore = create<PortfolioStore>((set) => ({
  data: [],
  filteredData: [],
  filters: { investmentAmount: "", investmentStatus: "all", hiveStatus: "all" },
  isLoading: false,
  statusOptions: STATUS_OPTIONS,
  hiveStatusOptions: HIVE_STATUS_OPTIONS,
  fetchData: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ data: DUMMY_DATA, filteredData: DUMMY_DATA, isLoading: false });
    }, 1500);
  },

  applyFilters: (filters: Filters) => {
    set((state) => ({
      filters,
      filteredData: state.data.filter((item) => {
        const matchesInvestmentAmount =
          !filters.investmentAmount ||
          item.investmentAmount.includes(filters.investmentAmount);
        const matchesInvestmentStatus =
          filters.investmentStatus === "all" ||
          item.investmentStatus === filters.investmentStatus;
        const matchesHiveStatus =
          filters.hiveStatus === "all" ||
          item.hiveStatus === filters.hiveStatus;

        return (
          matchesInvestmentAmount &&
          matchesInvestmentStatus &&
          matchesHiveStatus
        );
      }),
    }));
  },
  resetFilters: () => {
    set((state) => ({
      filters: {
        investmentAmount: "",
        investmentStatus: "all",
        hiveStatus: "all",
      },
      filteredData: state.data,
    }));
  },
}));

export { usePortfolioStore };
