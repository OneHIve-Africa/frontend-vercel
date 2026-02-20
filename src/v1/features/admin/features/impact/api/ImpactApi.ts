import Api from "@/v1/api/Api";

export interface ImpactMetrics {
  total_trees_planted: number;
  total_carbon_offset_kg: number;
  contributing_hives: number;
  offset_factor_per_tree: number;
  total_honey_produced_tons: number;
  investor_honey_produced_tons: number;
  income_generated: number;
  regions_count: number;
  hives_ready: number;
  local_jobs_created: number;
}

export interface TreePlantingData {
  farmerId: number;
  trees_planted: number;
  date: string;
  region: string;
  notes?: string;
}

class ImpactApi extends Api {
  private static _instance: ImpactApi;

  private constructor() {
    super();
  }

  public static getInstance(): ImpactApi {
    if (!ImpactApi._instance) {
      ImpactApi._instance = new ImpactApi();
    }
    return ImpactApi._instance;
  }

  public getMetrics() {
    return this.get<ImpactMetrics>("/impact/tree-planting/metrics/");
  }

  public logTreePlanting(data: TreePlantingData) {
    return this.post("/impact/tree-planting/", {
      farmer: data.farmerId,
      trees_planted: data.trees_planted,
      date: data.date,
      region: data.region,
      notes: data.notes
    });
  }
}

export default ImpactApi;
