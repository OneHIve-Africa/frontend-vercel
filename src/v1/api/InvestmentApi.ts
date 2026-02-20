import Api from "./Api";
import { ApiResponse, Investment } from "./types";

class InvestmentApi {
  private static instance: InvestmentApi;
  private api = Api.getInstance();

  private constructor() {}

  public static getInstance(): InvestmentApi {
    if (!InvestmentApi.instance) {
      InvestmentApi.instance = new InvestmentApi();
    }
    return InvestmentApi.instance;
  }

  public async getInvestments(): Promise<ApiResponse<Investment[]>> {
    return this.api.get<Investment[]>("/investments/");
  }
}

export default InvestmentApi.getInstance();
