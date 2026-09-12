import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useMessageStore } from "../store/MessageStore";
import { TicketCategory } from "../types/messages";
import { bee } from "@/assets";

interface MessageInputProps {
  onTicketCreated?: () => void;
}

const QUICK_CATEGORIES: { label: string; value: TicketCategory }[] = [
  { label: "General", value: "General Inquiry" },
  { label: "Apiary & Hives", value: "Apiary & Hive Operations" },
  { label: "Payouts & Yield", value: "Payout & Distributions" },
  { label: "Account", value: "Account & Security" },
  { label: "Bug Report", value: "Technical Bug" },
];

const MessageInput: React.FC<MessageInputProps> = ({ onTicketCreated }) => {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<TicketCategory>("General Inquiry");
  const [createdTicketNum, setCreatedTicketNum] = useState<string | null>(null);

  const createTicket = useMessageStore((state) => state.createTicket);
  const isSending = useMessageStore((s) => s.isSending);
  const error = useMessageStore((s) => s.error);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const firstLine = input.trim().split("\n")[0];
    const subject = firstLine.length > 50 ? firstLine.slice(0, 47) + "..." : firstLine;

    const ticket = await createTicket({
      subject: subject || `${category} Inquiry`,
      message: input.trim(),
      category,
      priority: "normal",
    });

    if (ticket) {
      setCreatedTicketNum(ticket.ticketNumber);
      setInput("");
      if (onTicketCreated) onTicketCreated();
      setTimeout(() => setCreatedTicketNum(null), 6000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 text-center">
      {/* ── Signature "Hello Bee-Friend" Greeting ────────── */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Hello Bee-Friend
        </h2>
        <img
          src={bee}
          alt="OneHive Bee"
          className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs -mt-1"
        />
      </div>
      <p className="text-gray-500 text-sm mb-4">Have Any Issues?</p>

      {/* Quick category pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-lg mb-3">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              category === cat.value
                ? "bg-oha_primary text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Message input container */}
      <div className="flex items-center w-full max-w-xl bg-gray-50 border border-gray-200 rounded-2xl p-2.5 focus-within:border-oha_primary focus-within:bg-white transition-all shadow-xs">
        <textarea
          className="flex-1 bg-transparent outline-none p-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 resize-none h-[105px]"
          placeholder="Write message or describe your issue..."
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isSending) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isSending}
        />
        <button
          className="self-end bg-oha_primary text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-[#e08332] disabled:opacity-60 transition text-xs font-semibold cursor-pointer shadow-xs shrink-0"
          onClick={handleSend}
          disabled={isSending || !input.trim()}
        >
          {isSending ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send size={14} />
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-2.5">
        Our apiary support desk typically replies within a few hours. Every message is tracked as a ticket below.
      </p>

      {/* Success banner with ticket number */}
      {createdTicketNum && (
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Message sent! Tracked as ticket{" "}
            <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">
              #{createdTicketNum}
            </span>{" "}
            in your tickets list below.
          </span>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default MessageInput;
