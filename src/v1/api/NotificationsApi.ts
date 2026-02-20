import Api from "./Api";
import { ApiResponse } from "./types";

export type InboxMessage = {
  id: number | string;
  title?: string;
  content?: string; // HTML
  tag?: string;
  created_at?: string;
  read?: boolean;
  cta_link?: string | null;
};

class NotificationsApi extends Api {
  private static _instance: NotificationsApi;

  protected constructor() {
    super();
  }

  static getInstance(): NotificationsApi {
    if (!NotificationsApi._instance) {
      NotificationsApi._instance = new NotificationsApi();
    }
    return NotificationsApi._instance;
  }

  public async getInbox(tag?: string): Promise<ApiResponse<InboxMessage[]>> {
    const qp = tag ? `?tag=${encodeURIComponent(tag)}` : "";
    console.log("[NotificationsApi] getting inbox for tag", tag);
    return this.get<InboxMessage[]>(`/admin/messages/inbox/${qp}`);
  }

  // Mark a single message as read (per-item endpoint)
  public async markRead(id: string | number): Promise<ApiResponse<void>> {
    return this.post<void>(`/admin-profile/messages/${id}/read/`, {});
  }

  // Marks a list of messages as read on the server
  public async markReadMany(ids: (string | number)[]): Promise<ApiResponse<void>> {
    return this.post<void>("/admin/messages/inbox/mark-read/", { ids });
  }
}

export default NotificationsApi;

