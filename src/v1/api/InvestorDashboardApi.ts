import Api from "./Api";
import { ApiResponse } from "./types";

// TypeScript interfaces
export interface HiveBreakdown {
  ktbh: number;
  langstroth: number;
  total: number;
}

export interface InvestmentTimelineItem {
  month: string;
  amount: string;
  hives: number;
}

export interface EarningsTrendItem {
  month: string;
  earnings: string;
}

export interface RecentActivity {
  type: 'investment' | 'payout' | 'production';
  description: string;
  amount: string;
  date: string;
}

export interface DashboardStats {
  total_invested: string;
  total_hives: number;
  active_investments: number;
  completed_investments: number;
  total_earnings: string;
  expected_returns: string;
  pending_payouts: string;
  average_roi: string;
  next_payout_date: string | null;
  hive_breakdown: HiveBreakdown;
  investment_timeline: InvestmentTimelineItem[];
  earnings_trend: EarningsTrendItem[];
  recent_activities: RecentActivity[];
}

class InvestorDashboardApi extends Api {
  private static dashboardInstance: InvestorDashboardApi;

  protected constructor() {
    super();
  }

  public static getInstance(): InvestorDashboardApi {
    if (!InvestorDashboardApi.dashboardInstance) {
      InvestorDashboardApi.dashboardInstance = new InvestorDashboardApi();
    }
    return InvestorDashboardApi.dashboardInstance;
  }

  /**
   * Get comprehensive dashboard statistics for the current investor
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>(
      "/investor-profile/dashboard-stats/"
    );
  }
}

export default InvestorDashboardApi;


