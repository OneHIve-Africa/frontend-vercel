export type ImpactMetric = {
  id: string;
  title: string;
  value: string | number;
  unit: string;
};

export type ImpactStore = {
  metrics: ImpactMetric[];
  fetchMetrics: () => void;
};
