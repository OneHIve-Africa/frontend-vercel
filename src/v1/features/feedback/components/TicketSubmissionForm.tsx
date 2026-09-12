import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Coins,
  Bug,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useMessageStore } from "../store/MessageStore";
import { TicketCategory, TicketPriority } from "../types/messages";

interface TicketSubmissionFormProps {
  onSuccessNavigate?: () => void;
}

const CATEGORIES: { label: TicketCategory; icon: React.ReactNode }[] = [
  { label: "General Inquiry", icon: <HelpCircle className="w-4 h-4" /> },
  { label: "Apiary & Hive Operations", icon: <Sparkles className="w-4 h-4" /> },
  { label: "Payout & Distributions", icon: <Coins className="w-4 h-4" /> },
  { label: "Account & Security", icon: <ShieldCheck className="w-4 h-4" /> },
  { label: "Technical Bug", icon: <Bug className="w-4 h-4" /> },
  { label: "Other", icon: <Tag className="w-4 h-4" /> },
];

const TicketSubmissionForm: React.FC<TicketSubmissionFormProps> = ({
  onSuccessNavigate,
}) => {
  const [category, setCategory] = useState<TicketCategory>("General Inquiry");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);

  const createTicket = useMessageStore((s) => s.createTicket);
  const isSending = useMessageStore((s) => s.isSending);
  const error = useMessageStore((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const created = await createTicket({
      subject: subject.trim() || `${category} Request`,
      message: message.trim(),
      category,
      priority,
    });

    if (created) {
      setSubmittedTicketNumber(created.ticketNumber);
      setSubject("");
      setMessage("");
    }
  };

  const handleReset = () => {
    setSubmittedTicketNumber(null);
    setSubject("");
    setMessage("");
    setCategory("General Inquiry");
    setPriority("normal");
  };

  if (submittedTicketNumber) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-green-200/80 p-8 text-center shadow-xs flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200/60 mb-2">
          Ticket Logged Successfully
        </span>

        <h3 className="text-2xl font-extrabold text-stone-900 mt-1">
          Reference #{submittedTicketNumber}
        </h3>

        <p className="text-sm text-stone-600 max-w-md mt-2 leading-relaxed">
          Your inquiry has been registered in our support queue. Our apiary operations team will review your case and update your ticket status.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          {onSuccessNavigate && (
            <button
              onClick={onSuccessNavigate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-oha_secondary text-white text-xs font-semibold hover:bg-[#157a2e] transition shadow-sm cursor-pointer"
            >
              <span>Track in Sent Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
          >
            Submit Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-stone-900">
          Create a Support Ticket
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Have an issue with hive investments, payouts, or apiary monitoring? Fill out the details below to generate a tracked support ticket.
        </p>
      </div>

      {/* 1. Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
          Category / Inquiry Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategory(cat.label)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-green-50/70 border-oha_secondary text-green-900 shadow-xs"
                    : "bg-stone-50/60 border-stone-200/70 text-stone-700 hover:bg-stone-100/70 hover:border-stone-300"
                }`}
              >
                <span
                  className={isSelected ? "text-oha_secondary" : "text-stone-400"}
                >
                  {cat.icon}
                </span>
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Subject */}
      <div className="space-y-1.5">
        <label
          htmlFor="ticket-subject"
          className="block text-xs font-bold uppercase tracking-wider text-stone-600"
        >
          Subject / Brief Summary
        </label>
        <input
          id="ticket-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Question regarding my Q3 honey dividend distribution"
          className="w-full px-4 py-2.5 bg-stone-50 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:bg-white transition"
          required
        />
      </div>

      {/* 3. Detailed Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="ticket-message"
            className="block text-xs font-bold uppercase tracking-wider text-stone-600"
          >
            Detailed Message / Description
          </label>
          <span className="text-[11px] text-stone-400">
            Be as detailed as possible
          </span>
        </div>
        <textarea
          id="ticket-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your issue, questions, or feedback in detail. Include any relevant dates, hive IDs, or amounts if applicable..."
          className="w-full p-4 bg-stone-50 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:bg-white resize-none transition"
          required
          disabled={isSending}
        />
      </div>

      {/* 4. Priority / Urgency */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
          Urgency Level
        </label>
        <div className="flex items-center gap-3">
          {(["normal", "high", "urgent"] as TicketPriority[]).map((p) => {
            const isSelected = priority === p;
            return (
              <label
                key={p}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold capitalize cursor-pointer transition ${
                  isSelected
                    ? p === "urgent"
                      ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs"
                      : p === "high"
                      ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                      : "bg-green-50 border-green-300 text-green-800 shadow-xs"
                    : "bg-stone-50 border-stone-200/80 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <input
                  type="radio"
                  name="ticket-priority"
                  checked={isSelected}
                  onChange={() => setPriority(p)}
                  className="hidden"
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    p === "urgent"
                      ? "bg-rose-500"
                      : p === "high"
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                />
                <span>{p} Priority</span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
        <p className="text-[11px] text-stone-400">
          Our apiary support officers usually reply within 24 business hours.
        </p>

        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-oha_secondary text-white text-xs sm:text-sm font-semibold hover:bg-[#157a2e] disabled:opacity-60 transition shadow-sm cursor-pointer"
        >
          {isSending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Ticket...</span>
            </>
          ) : (
            <>
              <span>Submit Ticket</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TicketSubmissionForm;
