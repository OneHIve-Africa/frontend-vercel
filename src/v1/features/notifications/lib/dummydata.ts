import { Notification } from "@/v1/features/notifications/lib/types.ts";

const sampleNotifications: Notification[] = [
  {
    id: "1",
    group: "Investment Updates",
    title: "Apiary Colonization Milestone",
    message: "Your hives in the Hohoe Apiary cluster have reached 92% colonization with thriving African honeybee colonies.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    route: "/portfolio",
  },
  {
    id: "2",
    group: "Performance Alerts",
    title: "Quarterly Honey Yield Projection",
    message: "Nectar flow models for the upcoming season project a 15% increase in total raw honey extraction.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    route: "/financial-performance",
  },
  {
    id: "3",
    group: "Announcements",
    title: "Annual Volta Apiary Field Day",
    message: "Join our farm managers and local beekeepers on October 14 for an on-site apiary inspection and honey tasting.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: "4",
    group: "Investment Updates",
    title: "New High-Yield Apiary Site Open",
    message: "A new cooperative site in the Eastern Region has opened for hive allocation with guaranteed off-take.",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    route: "/new-investment",
  },
];

export { sampleNotifications };