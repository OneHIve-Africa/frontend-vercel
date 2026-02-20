import {Notification} from "@/v1/features/notifications/lib/types.ts";

const sampleNotifications: Notification[] = [
  {
    id: "1",
    group: "Investment",
    title: "Investment Update",
    message: "Hello Kwame, we have update for you on Hive 1920",
    timestamp: "8:38 AM",
  },
  {
    id: "2",
    group: "Performance",
    title: "Performance Review",
    message: "Your portfolio has gained 5% this week.",
    timestamp: "8:00 AM",
  },
  {
    id: "3",
    group: "Spam",
    title: "Suspicious Activity",
    message: "We noticed unusual activity on your account.",
    timestamp: "7:45 AM",
  },
  {
    id: "4",
    group: "Investment",
    title: "Investment Alert",
    message: "New investment opportunity in renewable energy.",
    timestamp: "7:30 AM",
  },
];

export {sampleNotifications}