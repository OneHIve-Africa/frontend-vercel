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

export const normalizeNotificationKey = (
  key?: string
): { tabKey: string; tag: AllowedInboxTag } => {
  const normalized = (key || "investment-updates").toLowerCase().replace(/_/g, "-");

  switch (normalized) {
    case "investment":
    case "investments":
    case "investment-updates":
      return { tabKey: "investment-updates", tag: "Investment Updates" };

    case "performance":
    case "performance-alerts":
      return { tabKey: "performance-alerts", tag: "Performance Alerts" };

    case "draft":
    case "event":
    case "events":
    case "upcoming-events":
      return { tabKey: "events", tag: "Events" };

    case "spam":
    case "announcement":
    case "announcements":
      return { tabKey: "announcements", tag: "Announcements" };

    case "dms":
    case "dm":
    case "message":
    case "messages":
    case "direct-messages":
      return { tabKey: "direct-messages", tag: "Direct Messages" };

    case "important":
      return { tabKey: "important", tag: "Important" };

    default:
      return { tabKey: "investment-updates", tag: "Investment Updates" };
  }
};

export type { Notification, NotificationStore, AllowedInboxTag };
