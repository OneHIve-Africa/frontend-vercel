import React, { useEffect } from "react";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import {
  BadgeAlertIcon,
  MailboxIcon,
  SendIcon,
  StarIcon,
  Inbox,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { abso } from "@/assets";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";

const NotificationLayout: React.FC = () => {
  const { notifications, setActiveTab, fetchInboxAll } = useNotificationStore();

  // Load entire inbox on mount so counts across all tabs are accurate
  useEffect(() => {
    fetchInboxAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUnread = notifications.filter((n) => !n.read).length;

  const tabs = [
    {
      key: "investment-updates",
      label: "Investment Updates",
      count: notifications.filter(
        (n) => n.group === "Investment Updates" && !n.read
      ).length,
      icon: <MailboxIcon className="w-4 h-4" />,
    },
    {
      key: "performance-alerts",
      label: "Performance Alerts",
      count: notifications.filter(
        (n) => n.group === "Performance Alerts" && !n.read
      ).length,
      icon: <StarIcon className="w-4 h-4" />,
    },
  ];

  const updateTabs = [
    {
      key: "events",
      label: "Upcoming Events",
      count: notifications.filter((n) => n.group === "Events" && !n.read)
        .length,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      key: "announcements",
      label: "Announcements",
      count:
        notifications.filter((n) => n.group === "Announcements" && !n.read)
          .length || 0,
      icon: <SendIcon className="w-4 h-4" />,
    },
  ];

  const messageTabs = [
    {
      key: "direct-messages",
      label: "Direct Messages",
      count: notifications.filter(
        (n) => n.group === "Direct Messages" && !n.read
      ).length,
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      key: "important",
      label: "Important",
      count: notifications.filter((n) => n.group === "Important" && !n.read)
        .length,
      icon: <BadgeAlertIcon className="w-4 h-4" />,
    },
  ];

  const renderTab = (tab: {
    key: string;
    label: string;
    count: number;
    icon: React.ReactNode;
  }) => (
    <NavLink
      key={tab.key}
      to={`/notification/${tab.key}`}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
          isActive
            ? "bg-oha_primary text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
        }`
      }
      onClick={() => setActiveTab(tab.key)}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            <span className={isActive ? "text-white" : "text-gray-400"}>
              {tab.icon}
            </span>
            <span className="truncate">{tab.label}</span>
          </div>
          {tab.count > 0 && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/25 text-white"
                  : "bg-oha_secondary/15 text-oha_secondary"
              }`}
            >
              {tab.count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-5 pb-12">
      {/* Sidebar / Mailbox Folders */}
      <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative overflow-hidden flex flex-col justify-between">
        {/* Contour and Honeycomb subtle backdrops */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-cover bg-no-repeat bg-center pointer-events-none"
          style={{ backgroundImage: `url(${abso})` }}
        />
        <HoneycombPattern opacity={0.03} color="#266B3F" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-oha_primary/10 text-oha_primary flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Investor Inbox</span>
            </div>
            {totalUnread > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-oha_primary text-white">
                {totalUnread} new
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1.5">
                Investments & Yield
              </div>
              <div className="space-y-1">
                {tabs.map(renderTab)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1.5">
                Updates & News
              </div>
              <div className="space-y-1">
                {updateTabs.map(renderTab)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1.5">
                Communications
              </div>
              <div className="space-y-1">
                {messageTabs.map(renderTab)}
              </div>
            </div>
          </div>
        </div>

        {/* Security / Harvest Notification Notice */}
        <div className="mt-6 pt-4 border-t border-gray-100 relative z-10 text-[11px] text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live sync with OneHive apiary network</span>
        </div>
      </div>

      {/* Main Mailbox Content View */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default NotificationLayout;
