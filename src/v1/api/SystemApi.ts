import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

export interface SystemConfig {
  honey_price_per_liter: number;
  currency: string;
  discount_type: "percentage" | "fixed";
  carbon_offset_per_tree: number;
  regions: string[];
  require_2fa: boolean;
  password_expiry_days: number;
  session_timeout_minutes: number;
  updated_at: string;
}

class SystemApi extends Api {
  private static systemConfigInstance: SystemApi;

  private constructor() {
    super();
  }

  public static getInstance(): SystemApi {
    if (!SystemApi.systemConfigInstance) {
      SystemApi.systemConfigInstance = new SystemApi();
    }
    return SystemApi.systemConfigInstance;
  }

  public async getConfig(): Promise<ApiResponse<SystemConfig>> {
    return this.get<SystemConfig>("/system-config/");
  }

  public async updateConfig(data: Partial<SystemConfig>): Promise<ApiResponse<SystemConfig>> {
    return this.put<SystemConfig>("/system-config/", data);
  }
}

export default SystemApi;
