/* eslint-disable @typescript-eslint/no-unused-vars */
import AuthApi from "@/v1/api/AuthApi";
import {
  // Home,
  LayoutDashboard,
  Heart,
  Bell,
  FileText,
  MessageCircle,
  BarChart2,
  Settings,
  LogOut,
  MonitorUp,
  Sprout,
  Activity,
  Library,
} from "lucide-react";

export interface SidebarItem {
  id: number;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  function?: () => void;
}

const logout = async () => {
  try {
    const response = await AuthApi.getInstance().serverLogout();

    if (response.error) {
      AuthApi.getInstance().clearLocalStorage();
      return false;
    }
  } catch (error) {
    AuthApi.getInstance().clearLocalStorage();

    return false;
  }
};

const adminSidebarData: SidebarItem[] = [
  {
    id: 0,
    title: "Dashboard   ",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 1,
    title: "Farmers",
    path: "/farmers",
    icon: Sprout,
  },
  {
    id: 2,
    title: "Investors",
    path: "/investors",
    icon: Heart,
  },
  {
    id: 3,
    title: "Beehives",
    path: "/beehives",
    icon: Heart,
  },
  {
    id: 4,
    title: "Finance",
    path: "/finance",
    icon: MonitorUp,
  },
  {
    id: 6,
    title: "Records",
    path: "/records",
    icon: BarChart2,
  },
  {
    id: 7,
    title: "Impact",
    path: "/impact",
    icon: Activity,
  },
  {
    id: 8,
    title: "Resources",
    path: "/resources",
    icon: Library,
  },
  {
    id: 9,
    title: "Communication",
    path: "/communication",
    icon: MessageCircle,
  },
];

const sidebarData: SidebarItem[] = [
  {
    id: 2,
    title: "Portfolio",
    path: "/portfolio",
    icon: LayoutDashboard,
  },
  {
    id: 3,
    title: "Impact",
    path: "/impact",
    icon: Heart,
  },
  {
    id: 4,
    title: "Notification",
    path: "/notification",
    icon: Bell,
  },
  {
    id: 6,
    title: "Resources",
    path: "/resources",
    icon: FileText,
  },
];

const reportside: SidebarItem[] = [
  {
    id: 7,
    title: "Feedback",
    path: "/feedback",
    icon: MessageCircle,
  },
  {
    id: 8,
    title: "Financial Performance",
    path: "/financial-performance",
    icon: BarChart2,
  },
];

const settingsside: SidebarItem[] = [
  {
    id: 15,
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    id: 16,
    title: "Logout",
    path: "#",
    icon: LogOut,
    function: () => logout(),
  },
];
export { adminSidebarData, sidebarData, reportside, settingsside };
