type Notification = {
    id: string;
    group: "Investment" | "Performance" | "Important" | "Draft" | "Spam" | "Bin"| "DMS";
    title: string;
    message: string;
    timestamp: string;
  };

  type NotificationStore = {
    notifications: Notification[];
    filteredNotifications: Notification[];
    activeTab: string;
    fetchNotifications: () => void;
    setActiveTab: (tab: string) => void;
  };

export type {Notification, NotificationStore}

