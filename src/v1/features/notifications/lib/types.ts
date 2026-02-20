type AllowedInboxTag =
  | "Investment Updates"
  | "Performance Alerts"
  | "Events"
  | "Announcements"
  | "Direct Messages"
  | "Important";

type Notification = {
    id: string;
    group:
      | "Investment"
      | "Performance"
      | "Important"
      | "Draft"
      | "Spam"
      | "Bin"
      | "DMS"
      | AllowedInboxTag;
    title: string;
    message: string;
    timestamp: string;
    // Optional read state and action metadata
    read?: boolean; // default false
    actionRequired?: boolean; // if true, should not auto-mark as read on drawer open
    ctaLabel?: string; // label to show on CTA button
    route?: string; // route to navigate to on CTA
  };

  type NotificationStore = {
    notifications: Notification[];
    filteredNotifications: Notification[];
    activeTab: string;
    fetchNotifications: () => void;
    setActiveTab: (tab: string) => void;
    // New fields/methods for local notifications
    unreadCount: number;
    addNotification: (notif: Notification) => void;
    markAllRead: () => void; // marks all non-actionRequired as read
    setNotificationRead: (id: string) => void;
  };

export type { Notification, NotificationStore, AllowedInboxTag }

