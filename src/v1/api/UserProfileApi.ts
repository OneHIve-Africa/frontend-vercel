import Api from "./Api";
import { ApiResponse } from "./types";

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  primary_phone: string;
  other_phone: string;
  location: string;
  position: string;
  profile_image_url: string | null;
  is_first: boolean;
  created_at: string;
  updated_at: string;
}

class UserProfileApi extends Api {
  private static profileInstance: UserProfileApi;

  protected constructor() {
    super();
  }

  public static getInstance(): UserProfileApi {
    if (!UserProfileApi.profileInstance) {
      UserProfileApi.profileInstance = new UserProfileApi();
    }
    return UserProfileApi.profileInstance;
  }

  private roleFromLocal(): "admin" | "farmer" | "investor" {
    const storedRole = (localStorage.getItem("role") || "").toLowerCase();
    if (storedRole === "admin" || storedRole === "farmer" || storedRole === "investor") {
      return storedRole as "admin" | "farmer" | "investor";
    }
    // Fallback: infer from stored profile position
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw) as Partial<UserProfile> & { position?: string };
        const pos = (u?.position || "").toLowerCase();
        if (pos.includes("admin")) return "admin";
        if (pos.includes("farmer")) return "farmer";
        return "investor";
      }
    } catch { }
    return "investor";
  }

  private profilePath(): string {
    const role = this.roleFromLocal();
    if (role === "admin") return "/admin-profile/";
    if (role === "farmer") return "/farmer-profile/";
    return "/investor-profile/";
  }

  public async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.get<UserProfile>(this.profilePath());
  }

  public async updateProfile(
    data: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    return this.put<UserProfile>(this.profilePath(), data);
  }

  public async createAdmin(data: any): Promise<ApiResponse<any>> {
    return this.post<any>("/admin-profile/create-admin/", data);
  }
}

export default UserProfileApi;
