/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "./Api";
import { ApiResponse } from "./types";

export interface FulfillmentCenter {
  id: number;
  name: string;
  code: string;
  region: string;
  district?: string;
  town?: string;
  address?: string;
  landmark?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  capacity_gallons?: number | string | null;
  status: "active" | "maintenance" | "inactive";
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  established_date: string;
  created_at: string;
  updated_at: string;
  attached_farmers_count: number;
  total_gallons_received: number;
  total_liters_received: number;
  total_farmer_payouts: number;
  total_sales_revenue: number;
  recent_intakes?: HoneyIntake[];
}

export interface AttachedFarmer {
  id: number;
  fulfillment_center: number;
  fulfillment_center_name: string;
  farmer: number;
  farmer_details: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    primary_phone: string;
    region: string;
    district: string;
    town: string;
    farm_name: string;
    farm_size: number;
    hives_count: number;
    total_honey_delivered_gallons: number;
    total_payout_earned: number;
  };
  assigned_date: string;
  status: "active" | "inactive";
  notes?: string;
  created_at: string;
}

export interface HoneyIntake {
  id: number;
  traceability_code: string;
  fulfillment_center: number;
  fulfillment_center_name?: string;
  fulfillment_center_code?: string;
  fulfillment_center_region?: string;
  farmer: number;
  farmer_details?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    primary_phone: string;
    region: string;
    district: string;
    town: string;
    farm_name: string;
    farm_size: number;
  };
  hive?: number | null;
  intake_date: string;
  harvest_date?: string | null;
  quantity_gallons: number | string;
  quantity_liters: number | string;
  moisture_content_percentage: number | string;
  floral_source: string;
  quality_grade: "grade_a" | "grade_b" | "raw" | "processing_required";
  container_seal_number?: string;
  farmer_rate_per_gallon: number | string;
  farmer_payout_amount: number | string;
  farmer_payout_status: "pending" | "approved" | "paid";
  farmer_payout_date?: string | null;
  payout_reference?: string;
  sale_status: "in_stock" | "processing" | "sold";
  sale_price_per_gallon?: number | string | null;
  total_sale_revenue?: number | string | null;
  buyer_name?: string;
  sale_date?: string | null;
  notes?: string;
  qr_data?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalImpactData {
  overview: {
    total_centers: number;
    active_centers: number;
    total_attached_farmers: number;
    unique_contributing_farmers: number;
    total_gallons_received: number;
    total_liters_received: number;
    total_farmer_payouts: number;
    total_sales_revenue: number;
    net_margin: number;
  };
  regional_distribution: {
    region: string;
    centers_count: number;
    attached_farmers: number;
    total_gallons: number;
    total_farmer_payouts: number;
  }[];
  yearly_impact: {
    year: number;
    total_gallons: number;
    total_farmer_payouts: number;
    total_sales_revenue: number;
    active_farmers_count: number;
    avg_payout_per_farmer: number;
    yoy_growth_percentage: number;
  }[];
}

export interface CenterImpactData {
  center: {
    id: number;
    name: string;
    code: string;
    region: string;
    district?: string;
    capacity_gallons: number;
    established_date: string;
  };
  overall_metrics: {
    total_honey_gallons: number;
    total_honey_liters: number;
    total_farmer_payouts: number;
    total_sales_revenue: number;
    net_margin: number;
    attached_farmers_count: number;
    contributing_farmers_count: number;
    avg_earnings_per_farmer: number;
  };
  multi_year_impact: {
    year: number;
    honey_gallons: number;
    honey_liters: number;
    farmer_payout_total: number;
    sales_revenue_total: number;
    center_margin: number;
    participating_farmers_count: number;
    avg_payout_per_farmer: number;
    yoy_growth_percentage: number;
  }[];
  current_year_monthly: {
    month: string;
    month_num: number;
    gallons: number;
    farmer_payout: number;
  }[];
  top_farmers: {
    farmer_id: number;
    farmer_name: string;
    email: string;
    location: string;
    total_gallons: number;
    total_payout: number;
    batches_count: number;
  }[];
  quality_distribution: {
    grade: string;
    label: string;
    count: number;
    percentage: number;
    volume_gallons: number;
  }[];
}

export interface TraceabilityPassport {
  batch_id: string;
  status: string;
  intake_record: HoneyIntake;
  origin_chain: {
    farmer_name: string;
    farmer_region: string;
    farmer_district: string;
    farmer_town: string;
    farm_name: string;
    apiary_coordinates?: {
      latitude: number | null;
      longitude: number | null;
    };
    harvest_date?: string | null;
  };
  hub_processing: {
    center_name: string;
    center_code: string;
    center_region: string;
    manager_name: string;
    intake_date: string;
    container_seal?: string;
  };
  lab_metrics: {
    quantity_gallons: number;
    quantity_liters: number;
    moisture_percentage: number;
    floral_source: string;
    quality_grade: string;
  };
  economic_impact: {
    farmer_rate_per_gallon: number;
    farmer_payout_amount: number;
    payout_status: string;
    payout_date?: string | null;
  };
  market_distribution: {
    sale_status: string;
    sale_price_per_gallon?: number | null;
    total_sale_revenue?: number | null;
    buyer_name?: string | null;
    sale_date?: string | null;
  };
}

class FulfillmentApi extends Api {
  private static fulfillmentInstance: FulfillmentApi;

  protected constructor() {
    super();
  }

  public static getInstance(): FulfillmentApi {
    if (!FulfillmentApi.fulfillmentInstance) {
      FulfillmentApi.fulfillmentInstance = new FulfillmentApi();
    }
    return FulfillmentApi.fulfillmentInstance;
  }

  // Centers
  public async listCenters(params?: {
    region?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<FulfillmentCenter[]>> {
    const query = new URLSearchParams(params as any).toString();
    return this.get<FulfillmentCenter[]>(`/fulfillment/centers/${query ? `?${query}` : ""}`);
  }

  public async getCenter(id: number): Promise<ApiResponse<FulfillmentCenter>> {
    return this.get<FulfillmentCenter>(`/fulfillment/centers/${id}/`);
  }

  public async createCenter(payload: Partial<FulfillmentCenter>): Promise<ApiResponse<FulfillmentCenter>> {
    return this.post<FulfillmentCenter>("/fulfillment/centers/", payload);
  }

  public async updateCenter(id: number, payload: Partial<FulfillmentCenter>): Promise<ApiResponse<FulfillmentCenter>> {
    return this.put<FulfillmentCenter>(`/fulfillment/centers/${id}/`, payload);
  }

  public async deleteCenter(id: number): Promise<ApiResponse<unknown>> {
    return this.delete<unknown>(`/fulfillment/centers/${id}/`);
  }

  public async generateCode(params: {
    region: string;
    district?: string;
    number?: number | string;
  }): Promise<ApiResponse<{ code: string; region: string; district: string }>> {
    const query = new URLSearchParams({
      region: params.region,
      district: params.district || "",
      ...(params.number ? { number: String(params.number) } : {}),
    }).toString();
    return this.get<{ code: string; region: string; district: string }>(
      `/fulfillment/centers/generate-code/?${query}`
    );
  }

  // Analytics & Impact
  public async getGlobalImpact(): Promise<ApiResponse<GlobalImpactData>> {
    return this.get<GlobalImpactData>("/fulfillment/centers/global-impact/");
  }

  public async getCenterImpact(centerId: number): Promise<ApiResponse<CenterImpactData>> {
    return this.get<CenterImpactData>(`/fulfillment/centers/${centerId}/impact/`);
  }

  // Farmers attachment
  public async getCenterFarmers(centerId: number): Promise<ApiResponse<AttachedFarmer[]>> {
    return this.get<AttachedFarmer[]>(`/fulfillment/centers/${centerId}/farmers/`);
  }

  public async attachFarmers(
    centerId: number,
    payload: { farmer_ids: number[]; notes?: string }
  ): Promise<ApiResponse<{ message: string; attached_ids: number[]; already_attached_ids: number[] }>> {
    return this.post<{ message: string; attached_ids: number[]; already_attached_ids: number[] }>(
      `/fulfillment/centers/${centerId}/attach-farmers/`,
      payload
    );
  }

  public async detachFarmer(
    centerId: number,
    farmer_id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>(`/fulfillment/centers/${centerId}/detach-farmer/`, {
      farmer_id,
    });
  }

  public async getAvailableFarmers(centerId?: number): Promise<
    ApiResponse<
      {
        id: number;
        full_name: string;
        email: string;
        phone: string;
        region: string;
        district: string;
        town: string;
        farm_name: string;
        farm_size: number;
        is_attached_to_any_hub: boolean;
        is_attached_to_current_hub: boolean;
      }[]
    >
  > {
    const q = centerId ? `?center_id=${centerId}` : "";
    return this.get(`/fulfillment/centers/available-farmers/${q}`);
  }

  // Intake & Traceability
  public async listIntakes(params?: {
    fulfillment_center?: number;
    farmer?: number;
    quality_grade?: string;
    sale_status?: string;
    farmer_payout_status?: string;
    year?: number;
    search?: string;
  }): Promise<ApiResponse<HoneyIntake[]>> {
    const query = new URLSearchParams(params as any).toString();
    return this.get<HoneyIntake[]>(`/fulfillment/intake/${query ? `?${query}` : ""}`);
  }

  public async createIntake(payload: Partial<HoneyIntake>): Promise<ApiResponse<HoneyIntake>> {
    return this.post<HoneyIntake>("/fulfillment/intake/", payload);
  }

  public async getIntake(id: number): Promise<ApiResponse<HoneyIntake>> {
    return this.get<HoneyIntake>(`/fulfillment/intake/${id}/`);
  }

  public async lookupTraceability(code: string): Promise<ApiResponse<TraceabilityPassport>> {
    return this.get<TraceabilityPassport>(`/fulfillment/intake/traceability-lookup/?code=${encodeURIComponent(code)}`);
  }

  public async recordSale(
    id: number,
    payload: { sale_price_per_gallon: number; buyer_name?: string; sale_date?: string }
  ): Promise<ApiResponse<HoneyIntake>> {
    return this.post<HoneyIntake>(`/fulfillment/intake/${id}/record-sale/`, payload);
  }

  public async updatePayout(
    id: number,
    payload: { farmer_payout_status: "pending" | "approved" | "paid"; payout_reference?: string; farmer_payout_date?: string }
  ): Promise<ApiResponse<HoneyIntake>> {
    return this.post<HoneyIntake>(`/fulfillment/intake/${id}/update-payout/`, payload);
  }
}

export default FulfillmentApi;
