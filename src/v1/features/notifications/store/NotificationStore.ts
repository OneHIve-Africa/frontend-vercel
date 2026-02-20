import { create } from "zustand";
import { Notification, NotificationStore, AllowedInboxTag } from "@/v1/features/notifications/lib/types.ts";
import { sampleNotifications } from "@/v1/features/notifications/lib/dummydata.ts";
import NotificationsApi, { InboxMessage } from "@/v1/api/NotificationsApi";

const LOCAL_KEY = "localNotifications";

const loadLocal = (): Notification[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const arr: Notification[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const computeUnread = (list: Notification[]) =>
  list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

export const useNotificationStore = create<NotificationStore & {
  isLoading: boolean;
  error?: string | null;
  fetchInbox: (tag?: AllowedInboxTag) => Promise<void>;
  fetchInboxAll: () => Promise<void>;
}>((set, get) => ({
  notifications: loadLocal(),
  filteredNotifications: [],
  activeTab: "Investment",
  unreadCount: computeUnread(loadLocal()),
  isLoading: false,
  error: null,
  // legacy local loader (kept for fallback/dev)
  fetchNotifications: () => {
    setTimeout(() => {
      set((state) => ({
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications.filter(
          (notif) => notif.group === state.activeTab
        ),
      }));
    }, 600);
  },
  // New API-powered inbox loader (optionally by tag)
  fetchInbox: async (tag?: AllowedInboxTag) => {
    set({ isLoading: true, error: null });
    try {
      const api = NotificationsApi.getInstance();
      const resp = await api.getInbox(tag);
      if (resp.error) throw new Error(resp.error);
      const data = Array.isArray(resp.data) ? resp.data : [];
      const allowedInboxTags: AllowedInboxTag[] = [
        "Investment Updates",
        "Performance Alerts",
        "Events",
        "Announcements",
        "Direct Messages",
        "Important",
      ];
      const normalized: Notification[] = data.map((m: InboxMessage) => {
        const rawTag = (m.tag ?? "").toString();
        const group: AllowedInboxTag = (allowedInboxTags as readonly string[]).includes(rawTag)
          ? (rawTag as AllowedInboxTag)
          : "Announcements";
        return {
          id: String(m.id),
          group,
          title: m.title || "",
          message: m.content || "",
          timestamp: m.created_at || new Date().toISOString(),
          read: !!m.read,
          route: m.cta_link || undefined,
        };
      });
      // Replace local cache with latest from API
      set((state) => {
        const merged = normalized; // simple replace; could merge if needed
        const keyToTag: Record<string, AllowedInboxTag> = {
          Investment: "Investment Updates",
          Performance: "Performance Alerts",
          Draft: "Events",
          Spam: "Announcements",
          DMS: "Direct Messages",
          Important: "Important",
        };
        const desired = keyToTag[state.activeTab] ?? (state.activeTab as AllowedInboxTag);
        const filtered = merged.filter((n) => n.group === desired);
        const nextUnread = computeUnread(merged);
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
        } catch {
          // Ignore localStorage quota or availability issues
        }
        return {
          notifications: merged,
          filteredNotifications: filtered,
          unreadCount: nextUnread,
          isLoading: false,
        } as Partial<NotificationStore> & { isLoading: boolean };
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load inbox";
      set({ error: message, isLoading: false });
    }
  },
  // Load entire inbox (no tag) so counts across tabs remain accurate
  fetchInboxAll: async () => {
    const { fetchInbox } = get();
    await fetchInbox(undefined);
  },
  setActiveTab: (tab) =>
    set((state) => {
      const keyToTag: Record<string, AllowedInboxTag> = {
        Investment: "Investment Updates",
        Performance: "Performance Alerts",
        Draft: "Events",
        Spam: "Announcements",
        DMS: "Direct Messages",
        Important: "Important",
      };
      const desired = keyToTag[tab] ?? (tab as unknown as AllowedInboxTag);
      return {
        activeTab: tab,
        filteredNotifications: state.notifications.filter((notif) => notif.group === desired),
      };
    }),
  addNotification: (notif: Notification) =>
    set((state) => {
      const enriched: Notification = { read: false, ...notif };
      const next = [enriched, ...state.notifications];
      const keyToTag: Record<string, AllowedInboxTag> = {
        Investment: "Investment Updates",
        Performance: "Performance Alerts",
        Draft: "Events",
        Spam: "Announcements",
        DMS: "Direct Messages",
        Important: "Important",
      };
      const desired = keyToTag[state.activeTab] ?? (state.activeTab as AllowedInboxTag);
      const filtered = next.filter((n) => n.group === desired);
      const nextUnread = computeUnread(next);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        // ignore localStorage issues
      }
      return {
        notifications: next,
        filteredNotifications: filtered,
        unreadCount: nextUnread,
      } as Partial<NotificationStore>;
    }),
  markAllRead: async () => {
    const state = get();
    const ids = state.notifications.filter((n) => !n.read && !n.actionRequired).map((n) => n.id);
    if (ids.length === 0) return;
    // optimistic update
    set((s) => {
      const next = s.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
      const keyToTag: Record<string, AllowedInboxTag> = {
        Investment: "Investment Updates",
        Performance: "Performance Alerts",
        Draft: "Events",
        Spam: "Announcements",
        DMS: "Direct Messages",
        Important: "Important",
      };
      const desired = keyToTag[s.activeTab] ?? (s.activeTab as AllowedInboxTag);
      const filtered = next.filter((n) => n.group === desired);
      const nextUnread = computeUnread(next);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch {
        // ignore localStorage issues
      }
      return { notifications: next, filteredNotifications: filtered, unreadCount: nextUnread } as Partial<NotificationStore>;
    });
    try {
      const api = NotificationsApi.getInstance();
      await api.markReadMany(ids);
    } catch {
      // On failure, refresh from server to restore truth
      const { fetchInboxAll } = get();
      fetchInboxAll().catch(() => {});
    }
  },
  setNotificationRead: (id: string) =>
    {
      // optimistic update then sync
      const s = get();
      const next = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const keyToTag: Record<string, AllowedInboxTag> = {
        Investment: "Investment Updates",
        Performance: "Performance Alerts",
        Draft: "Events",
        Spam: "Announcements",
        DMS: "Direct Messages",
        Important: "Important",
      };
      const desired = keyToTag[s.activeTab] ?? (s.activeTab as AllowedInboxTag);
      const filtered = next.filter((n) => n.group === desired);
      const nextUnread = computeUnread(next);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch {
        // ignore localStorage issues
      }
      set({ notifications: next, filteredNotifications: filtered, unreadCount: nextUnread } as Partial<NotificationStore>);
      NotificationsApi.getInstance().markRead(id).catch(() => {
        // Best-effort: refresh from server
        get().fetchInboxAll().catch(() => {});
      });
    },
}));
