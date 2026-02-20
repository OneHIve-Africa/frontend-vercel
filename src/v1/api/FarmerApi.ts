import Api from "./Api";
import { ApiResponse } from "./types";

export interface FarmerDetails {
  id?: number;
  first_name?: string;
  last_name?: string;
  user_email?: string;
  profile_email?: string;
  primary_phone?: string;
  other_phone?: string;
  location?: string;
  region?: string;
  district?: string;
  town?: string;
  profile_image_url?: string | null;
  farm_name?: string;
  farm_size?: number;
  farm_location?: string;
  is_first?: boolean;
  crop_types?: object;
  // aggregated stats that may be exposed by AdminFarmerManagementSerializer
  total_hives?: number;
  hives_assigned?: number;
  honey_production?: number;
  honey_produced?: number;
}

class FarmersApi extends Api {
  private static farmerInstance: FarmersApi;

  protected constructor() {
    super();
  }

  public static getInstance(): FarmersApi {
    if (!FarmersApi.farmerInstance) {
      FarmersApi.farmerInstance = new FarmersApi();
    }
    return FarmersApi.farmerInstance;
  }

  /**
   * List farmers (admin)
   */
  public async listFarmers(): Promise<ApiResponse<FarmerDetails[]>> {
    return this.get<FarmerDetails[]>("/farmer-profile/admin/farmers/");
  }

  /**
   * Delete a farmer by id (admin)
   */
  public async deleteFarmer(id: number): Promise<ApiResponse<unknown>> {
    return this.delete<unknown>(`/farmer-profile/admin/farmers/${id}/`);
  }

  /**
   * Create a farmer (admin)
   */
  public async createFarmer(payload: {
    email: string;
    profile_email?: string;
    password: string;
    first_name: string;
    last_name: string;
    primary_phone: string;
    other_phone?: string;
    role: "farmer";
    // optional extra details sent by admin UI
    gender?: string;
    date_of_birth?: string;
    id_number?: string;
    contact_number?: string;
    region: string;
    district: string;
    town: string;
  }): Promise<ApiResponse<FarmerDetails>> {
    return this.post<FarmerDetails>("/farmer-profile/admin/farmers/", payload);
  }

  /**
   * Bulk upload farmers via CSV/Excel (admin)
   */
  public async bulkUploadFarmers(
    form: FormData
  ): Promise<ApiResponse<unknown>> {
    return this.post<unknown>(
      "/farmer-profile/admin/farmers/bulk-upload/",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }
}

export default FarmersApi;
