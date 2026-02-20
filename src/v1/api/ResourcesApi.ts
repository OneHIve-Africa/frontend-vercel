import Api from "./Api";
import type { ApiResponse } from "./types";

export interface CreateResourcePayload {
  title: string;
  desc?: string;
  accessed_by: Array<"Admins" | "Farmers" | "Investors">;
  public_url: string; // Cloudinary URL
}

export interface ResourceItem {
  id: number;
  title: string;
  desc?: string;
  accessed_by: "Admins" | "Farmers" | "Investors" | "all";
  created_by_email: string;
  public_url: string;
  created_at: string;
  updated_at: string;
}

class ResourcesApi extends Api {
  private static resourcesInstance: ResourcesApi;

  protected constructor() {
    super();
  }

  static getInstance(): ResourcesApi {
    if (!this.resourcesInstance) {
      this.resourcesInstance = new ResourcesApi();
    }
    return this.resourcesInstance;
  }

  public async createResource(
    payload: CreateResourcePayload
  ): Promise<ApiResponse<unknown>> {
    return this.post<unknown>("/resources/", payload);
  }

  public async listResources(): Promise<ApiResponse<ResourceItem[]>> {
    return this.get<ResourceItem[]>("/resources/");
  }
}

export default ResourcesApi;
