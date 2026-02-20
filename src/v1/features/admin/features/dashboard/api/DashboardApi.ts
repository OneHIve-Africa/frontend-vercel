
import Api from "../../../../../api/Api";

export interface DashboardStats {
  financials: {
    total_revenue: number;
    yearly_revenue: number;
    total_investment: number;
    total_payouts: number;
    pending_payouts_requests: number;
  };
  hives: {
    total: number;
    active: number;
    colonized: number;
    maintenance_needed: number;
  };
  users: {
    farmers: number;
    investors: number;
  };
  production: {
    total_honey_liters: number;
    avg_yield_per_hive: number;
  };
  impact: {
    total_investments: number;
    carbon_offset_tonnes: number;
  };
  charts: {
    monthly_revenue: Array<{ name: string; value: number }>;
    monthly_production: Array<{ name: string; value: number }>;
    hive_distribution: Array<{ name: string; value: number; color: string }>;
  };
}

class DashboardApi extends Api {
  private static _instance: DashboardApi;

  private constructor() {
    super();
  }

  public static getInstance(): DashboardApi {
    if (!DashboardApi._instance) {
      DashboardApi._instance = new DashboardApi();
    }
    return DashboardApi._instance;
  }

  public async getStats() {
    return this.get<DashboardStats>("/dashboard/stats/");
  }
}

export default DashboardApi;
