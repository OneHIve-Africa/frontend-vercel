/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

export interface UserPermissions {
  manage_fulfillment_hubs: boolean;
  record_honey_intake: boolean;
  record_honey_sales: boolean;
  manage_farmers: boolean;
  manage_beehives: boolean;
  view_financials: boolean;
  manage_users: boolean;
  view_audit_logs: boolean;
  [key: string]: boolean;
}

export interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  role: "admin" | "field_agent" | "farmer" | "investor" | string;
  is_staff: boolean;
  is_superuser: boolean;
  permissions?: UserPermissions;
  assigned_region?: string;
  department?: string;
}

export interface RoleCounts {
  all: number;
  admin: number;
  field_agent: number;
  farmer: number;
  investor: number;
  active: number;
  inactive: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class UserAccessApi extends Api {
  private static userAccessInstance: UserAccessApi;

  private constructor() {
    super();
  }

  public static getInstance(): UserAccessApi {
    if (!UserAccessApi.userAccessInstance) {
      UserAccessApi.userAccessInstance = new UserAccessApi();
    }
    return UserAccessApi.userAccessInstance;
  }

  public async listUsers(params?: {
    page?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<UserDetails>>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.role && params.role !== "all") query.append("role", params.role);
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString();
    return this.get<PaginatedResponse<UserDetails>>(
      `/auth/users/${queryString ? `?${queryString}` : ""}`
    );
  }

  public async getRoleCounts(): Promise<ApiResponse<RoleCounts>> {
    return this.get<RoleCounts>("/auth/users/role-counts/");
  }

  public async updateUser(
    id: number,
    data: Partial<UserDetails>
  ): Promise<ApiResponse<UserDetails>> {
    return this.patch<UserDetails>(`/auth/users/${id}/`, data);
  }

  public async updatePermissions(
    id: number,
    payload: {
      role?: string;
      permissions?: Partial<UserPermissions>;
      assigned_region?: string;
      department?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<UserDetails>> {
    return this.post<UserDetails>(
      `/auth/users/${id}/update-permissions/`,
      payload
    );
  }

  public async toggleStatus(id: number): Promise<ApiResponse<UserDetails>> {
    return this.post<UserDetails>(`/auth/users/${id}/toggle-status/`, {});
  }

  public async createUser(payload: {
    email: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    role: string;
    assigned_region?: string;
    department?: string;
    permissions?: Partial<UserPermissions>;
  }): Promise<ApiResponse<UserDetails>> {
    return this.post<UserDetails>("/auth/users/create-user/", payload);
  }
}

export default UserAccessApi;
