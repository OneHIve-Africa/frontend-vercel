import { create } from "zustand";
import {
  Message,
  MessageStore,
  SupportTicket,
  CreateTicketPayload,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/messages";
import FeedbackApi from "@/v1/api/FeedbackApi";

const STORAGE_KEY = "onehive_support_tickets";

const getStoredTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredTickets = (tickets: SupportTicket[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // ignore
  }
};

/**
 * Parses structured tags like [Category: ...] [Priority: ...] [Subject: ...]
 * from the raw backend message string.
 */
const parseTicketMessage = (rawMessage: string) => {
  let category: TicketCategory = "General Inquiry";
  let priority: TicketPriority = "normal";
  let subject = "";
  let cleanMessage = rawMessage || "";

  const categoryMatch = cleanMessage.match(/\[Category:\s*([^\]]+)\]/i);
  if (categoryMatch) {
    category = categoryMatch[1].trim() as TicketCategory;
    cleanMessage = cleanMessage.replace(categoryMatch[0], "").trim();
  }

  const priorityMatch = cleanMessage.match(/\[Priority:\s*([^\]]+)\]/i);
  if (priorityMatch) {
    priority = (priorityMatch[1].trim().toLowerCase() as TicketPriority) || "normal";
    cleanMessage = cleanMessage.replace(priorityMatch[0], "").trim();
  }

  const subjectMatch = cleanMessage.match(/\[Subject:\s*([^\]]+)\]/i);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    cleanMessage = cleanMessage.replace(subjectMatch[0], "").trim();
  }

  if (!subject) {
    const firstLine = cleanMessage.split("\n")[0].trim();
    subject = firstLine.length > 50 ? firstLine.slice(0, 47) + "..." : firstLine || "Support Request";
  }

  return { category, priority, subject, cleanMessage };
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  tickets: getStoredTickets(),
  selectedTicket: null,
  isLoading: false,
  isSending: false,
  error: null,

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    const localTickets = getStoredTickets();

    try {
      const api = FeedbackApi.getInstance();
      const { data, error } = await api.history();

      if (error || !data) {
        // Backend history might fail if unauthenticated or endpoint issue; use local tickets
        set({
          tickets: localTickets,
          isLoading: false,
        });
        return;
      }

      // Map API responses to SupportTicket format
      const serverTickets: SupportTicket[] = data.map((m, idx) => {
        const { category, priority, subject, cleanMessage } = parseTicketMessage(m.message);
        const ticketNum = m.ticket_id || `TKT-${String(m.id || idx + 1).padStart(4, "0")}`;
        const status = (m.status as TicketStatus) || "in_review";

        return {
          id: m.id ?? Date.now() + idx,
          ticketNumber: ticketNum,
          subject,
          message: cleanMessage,
          category,
          priority,
          status,
          createdAt: m.created_at || new Date().toISOString(),
          reply: m.reply,
          senderEmail: m.sender_email,
        };
      });

      // Merge server tickets and locally stored tickets (avoid duplicates by id or ticketNumber)
      const mergedMap = new Map<string, SupportTicket>();
      serverTickets.forEach((t) => mergedMap.set(String(t.id), t));
      localTickets.forEach((lt) => {
        if (!mergedMap.has(String(lt.id))) {
          mergedMap.set(String(lt.id), lt);
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      saveStoredTickets(mergedList);

      const legacyMessages: Message[] = mergedList.map((t) => ({
        id: typeof t.id === "number" ? t.id : Date.now(),
        text: t.reply || t.message,
        sender: t.reply ? "bot" : "user",
      }));

      set({
        tickets: mergedList,
        messages: legacyMessages,
        isLoading: false,
        error: null,
      });
    } catch {
      set({ tickets: localTickets, isLoading: false });
    }
  },

  createTicket: async (payload: CreateTicketPayload) => {
    const { subject, message, category, priority = "normal" } = payload;
    if (!message.trim()) return null;

    set({ isSending: true, error: null });

    const tempId = Date.now();
    const tempTicketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: tempId,
      ticketNumber: tempTicketNumber,
      subject: subject.trim() || "General Inquiry",
      message: message.trim(),
      category,
      priority,
      status: "in_review",
      createdAt: new Date().toISOString(),
    };

    // Optimistically save ticket locally so user never loses it
    const updatedTickets = [newTicket, ...get().tickets];
    set({ tickets: updatedTickets });
    saveStoredTickets(updatedTickets);

    try {
      const api = FeedbackApi.getInstance();
      const { data, error } = await api.send({
        message: message.trim(),
        subject: subject.trim(),
        category,
        priority,
      });

      if (error) {
        set({ isSending: false, error });
        return newTicket;
      }

      // If server returns real id or ticket_id, update the ticket
      if (data) {
        const finalTicket: SupportTicket = {
          ...newTicket,
          id: data.id || tempId,
          ticketNumber: data.ticket_id || newTicket.ticketNumber,
          reply: data.reply,
          createdAt: data.created_at || newTicket.createdAt,
        };

        const finalTickets = get().tickets.map((t) =>
          t.id === tempId ? finalTicket : t
        );
        set({ tickets: finalTickets, isSending: false });
        saveStoredTickets(finalTickets);
        return finalTicket;
      }

      set({ isSending: false });
      return newTicket;
    } catch {
      set({ isSending: false });
      return newTicket;
    }
  },

  sendMessage: async (text: string) => {
    if (!text.trim()) return;
    const { createTicket } = get();
    await createTicket({
      subject: text.slice(0, 45) + (text.length > 45 ? "..." : ""),
      message: text,
      category: "General Inquiry",
      priority: "normal",
    });
  },

  selectTicket: (ticket: SupportTicket | null) => {
    set({ selectedTicket: ticket });
  },

  updateTicketStatus: (id: string | number, status: TicketStatus) => {
    const updated = get().tickets.map((t) =>
      String(t.id) === String(id) ? { ...t, status } : t
    );
    set({ tickets: updated });
    saveStoredTickets(updated);
    if (get().selectedTicket && String(get().selectedTicket?.id) === String(id)) {
      set({ selectedTicket: { ...get().selectedTicket!, status } });
    }
  },
}));
