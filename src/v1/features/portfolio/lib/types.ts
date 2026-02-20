type InvestmentStatus = "Completed" | "Active" | "Pending" | "Terminated";

type HiveStatus =
  | "Under Construction"
  | "Deployed"
  | "Colonized"
  | "Uncolonized"
  | "Due Harvest";

type InvestmentRecord = {
  id: string;
  investmentAmount: string;
  investmentDate: string;
  interestEarned: string;
  maturityDate: string;
  investmentStatus: InvestmentStatus;
  hiveStatus: HiveStatus;
};

type HiveData = {
  id: string;
  name: string;
  date: string;
  status: string;
};

type Filters = {
  investmentAmount: string;
  investmentStatus: InvestmentStatus | "all";
  hiveStatus: HiveStatus | "all";
  date?: string;
  hiveId?: string;
};

type PortfolioStore = {
  data: InvestmentRecord[];
  filteredData: InvestmentRecord[];
  filters: Filters;
  isLoading: boolean;
  statusOptions: InvestmentStatus[];
  hiveStatusOptions: HiveStatus[];
  fetchData: () => void;
  applyFilters: (filters: Filters) => void;
  resetFilters: () => void;
};

export type {
  PortfolioStore,
  HiveData,
  Filters,
  HiveStatus,
  InvestmentRecord,
  InvestmentStatus,
};
