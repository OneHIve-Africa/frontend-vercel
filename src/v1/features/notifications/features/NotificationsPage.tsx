import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Notifications from "@/v1/features/notifications/components/Notifications.tsx";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore.ts";
import { normalizeNotificationKey } from "@/v1/features/notifications/lib/types.ts";

const NotificationsPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { setActiveTab, fetchInbox } = useNotificationStore();

  useEffect(() => {
    const { tabKey, tag } = normalizeNotificationKey(key);
    setActiveTab(tabKey);
    fetchInbox(tag).catch(() => {});
  }, [key, setActiveTab, fetchInbox]);

  return (
    <div className="w-full h-full grid">
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
