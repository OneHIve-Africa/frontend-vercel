import { create } from "zustand";
import { ImpactMetric, ImpactStore } from "../lib/types";

export const useImpactStore = create<ImpactStore>((set) => ({
  metrics: [],
  fetchMetrics: () => {
    const data: ImpactMetric[] = [
      { id: "1", title: "Total Honey Produced", value: 58, unit: "Liters" },
      { id: "2", title: "Beekeepers Empowered", value: 5021, unit: "Farmers" },
      { id: "3", title: "Trees Planted", value: 67, unit: "Trees" },
      { id: "4", title: "Carbon Emissions Reduced", value: 765, unit: "Tons" },
    ];

    set({ metrics: data });
  },
}));
