import { useEffect, useRef } from "react";
import { useMessageStore } from "../store/MessageStore";
import MessageInput from "../components/MessageInput";
import TicketTrackerList from "../components/TicketTrackerList";
import { abso } from "@/assets";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";

const FeedbackPage = () => {
  const loadHistory = useMessageStore((s) => s.loadHistory);
  const tickets = useMessageStore((s) => s.tickets);
  const isLoading = useMessageStore((s) => s.isLoading);
  const ticketsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory().catch(() => {});
  }, [loadHistory]);

  const handleTicketCreated = () => {
    setTimeout(() => {
      ticketsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="w-full min-h-full relative overflow-hidden pb-12">
      {/* Subtle contour & honeycomb background fill-in */}
      <div
        className="absolute inset-0 opacity-[0.03] bg-cover bg-no-repeat bg-center pointer-events-none"
        style={{ backgroundImage: `url(${abso})` }}
      />
      <HoneycombPattern opacity={0.03} color="#266B3F" />

      {/* Flush on mobile: px-0 on mobile, max-w-4xl centered on desktop */}
      <div className="w-full max-w-4xl mx-auto px-0 sm:px-6 relative z-10 space-y-6 pt-0 sm:pt-6">
        {/* ── 1. The Signature "Hello Bee-Friend" Box (Flush on mobile) ──── */}
        <div className="w-full bg-white sm:rounded-2xl border-b sm:border border-stone-200/80 sm:shadow-xs py-2 sm:py-4 px-3 sm:px-6">
          <MessageInput onTicketCreated={handleTicketCreated} />
        </div>

        {/* ── 2. Sent Tickets Tracker (Flush on mobile, no extra cards) ───── */}
        <div ref={ticketsSectionRef} className="w-full">
          <TicketTrackerList
            tickets={tickets}
            isLoading={isLoading}
            onRefresh={() => loadHistory()}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
