import React, { useState } from "react";
import { SupportTicket, TicketStatus } from "../types/messages";
import {
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  Ticket as TicketIcon,
  RefreshCw,
} from "lucide-react";
import TicketDetailModal from "./TicketDetailModal";

interface TicketTrackerListProps {
  tickets: SupportTicket[];
  isLoading: boolean;
  onRefresh: () => void;
  onNewTicketClick?: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const TicketTrackerList: React.FC<TicketTrackerListProps> = ({
  tickets,
  isLoading,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === "all" ? true : t.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const totalCount = tickets.length;
  const inReviewCount = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <div className="w-full space-y-3">
      {/* ── Clean Header & Inline Filter (No extra cards) ──────── */}
      <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Your Sent Tickets
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
            {totalCount}
          </span>
          {inReviewCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              {inReviewCount} open
            </span>
          )}
        </div>

        {/* Compact search & filter tabs */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white text-xs text-stone-800 placeholder:text-stone-400 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 transition"
            />
          </div>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("in_review")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                statusFilter === "in_review"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                statusFilter === "resolved"
                  ? "bg-white text-green-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Resolved
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh tickets"
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg border border-stone-200 bg-white transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Ticket Rows (Flush on mobile, no bulky extra cards) ───── */}
      {tickets.length === 0 ? (
        <div className="bg-white border-y sm:border sm:rounded-xl border-stone-200/80 p-8 text-center">
          <TicketIcon className="w-7 h-7 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-700">No sent tickets yet</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Inquiries sent above will appear here with live review status.
          </p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white border-y sm:border sm:rounded-xl border-stone-200/80 p-6 text-center">
          <p className="text-xs font-semibold text-stone-600">No tickets matching "{search}"</p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-2 text-xs text-oha_primary font-semibold underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="bg-white border-y sm:border sm:rounded-xl border-stone-200/80 divide-y divide-stone-100 sm:divide-y-0 sm:space-y-2 sm:bg-transparent sm:border-0">
          {filteredTickets.map((ticket) => {
            const isResolved = ticket.status === "resolved";

            return (
              <div
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="p-3.5 sm:p-4 bg-white sm:rounded-xl sm:border sm:border-stone-200/80 hover:bg-stone-50/80 transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium truncate max-w-[140px]">
                      {ticket.category}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      • {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-oha_primary transition-colors truncate">
                    {ticket.subject}
                  </p>

                  <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1">
                    {ticket.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                      isResolved
                        ? "bg-green-50 text-green-700 border border-green-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{isResolved ? "Resolved" : "Open"}</span>
                  </span>

                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    </div>
  );
};

export default TicketTrackerList;
