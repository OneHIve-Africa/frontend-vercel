import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import DOMPurify from "dompurify";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";

const GROUP_ACCENT: Record<string, { bar: string; badge: string; text: string }> = {
  "Investment Updates": { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", text: "emerald" },
  "Performance Alerts": { bar: "bg-amber-500",   badge: "bg-amber-100 text-amber-800",     text: "amber"   },
  "Events":             { bar: "bg-blue-500",    badge: "bg-blue-100 text-blue-800",        text: "blue"    },
  "Announcements":      { bar: "bg-stone-400",   badge: "bg-stone-100 text-stone-700",      text: "stone"   },
  "Direct Messages":    { bar: "bg-violet-500",  badge: "bg-violet-100 text-violet-800",    text: "violet"  },
  "Important":          { bar: "bg-rose-500",    badge: "bg-rose-100 text-rose-800",        text: "rose"    },
};

const NotificationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications } = useNotificationStore();
  const setNotificationRead = useNotificationStore((s) => s.setNotificationRead);

  const notification = notifications.find((n) => String(n.id) === String(id));

  useEffect(() => {
    if (notification && !notification.read) {
      setNotificationRead(notification.id);
    }
  }, [notification, setNotificationRead]);

  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(notification?.message ?? "", { USE_PROFILES: { html: true } }),
    [notification?.message]
  );

  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate("/notification/investment-updates");
  };

  const accent = notification
    ? (GROUP_ACCENT[notification.group] ?? GROUP_ACCENT["Announcements"])
    : GROUP_ACCENT["Announcements"];

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col min-h-[560px]">

      {/* Top nav bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-stone-100 bg-stone-50/60 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inbox</span>
        </button>
        {notification && (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${accent.badge}`}>
            {notification.group}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-8 flex-1">
        {!notification ? (
          <div className="py-20 text-center">
            <p className="text-sm text-stone-500">Notification not found.</p>
            <button
              onClick={() => navigate("/notification/investment-updates")}
              className="mt-4 text-xs font-semibold text-stone-600 underline underline-offset-2"
            >
              Return to inbox
            </button>
          </div>
        ) : (
          <div className="max-w-2xl">

            {/* Header card */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-stone-50 border border-stone-100">
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent.bar}`} />
              <HoneycombPattern opacity={0.025} color="#1b9d3c" />

              <div className="relative z-10 pl-5 pr-5 py-5">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
                    <Tag className="w-3 h-3" />
                    <span>{notification.group}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(notification.timestamp).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-snug">
                  {notification.title || "Notification"}
                </h1>
              </div>
            </div>

            {/* Message body */}
            <div
              className="prose prose-sm sm:prose-base max-w-none text-stone-700 leading-relaxed prose-headings:text-stone-900 prose-a:text-emerald-700"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* CTA */}
            {notification.route && (
              <div className="mt-8 pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => navigate(notification.route!)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oha_secondary text-white text-xs font-semibold hover:bg-[#157a2e] transition shadow-sm cursor-pointer"
                >
                  <span>{notification.ctaLabel || "View Related Page"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
