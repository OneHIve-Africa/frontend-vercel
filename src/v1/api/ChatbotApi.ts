import Api from "./Api";
import { ApiResponse } from "./types";

export interface ChatMessage {
    id?: string;
    role: "user" | "bot" | "system";
    content: string;
    timestamp: string;
}

class ChatbotApi extends Api {
    private static chatbotInstance: ChatbotApi;

    private constructor() {
        super();
    }

    public static getInstance(): ChatbotApi {
        if (!ChatbotApi.chatbotInstance) {
            ChatbotApi.chatbotInstance = new ChatbotApi();
        }
        return ChatbotApi.chatbotInstance;
    }

    public async getHistory(): Promise<ApiResponse<ChatMessage[]>> {
        return this.get<ChatMessage[]>("/chatbot/history/");
    }

    public async sendMessage(message: string, currentPath?: string): Promise<ApiResponse<ChatMessage>> {
        const payload: any = { message };
        if (currentPath) {
            payload.current_path = currentPath;
        }
        return this.post<ChatMessage>("/chatbot/message/", payload);
    }
}

export default ChatbotApi;
