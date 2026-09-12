export type TicketCategory =
  | "General Inquiry"
  | "Apiary & Hive Operations"
  | "Payout & Distributions"
  | "Account & Security"
  | "Technical Bug"
  | "Other";

export type TicketPriority = "normal" | "high" | "urgent";

export type TicketStatus = "open" | "in_review" | "resolved" | "closed";

export interface SupportTicket {
  id: number | string;
  ticketNumber: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  reply?: string;
  senderEmail?: string;
}

export type Message = {
  id: number;
  text: string;
  sender: string;
};

export type CreateTicketPayload = {
  subject: string;
  message: string;
  category: TicketCategory;
  priority?: TicketPriority;
};

export type MessageStore = {
  messages: Message[];
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  loadHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  createTicket: (payload: CreateTicketPayload) => Promise<SupportTicket | null>;
  selectTicket: (ticket: SupportTicket | null) => void;
  updateTicketStatus: (id: string | number, status: TicketStatus) => void;
};
