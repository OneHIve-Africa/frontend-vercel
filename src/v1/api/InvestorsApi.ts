import Api from "./Api";
import { ApiResponse } from "./types";

export interface InvestmentDetails {
  id: number;
  user_profile: number;
  payment: number;
  amount: number;
  investment_date: string;
  roi: number;
  interest_earned: number;
  interest_to_be_earned: number;
  maturity_date: string;
  investment_status: string;
  hive_status: string;
  number_of_hives: number;
  created_at: string;
  updated_at: string;
}

export interface InvestorDetails {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  first_name: string;
  last_name: string;
  profile_email: string;
  primary_phone: string;
  other_phone: string;
  location: string;
  profile_image_url: string | null;
  total_investment: number;
  total_hives: number;
  created_at: string;
  updated_at: string;
  // Investment-related calculated fields
  last_investment_date?: string;
  next_payout_date?: string;
  investments?: InvestmentDetails[];
}

export interface CreateInvestorData {
  user: number;
  first_name: string;
  last_name: string;
  profile_email?: string;
  primary_phone?: string;
  other_phone?: string;
  location?: string;
  profile_image_url?: string;
}

export interface UpdateInvestorData {
  first_name?: string;
  last_name?: string;
  profile_email?: string;
  primary_phone?: string;
  other_phone?: string;
  location?: string;
  profile_image_url?: string;
}

class InvestorsApi extends Api {
  private static investorInstance: InvestorsApi;

  protected constructor() {
    super();
  }

  public static getInstance(): InvestorsApi {
    if (!InvestorsApi.investorInstance) {
      InvestorsApi.investorInstance = new InvestorsApi();
    }
    return InvestorsApi.investorInstance;
  }

  // Get all investors (admin view)
  public async getInvestors(): Promise<ApiResponse<InvestorDetails[]>> {
    return this.get<InvestorDetails[]>("/investor-profile/admin/investors/");
  }

  // Get specific investor by ID
  public async getInvestor(id: number): Promise<ApiResponse<InvestorDetails>> {
    return this.get<InvestorDetails>(`/investor-profile/admin/investors/${id}/`);
  }

  // Create new investor
  public async createInvestor(data: CreateInvestorData): Promise<ApiResponse<InvestorDetails>> {
    return this.post<InvestorDetails>("/investor-profile/admin/investors/", data);
  }

  // Update investor
  public async updateInvestor(id: number, data: UpdateInvestorData): Promise<ApiResponse<InvestorDetails>> {
    return this.put<InvestorDetails>(`/investor-profile/admin/investors/${id}/`, data);
  }

  // Delete investor
  public async deleteInvestor(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/investor-profile/admin/investors/${id}/`);
  }

  // Get investments for all investors (admin view)
  public async getInvestments(): Promise<ApiResponse<InvestmentDetails[]>> {
    return this.get<InvestmentDetails[]>("/investments/");
  }
}

export default InvestorsApi;
