import Api from "./Api";
import { ApiResponse } from "./types";

export interface FinancialOverview {
  total_revenue: string;
  investor_contributions: string;
  farmer_payouts: string;
  pending_payout_requests: number;
  monthly_revenue_trend: {
    January: string;
    February: string;
    March: string;
    April: string;
    May: string;
    June: string;
    July: string;
    August: string;
    September: string;
    October: string;
    November: string;
    December: string;
  };
  roi_average: string;
  reinvestment_rate: string;
  // New metrics
  net_profit: string;
  profit_margin: string;
  active_investment_value: string;
  investment_growth_rate: string;
  investor_payouts: string;
  total_payouts: string;
  monthly_total_payouts: {
    January: string;
    February: string;
    March: string;
    April: string;
    May: string;
    June: string;
    July: string;
    August: string;
    September: string;
    October: string;
    November: string;
    December: string;
  };
}

export interface InvestorPayout {
  id: number;
  investor_name: string;
  amount_invested: string;
  earnings_to_date: string;
  payout_cycle: string;
  roi_percentage: string;
  payout_option: string; // e.g. Withdrawal
  payout_status: string; // e.g. Pending, Paid
  next_payout: string;
}

export interface InvestorFinancialPerformance {
  projected_earnings: string;
  earnings_this_period: string;
  next_payout_date: string;
}

export interface FarmerPayout {
  id: number;
  farmer_name: string;
  hives_managed: number;
  honey_produced: string;
  earnings: string;
  payout_status: string;
  date: string;
}


class FinancialApi extends Api {
  private static financeInstance: FinancialApi;

  protected constructor() {
    super();
  }

  public static getInstance(): FinancialApi {
    if (!FinancialApi.financeInstance) {
      FinancialApi.financeInstance = new FinancialApi();
    }
    return FinancialApi.financeInstance;
  }

  public async getFinancialDashboard(): Promise<ApiResponse<FinancialOverview>> {
    return this.get<FinancialOverview>("/financial/dashboard/");
  }
  public async getInvestorPayouts(): Promise<ApiResponse<InvestorPayout[]>> {
    return this.get<InvestorPayout[]>("/financial/investor-payouts/");
  }
  public async getFarmerPayouts(): Promise<ApiResponse<FarmerPayout[]>> {
    return this.get<FarmerPayout[]>("/financial/farmer-payouts/");
  }

  public async getInvestorFinancialPerformance(): Promise<ApiResponse<InvestorFinancialPerformance>> {
    return this.get<InvestorFinancialPerformance>("/financial/investor-performance/");
  }

  // Farmer Payout Actions
  public async approveFarmerPayout(id: number): Promise<ApiResponse<FarmerPayout>> {
    return this.post<FarmerPayout>(`/financial/farmer-payouts/${id}/approve/`, {});
  }

  public async processFarmerPayment(id: number, transactionRef: string): Promise<ApiResponse<FarmerPayout>> {
    return this.post<FarmerPayout>(`/financial/farmer-payouts/${id}/process_payment/`, { transaction_reference: transactionRef });
  }

  // Investor Payout Actions
  public async approveInvestorPayout(id: number): Promise<ApiResponse<InvestorPayout>> {
    return this.post<InvestorPayout>(`/financial/investor-payouts/${id}/approve/`, {});
  }

  public async processInvestorWithdrawal(id: number, transactionRef: string): Promise<ApiResponse<InvestorPayout>> {
    return this.post<InvestorPayout>(`/financial/investor-payouts/${id}/process_withdrawal/`, { transaction_reference: transactionRef });
  }

  public async processInvestorReinvestment(id: number): Promise<ApiResponse<InvestorPayout>> {
    // Simplified: reinvestment details could be passed here
    return this.post<InvestorPayout>(`/financial/investor-payouts/${id}/process_reinvestment/`, {});
  }
}

export default FinancialApi;
