export type Message = {
  id: number;
  text: string;
  sender: string;
};

export type MessageStore = {
  messages: Message[];
  isSending: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
};
