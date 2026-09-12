import Api from "./Api";
import { ApiResponse } from "./types";

export type FeedbackMessageRequest = {
  message: string;
  subject?: string;
  category?: string;
  priority?: string;
};

export type FeedbackMessageResponse = {
  id: number | string;
  ticket_id?: string;
  message: string;
  status?: "open" | "in_review" | "resolved" | string;
  sender_email?: string;
  sender_type?: string;
  sender?: "user" | "bot" | string;
  created_at?: string;
  reply?: string;
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

  // Submit a feedback / ticket message
  public async send(
    payload: FeedbackMessageRequest
  ): Promise<ApiResponse<FeedbackMessageResponse>> {
    let formattedMessage = payload.message;
    if (payload.subject || payload.category) {
      const parts: string[] = [];
      if (payload.category) parts.push(`[Category: ${payload.category}]`);
      if (payload.priority) parts.push(`[Priority: ${payload.priority}]`);
      if (payload.subject) parts.push(`[Subject: ${payload.subject}]`);
      formattedMessage = `${parts.join(" ")}\n\n${payload.message}`;
    }

    return this.post<FeedbackMessageResponse>("/feedback/", {
      message: formattedMessage,
    });
  }

  // Fetch prior feedback tickets history
  public async history(): Promise<ApiResponse<FeedbackMessageResponse[]>> {
    return this.get<FeedbackMessageResponse[]>("/feedback/");
  }
}

export default FeedbackApi;
