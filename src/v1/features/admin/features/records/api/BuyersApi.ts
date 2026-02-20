import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

export interface Buyer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  type: 'individual' | 'supermarket' | 'pharmacy' | 'exporter' | 'other';
  type_display?: string;
  created_at: string;
}

class BuyersApi extends Api {
  private static _instance: BuyersApi;

  private constructor() {
    super();
  }

  public static getInstance(): BuyersApi {
    if (!BuyersApi._instance) {
      BuyersApi._instance = new BuyersApi();
    }
    return BuyersApi._instance;
  }

  public async listBuyers(): Promise<ApiResponse<Buyer[]>> {
    return this.get<Buyer[]>('/financial/buyers/');
  }

  public async createBuyer(data: Partial<Buyer>): Promise<ApiResponse<Buyer>> {
    return this.post<Buyer>('/financial/buyers/', data);
  }

  public async updateBuyer(id: number, data: Partial<Buyer>): Promise<ApiResponse<Buyer>> {
    return this.patch<Buyer>(`/financial/buyers/${id}/`, data);
  }

  public async deleteBuyer(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/financial/buyers/${id}/`);
  }
}

export default BuyersApi;
