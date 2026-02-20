import { create } from "zustand";
import { Message, MessageStore } from "../types/messages";
import FeedbackApi from "@/v1/api/FeedbackApi";



export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  isSending: false,
  error: null,

  loadHistory: async () => {
    const api = FeedbackApi.getInstance();
    const { data, error } = await api.history();
    // Some backends may not support GET /feedback/ (405). Ignore and start empty.
    if (error) return set({ error: null, messages: [] });
    const mapped: Message[] = (data || []).map((m, idx) => ({
      id: typeof m.id === "number" ? m.id : Date.now() + idx,
      text: m.reply || m.message,
      sender: m.reply ? "bot" : "user",
    }));
    set({ messages: mapped, error: null });
  },

  sendMessage: async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: "user" };
    set((s) => ({ messages: [...s.messages, userMsg], isSending: true, error: null }));

    const api = FeedbackApi.getInstance();
    const { data, error } = await api.send({ message: text });
    if (error) {
      set({ isSending: false, error });
      return;
    }
    if (data?.reply) {
      const botMsg: Message = {
        id: typeof (data as any).id === "number" ? (data as any).id : Date.now() + 1,
        text: data.reply,
        sender: "bot",
      };
      set((s) => ({ messages: [...s.messages, botMsg], isSending: false }));
    } else {
      set({ isSending: false });
    }
  },
}));
