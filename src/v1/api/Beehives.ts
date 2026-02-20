import Api from "./Api";
import { ApiResponse } from "./types";

export interface HiveItem {
  id: number;
  hive_id: string;
  location: string;
  hive_type: "ktbh" | "langstroth" | "saltpond";
  assigned_farmer: number | null;
  assigned_farmer_name: string | null;
  investor_profile: number | null;
  investor_email: string | null;
  investment: number | null;
  investment_id: number | null;
  investment_amount: string | null;
  status: "completed" | "in_progress" | "inactive";
  needs_maintenance: boolean;
  is_colonized: boolean;
  honey_produced: number;
  created_at: string;
  updated_at: string;
}

export interface HiveStatistics {
  total_active_hives: number;
  uncolonized_hives: number;
  hives_needing_maintenance: number;
  total_honey_produced: number;
}

// Keep old interface for backward compatibility
export interface HiveDetails {
  location: string;
  assigned_farmer: number;
  status: "completed" | "pending" | "in_progress";
  needs_maintenance: boolean;
  is_colonized: boolean;
  honey_produced: number;
}

class BeehivesApi extends Api {
  private static beehiveInstance: BeehivesApi;

  protected constructor() {
    super();
  }

  public static getInstance(): BeehivesApi {
    if (!BeehivesApi.beehiveInstance) {
      BeehivesApi.beehiveInstance = new BeehivesApi();
    }
    return BeehivesApi.beehiveInstance;
  }

  public async getHives(): Promise<ApiResponse<HiveItem[]>> {
    return this.get<HiveItem[]>("/hives/");
  }

  public async getStatistics(): Promise<ApiResponse<HiveStatistics>> {
    return this.get<HiveStatistics>("/hives/statistics/");
  }

  public async createHive(hiveData: Partial<HiveItem>): Promise<ApiResponse<HiveItem>> {
    return this.post<HiveItem>("/hives/", hiveData);
  }

  public async updateHive(id: number, hiveData: Partial<HiveItem>): Promise<ApiResponse<HiveItem>> {
    return this.put<HiveItem>(`/hives/${id}/`, hiveData);
  }

  public async deleteHive(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/hives/${id}/`);
  }

  public async bulkAssignHives(farmerProfileId: number, hiveIds: number[]): Promise<ApiResponse<{
    updated_count: number;
    hive_ids: number[];
    farmer_id: number;
  }>> {
    return this.post("/hives/bulk-assign/", {
      farmer_id: farmerProfileId,
      hive_ids: hiveIds
    });
  }

  public async assignInvestmentHives(farmerProfileId: number, investmentId: number): Promise<ApiResponse<{
    updated_count: number;
    hive_ids: number[];
    farmer_id: number;
    investment_id: number;
  }>> {
    return this.post("/hives/assign-investment/", {
      farmer_id: farmerProfileId,
      investment_id: investmentId
    });
  }
}

export default BeehivesApi;
