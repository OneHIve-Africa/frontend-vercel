import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Notifications from "@/v1/features/notifications/components/Notifications.tsx";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import type { AllowedInboxTag } from "@/v1/features/notifications/lib/types.ts";

const NotificationsPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { setActiveTab, fetchInbox } = useNotificationStore();

  useEffect(() => {
    const tabKey = key || "Investment";
    setActiveTab(tabKey);
    const mapping: Record<string, AllowedInboxTag> = {
      Investment: "Investment Updates",
      Performance: "Performance Alerts",
      Draft: "Events",
      Spam: "Announcements",
      DMS: "Direct Messages",
      Important: "Important",
    };
    const tag = (mapping[tabKey] ?? (tabKey as AllowedInboxTag));
    fetchInbox(tag).catch(() => {});
  }, [key, setActiveTab, fetchInbox]);

  return (
    <div className="w-full h-full grid">
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
