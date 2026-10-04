/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";
import { PaginatedResponse } from "./UserAccessApi";

export interface AuditLog {
  id: number;
  actor: number | null;
  actor_email: string;
  actor_name: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address?: string | null;
  user_agent?: string;
  changes: Record<string, any>;
  status: "SUCCESS" | "FAILURE" | "WARNING" | string;
  timestamp: string;
  formatted_date: string;
}

export interface AuditLogStats {
  total_events: number;
  today_events: number;
  security_events: number;
  operational_events: number;
  permission_changes: number;
  unique_actors: number;
}

export interface AuditLogQueryParams {
  page?: number;
  action?: string;
  category?: "auth" | "users" | "fulfillment" | "security" | string;
  resource_type?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

class AuditLogApi extends Api {
  private static auditLogInstance: AuditLogApi;

  private constructor() {
    super();
  }

  public static getInstance(): AuditLogApi {
    if (!AuditLogApi.auditLogInstance) {
      AuditLogApi.auditLogInstance = new AuditLogApi();
    }
    return AuditLogApi.auditLogInstance;
  }

  public async listLogs(
    params?: AuditLogQueryParams
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.action && params.action !== "all") query.append("action", params.action);
    if (params?.category && params.category !== "all") query.append("category", params.category);
    if (params?.resource_type) query.append("resource_type", params.resource_type);
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.date_from) query.append("date_from", params.date_from);
    if (params?.date_to) query.append("date_to", params.date_to);

    const queryString = query.toString();
    return this.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/${queryString ? `?${queryString}` : ""}`
    );
  }

  public async getStats(): Promise<ApiResponse<AuditLogStats>> {
    return this.get<AuditLogStats>("/audit-logs/stats/");
  }
}

export default AuditLogApi;
