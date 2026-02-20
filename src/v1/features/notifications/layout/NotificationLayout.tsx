import React, { useEffect } from "react";
// import { Button } from "@/components/Button.tsx";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import {
  BadgeAlertIcon,
  LucideMailWarning,
  MailboxIcon,
  SendIcon,
  StarIcon,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const NotificationLayout: React.FC = () => {
  const { notifications, setActiveTab, fetchInboxAll } = useNotificationStore();

  // Load entire inbox on mount so counts across all tabs are accurate
  useEffect(() => {
    fetchInboxAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    {
      key: "Investment",
      label: "Investment Updates",
      count: notifications.filter(
        (n) => n.group === "Investment Updates" && !n.read
      ).length,
      icon: <MailboxIcon className={"w-5 h-5"} />,
    },
    {
      key: "Performance",
      label: "Performance Alerts",
      count: notifications.filter(
        (n) => n.group === "Performance Alerts" && !n.read
      ).length,
      icon: <StarIcon className={"w-5 h-5"} />,
    },
  ];

  const updateTabs = [
    {
      key: "Draft",
      label: "Upcoming Events",
      count: notifications.filter((n) => n.group === "Events" && !n.read)
        .length,
      icon: <LucideMailWarning className={"w-5 h-5"} />,
    },
    {
      key: "Spam",
      label: "Announcements",
      count:
        notifications.filter((n) => n.group === "Announcements" && !n.read)
          .length || 0,
      icon: <SendIcon className={"w-5 h-5"} />,
    },
  ];

  const messageTabs = [
    {
      key: "DMS",
      label: "Direct Messages",
      count: notifications.filter(
        (n) => n.group === "Direct Messages" && !n.read
      ).length,
      icon: <LucideMailWarning className={"w-5 h-5"} />,
    },
    {
      key: "Important",
      label: "Important",
      count: notifications.filter((n) => n.group === "Important" && !n.read)
        .length,
      icon: <BadgeAlertIcon className={"w-5 h-5"} />,
    },
  ];

  return (
    <div className={"flex w-full h-full gap-5"}>
      <div className="w-[390px] p-4 bg-white rounded shadow">
        <ul>
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={`category/${tab.key}`}
              className={({ isActive }) =>
                `flex justify-between px-3 py-4 rounded text-sm mx-3 ${
                  isActive ? "bg-green-100 text-green-700" : "cursor-pointer"
                }`
              }
              onClick={() => setActiveTab(tab.key)}
            >
              <div className={"flex items-center gap-5"}>
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <span className={"mr-3"}>{tab.count}</span>
            </NavLink>
          ))}
          <li className={"font-medium  mt-10 mb-4 ml-2 text-sm"}>
            Updates and News
          </li>
          {updateTabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={`category/${tab.key}`}
              className={({ isActive }) =>
                `flex justify-between px-3 py-4 rounded text-sm mx-3 ${
                  isActive ? "bg-green-100 text-green-700" : "cursor-pointer"
                }`
              }
              onClick={() => setActiveTab(tab.key)}
            >
              <div className={"flex items-center gap-5"}>
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <span className={"mr-3"}>{tab.count}</span>
            </NavLink>
          ))}
          <li className={"font-medium  mt-10 mb-4 ml-2 text-sm"}>
            Message Center
          </li>
          {messageTabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={`category/${tab.key}`}
              className={({ isActive }) =>
                `flex justify-between px-3 py-4 rounded text-sm mx-3 ${
                  isActive ? "bg-green-100 text-green-700" : "cursor-pointer"
                }`
              }
              onClick={() => setActiveTab(tab.key)}
            >
              <div className={"flex items-center gap-5"}>
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <span className={"mr-3"}>{tab.count}</span>
            </NavLink>
          ))}
        </ul>
      </div>

      <div className={"w-full"}>
        <Outlet />
      </div>
    </div>
  );
};

export default NotificationLayout;
