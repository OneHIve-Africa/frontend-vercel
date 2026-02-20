import Api from "./Api";
import { ApiResponse } from "./types";

export type FeedbackMessageRequest = {
  message: string;
};

export type FeedbackMessageResponse = {
  id: number | string;
  message: string;
  sender?: "user" | "bot" | string;
  created_at?: string;
  reply?: string; // optional bot/agent reply, if API returns one
};

class FeedbackApi extends Api {
  private static _instance: FeedbackApi;

  protected constructor() {
    super();
  }

  static getInstance(): FeedbackApi {
    if (!FeedbackApi._instance) {
      FeedbackApi._instance = new FeedbackApi();
    }
    return FeedbackApi._instance;
  }

  // Submit a feedback message
  public async send(
    payload: FeedbackMessageRequest
  ): Promise<ApiResponse<FeedbackMessageResponse>> {
    // Adjust path to your backend route if different
    return this.post<FeedbackMessageResponse>("/feedback/", payload);
  }

  // Optionally fetch prior feedback conversation/history
  public async history(): Promise<ApiResponse<FeedbackMessageResponse[]>> {
    return this.get<FeedbackMessageResponse[]>("/feedback/");
  }
}

export default FeedbackApi;
