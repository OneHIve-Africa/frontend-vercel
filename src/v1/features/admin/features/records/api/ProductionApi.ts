import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

export interface ProductionRecord {
  id?: number;
  farmer: number;
  farmer_name?: string;
  hive: number;
  hive_id?: string;
  hives_managed?: number;
  honey_produced_liters: number;
  production_date: string;
  region?: string;
  quality_rating?: number;
  notes?: string;
  created_at?: string;
}

export interface RevenueRecord {
  id?: number;
  source: "honey_sales" | "investor_contributions" | "donations" | "other";
  amount: number;
  description?: string;
  transaction_date: string;
  reference_id?: string;
}

class ProductionApi extends Api {
  private static _instance: ProductionApi;

  private constructor() {
    super();
  }

  public static getInstance(): ProductionApi {
    if (!ProductionApi._instance) {
      ProductionApi._instance = new ProductionApi();
    }
    return ProductionApi._instance;
  }

  // --- Honey Production ---

  public async listProduction(params?: any): Promise<ApiResponse<ProductionRecord[]>> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get<ProductionRecord[]>(`/financial/honey-production/${queryString}`);
  }

  public async getProduction(id: number): Promise<ApiResponse<ProductionRecord>> {
    return this.get<ProductionRecord>(`/financial/honey-production/${id}/`);
  }

  public async createProduction(data: Partial<ProductionRecord>): Promise<ApiResponse<ProductionRecord>> {
    return this.post<ProductionRecord>("/financial/honey-production/", data);
  }

  public async updateProduction(id: number, data: Partial<ProductionRecord>): Promise<ApiResponse<ProductionRecord>> {
    return this.put<ProductionRecord>(`/financial/honey-production/${id}/`, data);
  }

  public async deleteProduction(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/financial/honey-production/${id}/`);
  }

  public async getMetrics(): Promise<ApiResponse<any>> {
    return this.get<any>("/financial/honey-production/metrics/");
  }

  public async getAnalytics(): Promise<ApiResponse<any>> {
    return this.get<any>("/financial/honey-production/analytics/");
  }

  // --- Revenue ---

  public async listRevenue(params?: any): Promise<ApiResponse<RevenueRecord[]>> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get<RevenueRecord[]>(`/financial/revenue/${queryString}`);
  }

  public async createRevenue(data: Partial<RevenueRecord>): Promise<ApiResponse<RevenueRecord>> {
    return this.post<RevenueRecord>("/financial/revenue/", data);
  }
}

export default ProductionApi;
