import React, { useMemo, useState } from "react";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import { Link, useNavigate } from "react-router-dom";
import {
  SearchIcon,
  Star,
  Inbox,
  CheckCircle2,
  Calendar,
  Bell,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  X,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";
import { normalizeNotificationKey } from "@/v1/features/notifications/lib/types.ts";

function htmlToText(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return html;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const GROUP_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  "Investment Updates": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Performance Alerts": { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500"   },
  "Events":             { bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500"    },
  "Announcements":      { bg: "bg-stone-100",   text: "text-stone-700",   dot: "bg-stone-400"   },
  "Direct Messages":    { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-500"  },
  "Important":          { bg: "bg-rose-100",    text: "text-rose-800",    dot: "bg-rose-500"    },
};

const TAB_EMPTY_CONFIG: Record<string, {
  icon: React.ElementType; title: string; description: string;
  actionLabel?: string; actionRoute?: string;
}> = {
  "investment-updates": {
    icon: Inbox, title: "No Investment Bulletins Yet",
    description: "Apiary inspection logs, honey off-take yields, and bi-annual harvest distribution receipts will appear here.",
    actionLabel: "Explore Hives", actionRoute: "/new-investment",
  },
  Investment: {
    icon: Inbox, title: "No Investment Bulletins Yet",
    description: "Apiary inspection logs, honey off-take yields, and bi-annual harvest distribution receipts will appear here.",
    actionLabel: "Explore Hives", actionRoute: "/new-investment",
  },
  "performance-alerts": {
    icon: CheckCircle2, title: "All Apiaries Nominal",
    description: "Colony vitality, temperature sensors, and honey supers are operating smoothly across all managed regions.",
    actionLabel: "View Portfolio", actionRoute: "/portfolio",
  },
  Performance: {
    icon: CheckCircle2, title: "All Apiaries Nominal",
    description: "Colony vitality, temperature sensors, and honey supers are operating smoothly across all managed regions.",
    actionLabel: "View Portfolio", actionRoute: "/portfolio",
  },
  events: {
    icon: Calendar, title: "No Upcoming Events",
    description: "Apiary field tours, harvest ceremonies, and quarterly briefings will be scheduled here.",
    actionLabel: "View Impact", actionRoute: "/impact",
  },
  Draft: {
    icon: Calendar, title: "No Upcoming Events",
    description: "Apiary field tours, harvest ceremonies, and quarterly briefings will be scheduled here.",
    actionLabel: "View Impact", actionRoute: "/impact",
  },
  announcements: {
    icon: Bell, title: "No Active Announcements",
    description: "You're all caught up with official updates from the OneHive team.",
  },
  Spam: {
    icon: Bell, title: "No Active Announcements",
    description: "You're all caught up with official updates from the OneHive team.",
  },
  "direct-messages": {
    icon: MessageSquare, title: "No Direct Messages",
    description: "Need help or want to speak with our Volta apiary managers? Send our team a note anytime.",
    actionLabel: "Send Feedback", actionRoute: "/feedback",
  },
  DMS: {
    icon: MessageSquare, title: "No Direct Messages",
    description: "Need help or want to speak with our Volta apiary managers? Send our team a note anytime.",
    actionLabel: "Send Feedback", actionRoute: "/feedback",
  },
  important: {
    icon: AlertTriangle, title: "No Flagged Bulletins",
    description: "Deeds of allocation, formal certificates, and urgent priority notices will be pinned here.",
  },
  Important: {
    icon: AlertTriangle, title: "No Flagged Bulletins",
    description: "Deeds of allocation, formal certificates, and urgent priority notices will be pinned here.",
  },
};

const SkeletonRow: React.FC = () => (
  <div className="flex items-start gap-4 px-4 sm:px-6 py-4 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-stone-200 mt-2 shrink-0" />
    <div className="w-4 h-4 rounded bg-stone-200 shrink-0 mt-0.5" />
    <div className="flex-1 space-y-2">
      <div className="flex gap-2 items-center">
        <div className="h-3.5 w-2/5 rounded bg-stone-200" />
        <div className="h-3 w-16 rounded bg-stone-100" />
      </div>
      <div className="h-3 w-3/4 rounded bg-stone-100" />
    </div>
    <div className="h-3 w-12 rounded bg-stone-100 shrink-0 mt-1" />
  </div>
);

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { filteredNotifications, activeTab, isLoading, error, markAllRead, fetchInboxAll } =
    useNotificationStore();
  const setNotificationRead = useNotificationStore((s) => s.setNotificationRead);
  const [query, setQuery] = useState("");
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredNotifications;
    return filteredNotifications.filter((n) => {
      return (n.title || "").toLowerCase().includes(q) ||
             htmlToText(n.message || "").toLowerCase().includes(q);
    });
  }, [filteredNotifications, query]);

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;
  const normalizedKey = normalizeNotificationKey(activeTab).tabKey;
  const emptyMeta =
    TAB_EMPTY_CONFIG[activeTab] ||
    TAB_EMPTY_CONFIG[normalizedKey] || {
      icon: Inbox, title: "Inbox Zero", description: "No notifications currently in this folder.",
    };
  const EmptyIcon = emptyMeta.icon;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col min-h-[560px]">

      {/* ── Search & Actions Bar ── */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notifications…"
            className="w-full pl-9 pr-8 py-2 bg-white text-xs text-stone-800 placeholder:text-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-300 transition"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fetchInboxAll()}
            title="Refresh"
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="divide-y divide-stone-100">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="divide-y divide-stone-100/80">
            {visible.map((notif) => {
              const isStarred = starredIds.has(notif.id);
              const gs = GROUP_STYLE[notif.group] ?? GROUP_STYLE["Announcements"];
              return (
                <Link
                  to={`/notification/message/${notif.id}`}
                  key={notif.id}
                  className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 transition-colors hover:bg-stone-50 cursor-pointer group relative ${
                    !notif.read ? "bg-amber-50/30" : "bg-white"
                  }`}
                  onClick={() => setNotificationRead(notif.id)}
                >
                  {/* Unread accent bar */}
                  {!notif.read && (
                    <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-emerald-500" />
                  )}

                  {/* Unread dot + star */}
                  <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full transition-opacity ${
                        !notif.read ? gs.dot : "bg-transparent"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(e) => toggleStar(e, notif.id)}
                      className="text-stone-300 hover:text-amber-400 transition"
                      title={isStarred ? "Unstar" : "Star"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${isStarred ? "text-amber-400 fill-amber-400" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          !notif.read ? "font-bold text-stone-900" : "font-medium text-stone-700"
                        }`}
                      >
                        {notif.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${gs.bg} ${gs.text}`}>
                        {notif.group}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                      {truncate(htmlToText(notif.message), 110)}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[11px] text-stone-400 whitespace-nowrap shrink-0 tabular-nums pt-0.5">
                    {formatRelative(notif.timestamp)}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 sm:p-14">
            <HoneycombPattern opacity={0.04} color="#1b9d3c" />
            <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mb-5 border border-stone-200">
                {query ? <SearchIcon className="w-7 h-7" /> : <EmptyIcon className="w-7 h-7" />}
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">
                {query ? `No results for "${query}"` : emptyMeta.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-6">
                {query
                  ? "Try a broader search — 'harvest', 'dividend', or 'hive'."
                  : error || emptyMeta.description}
              </p>
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear search</span>
                </button>
              ) : emptyMeta.actionLabel && emptyMeta.actionRoute ? (
                <button
                  type="button"
                  onClick={() => navigate(emptyMeta.actionRoute!)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oha_secondary text-white text-xs font-semibold hover:bg-[#157a2e] transition shadow-sm cursor-pointer"
                >
                  <span>{emptyMeta.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fetchInboxAll()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh folder</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
