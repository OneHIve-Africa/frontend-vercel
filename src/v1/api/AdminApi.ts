import Api from "./Api";
import { ApiResponse } from "./types";

export type AdminCommonItem = {
  id?: number;
  user?: { id?: number; email?: string } | number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  user_email?: string;
  profile_email?: string;
  name?: string;
  full_name?: string;
};

export type AdminInvestorItem = AdminCommonItem;
export type AdminFarmerItem = AdminCommonItem;

class AdminApi extends Api {
  private static adminInstance: AdminApi;

  protected constructor() {
    super();
  }

  static getInstance(): AdminApi {
    if (!AdminApi.adminInstance) {
      AdminApi.adminInstance = new AdminApi();
    }
    return AdminApi.adminInstance;
  }

  public async getAdminInvestors(): Promise<ApiResponse<AdminInvestorItem[]>> {
    return this.get<AdminInvestorItem[]>("/investor-profile/admin/investors/");
  }

  public async getAdminFarmers(): Promise<ApiResponse<AdminFarmerItem[]>> {
    return this.get<AdminFarmerItem[]>("/farmer-profile/admin/farmers/");
  }

  public async sendAdminCommunication(
    payload: {
      user_ids: number[];
      title: string;
      content: string;
      cta_link?: string;
      tag: "Investment Updates" | "Performance Alerts" | "Events" | "Announcements" | "Direct Messages" | "Important";
    }
  ): Promise<ApiResponse<unknown>> {
    return this.post<unknown>("/admin-profile/communicate/", payload);
  }
}

export default AdminApi;
