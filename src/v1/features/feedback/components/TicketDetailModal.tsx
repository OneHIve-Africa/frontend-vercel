import React from "react";
import { SupportTicket } from "../types/messages";
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Tag,
  HelpCircle,
} from "lucide-react";

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  onClose: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
}) => {
  if (!ticket) return null;

  const isResolved = ticket.status === "resolved";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-stone-200/80 shadow-xl w-full max-w-xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700">
              {ticket.ticketNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1.5 ${
                isResolved
                  ? "bg-green-50 text-green-700 border border-green-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}
            >
              {isResolved ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {isResolved ? "Resolved" : "Under Review"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Subject & Category */}
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>{ticket.category}</span>
              <span>•</span>
              <span className="capitalize text-stone-600 font-medium">
                {ticket.priority} priority
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 leading-snug">
              {ticket.subject}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Submitted on {formatDate(ticket.createdAt)}</span>
            </div>
          </div>

          {/* Original Message Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Your Message
            </p>
            <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>
          </div>

          {/* Response / Resolution status timeline */}
          <div className="border border-stone-100 rounded-xl p-4 bg-stone-50/40 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Ticket Progress Tracker
            </p>
            <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-[9px]">
                  ✓
                </span>
                <p className="text-xs font-semibold text-stone-900">
                  Ticket Received & Logged
                </p>
                <p className="text-[11px] text-stone-500">
                  Assigned reference ID {ticket.ticketNumber}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] ${
                    isResolved ? "bg-green-500" : "bg-amber-500 animate-pulse"
                  }`}
                >
                  {isResolved ? "✓" : "•"}
                </span>
                <p className="text-xs font-semibold text-stone-900">
                  {isResolved ? "Investigation Completed" : "Apiary Desk Review"}
                </p>
                <p className="text-[11px] text-stone-500">
                  {isResolved
                    ? "Inquiry addressed by support officer."
                    : "Our support specialists are investigating your inquiry."}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] ${
                    isResolved ? "bg-green-500" : "bg-stone-200"
                  }`}
                >
                  {isResolved ? "✓" : ""}
                </span>
                <p
                  className={`text-xs font-semibold ${
                    isResolved ? "text-stone-900" : "text-stone-400"
                  }`}
                >
                  Resolution & Follow-up
                </p>
                <p className="text-[11px] text-stone-400">
                  {isResolved
                    ? "Ticket resolved."
                    : "Confirmation sent via email and in-app notifications."}
                </p>
              </div>
            </div>
          </div>

          {/* Help & Contact info banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-50/70 border border-green-200/60 text-xs text-green-900">
            <HelpCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Need urgent help?</p>
              <p className="text-green-800 text-[11px] mt-0.5">
                You can also quote this ticket reference (
                <span className="font-bold">{ticket.ticketNumber}</span>) by
                emailing{" "}
                <a
                  href="mailto:support@onehive.org"
                  className="underline font-medium hover:text-green-900"
                >
                  support@onehive.org
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
