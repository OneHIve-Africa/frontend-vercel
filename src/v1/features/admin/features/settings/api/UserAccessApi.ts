import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

export interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  role: string | null;
  is_staff: boolean;
  is_superuser: boolean;
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

  public async listUsers(page: number = 1, role: string = 'all'): Promise<ApiResponse<PaginatedResponse<UserDetails>>> {
    let url = `/auth/users/?page=${page}`;
    if (role && role !== 'all') {
        url += `&role=${role}`;
    }
    return this.get<PaginatedResponse<UserDetails>>(url);
  }

  public async updateUser(id: number, data: Partial<UserDetails>): Promise<ApiResponse<UserDetails>> {
    return this.patch<UserDetails>(`/auth/users/${id}/`, data);
  }
}

export default UserAccessApi;
