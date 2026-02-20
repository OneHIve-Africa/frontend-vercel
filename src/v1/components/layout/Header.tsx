// import { AvatarImage, Avatar, AvatarFallback } from "@/components/Avatar";
// import { Bell, X } from "lucide-react";

// const Header = () => {
//   return (
//     <div className="p-3 w-full bg-white flex items-center justify-end gap-5">
//       <div>
//         <button className="relative h-fit">
//           <Bell className="fill-oha_primary stroke-oha_primary h-6 w-6" />
//           <div className="bg-red-600 text-white text-xs h-3 w-3 rounded-full p-2 flex items-center justify-center absolute -top-1 -right-1">
//             6
//           </div>
//         </button>
//       </div>
//       <div className="flex items-center  gap-2">
//         <Avatar>
//           <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
//           <AvatarFallback className="text-white">GM</AvatarFallback>
//         </Avatar>
//         <div>
//           <h2 className="font-semibold text-sm">Gideon Mensah</h2>
//           <h3 className="text-xs">Admin</h3>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;

// Header.tsx
import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { SidebarTrigger } from "@/components/Sidebar";
import { Separator } from "@/components/Separator";
import { logo } from "@/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/Popover";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";
import { Settings, LogOut } from "lucide-react";
import GlobalInvestmentAlert from "@/v1/components/common/GlobalInvestmentAlert";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore";
import type {
  Notification,
  NotificationStore,
} from "@/v1/features/notifications/lib/types";

// Lightweight notifications UI for local + future API-backed notifications
const HeaderNotifications: React.FC = () => {
  const unread = useNotificationStore((s: NotificationStore) => s.unreadCount);
  const notifications = useNotificationStore(
    (s: NotificationStore) => s.notifications
  );
  const markAllRead = useNotificationStore(
    (s: NotificationStore) => s.markAllRead
  );
  const setNotificationRead = useNotificationStore(
    (s: NotificationStore) => s.setNotificationRead
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const onOpen = () => {
    setOpen(true);
  };

  return (
    <div className="relative">
      <button
        className="relative h-fit"
        onClick={onOpen}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 fill-oha_primary stroke-oha_primary" />
        <div className="absolute -right-1 -top-1">
          <span className="relative inline-flex">
            <span
              className={`absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 ${
                unread > 0 ? "animate-ping" : ""
              }`}
            ></span>
            <span className="relative inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-4 min-w-4 px-1">
              {unread}
            </span>
          </span>
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[1200] bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-[1201] h-full w-80 max-w-[90vw] bg-gray-100 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
                  onClick={() => markAllRead()}
                  disabled={!notifications.some((n) => !n.read && !n.actionRequired)}
                  aria-label="Clear non-actionable notifications"
                  title="Clear non-actionable notifications"
                >
                  Clear
                </button>
                <button
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-56px)] p-3 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  You're all caught up.
                </p>
              ) : (
                notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className="rounded bg-white p-3 cursor-pointer hover:shadow"
                    onClick={() => {
                      // Mark as read when user views the message
                      setNotificationRead(n.id);
                      if (n.route) {
                        setOpen(false);
                        navigate(n.route);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setNotificationRead(n.id);
                        if (n.route) {
                          setOpen(false);
                          navigate(n.route);
                        }
                      }
                    }}
                  >
                    <div className="text-xs text-neutral-500 flex items-center justify-between">
                      <span>{n.group}</span>
                      <span>{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-neutral-700">{n.message}</div>
                    {n.actionRequired && (
                      <div className="mt-2">
                        <button
                          className="inline-flex items-center gap-1 rounded bg-oha_primary text-white text-xs px-2 py-1 hover:opacity-90"
                          onClick={() => {
                            if (n.route) navigate(n.route);
                            setNotificationRead(n.id);
                          }}
                        >
                          {n.ctaLabel || "Open"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const location = useLocation();
  const isOnboarding = location.pathname.includes("onboarding");
  const {
    profile: rawProfile,
    fetchProfile,
    isLoading,
  } = useUserProfileStore();

  // Define enhanced profile type with admin-specific properties
  type EnhancedProfile = {
    first_name: string;
    last_name: string;
    profile_image_url?: string;
    role?: string;
    position?: string;
  };

  const profile = rawProfile as EnhancedProfile;
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/login");
    }
  };

  return (
    <header className="w-screen z-30">
      <GlobalInvestmentAlert />
      <div
        className={`w-full ${
          !isOnboarding ? "fixed" : ""
        } flex h-16 shrink-0 items-center gap-2 bg-white px-4`}
      >
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8 mt-3" />
        </Link>

        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 md:hidden" />
        </div>

        <div className="ml-auto flex items-center gap-5">
          <HeaderNotifications />

          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar>
                  {profile?.profile_image_url ? (
                    <AvatarImage
                      src={profile.profile_image_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                    />
                  ) : (
                    <AvatarFallback className="text-white bg-oha_primary">
                      {isLoading
                        ? "..."
                        : profile
                        ? getInitials(profile.first_name, profile.last_name)
                        : ""}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:block">
                  <h2 className="text-sm font-semibold">
                    {isLoading
                      ? "Loading..."
                      : profile
                      ? `${profile.first_name} ${profile.last_name}`
                      : ""}
                  </h2>
                  <h3 className="text-xs font-medium text-oha_primary">
                    {profile?.role === "admin" ||
                    profile?.position === "Administrator"
                      ? "Administrator"
                      : "Investor"}
                  </h3>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 bg-white border-none rounded mt-4 mr-2">
              <div className="flex flex-col">
                <Link
                  to={
                    profile?.role === "admin" ||
                    profile?.position === "Administrator"
                      ? "/admin/settings"
                      : "/settings"
                  }
                  className="flex items-center gap-2 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-oha_primary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-md hover:bg-gray-50 text-red-600 hover:text-red-700 transition-colors text-left cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
