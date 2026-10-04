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
import ReactDOM from "react-dom";
import { Bell, X, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { logo } from "@/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/Popover";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";
import { LogOut, ChevronDown, User, Sliders } from "lucide-react";
import GlobalInvestmentAlert from "@/v1/components/common/GlobalInvestmentAlert";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore";
import type {
  Notification,
  NotificationStore,
} from "@/v1/features/notifications/lib/types";

// Lightweight notifications UI for local + future API-backed notifications

/** Map a notification group to a colour scheme */
const groupStyle = (group: string): { bg: string; text: string; dot: string } => {
  switch (group) {
    case "Investment":
    case "Investment Updates":
      return { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" };
    case "Performance":
    case "Performance Alerts":
      return { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" };
    case "Important":
      return { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" };
    case "Direct Messages":
    case "DMS":
      return { bg: "bg-sky-50", text: "text-sky-800", dot: "bg-sky-500" };
    case "Events":
      return { bg: "bg-violet-50", text: "text-violet-800", dot: "bg-violet-500" };
    default:
      return { bg: "bg-stone-100", text: "text-stone-700", dot: "bg-stone-400" };
  }
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

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

  const onOpen = () => setOpen(true);

  const drawer = open ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 180ms ease" }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <aside
        className="fixed right-0 top-0 z-[1201] flex flex-col h-full w-[360px] max-w-[95vw] bg-white shadow-2xl"
        style={{ animation: "slideInRight 220ms cubic-bezier(0.25,0.46,0.45,0.94)" }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="shrink-0 px-5 pt-5 pb-4 bg-oha_secondary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/15 border border-white/20">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                  Notifications
                </h2>
                {unread > 0 && (
                  <p className="text-[11px] text-green-100 mt-0.5">
                    {unread} unread message{unread !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read && !n.actionRequired) && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-[11px] font-semibold text-white/90 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Unread count pill */}
          {unread > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                {unread} new since your last visit
              </span>
            </div>
          )}
        </div>

        {/* ── Notification list ───────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-stone-50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl select-none">
                🐝
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">All clear!</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Your hive is quiet. New investment alerts, yield reports, and announcements will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {notifications.map((n: Notification) => {
                const gs = groupStyle(n.group);
                const handleClick = () => {
                  setNotificationRead(n.id);
                  setOpen(false);
                  navigate(n.route ?? `/notification/message/${n.id}`);
                };
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={handleClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClick();
                      }
                    }}
                    className={`relative rounded-2xl p-4 cursor-pointer border transition-all duration-150 ${
                      n.read
                        ? "bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-xs"
                        : "bg-white border-stone-200 shadow-xs hover:shadow-sm hover:border-stone-300"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!n.read && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#1b9d3c]" />
                    )}

                    {/* Group pill + time */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${gs.bg} ${gs.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${gs.dot}`} />
                        {n.group}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>

                    {/* Title */}
                    <p className={`text-sm font-semibold leading-snug ${n.read ? "text-stone-600" : "text-stone-900"}`}>
                      {n.title}
                    </p>

                    {/* Message */}
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    {/* CTA */}
                    {n.actionRequired && (
                      <div className="mt-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1b9d3c] text-white hover:bg-[#157a2e] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotificationRead(n.id);
                            setOpen(false);
                            if (n.route) navigate(n.route);
                          }}
                        >
                          {n.ctaLabel || "Take action"}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="shrink-0 px-4 py-3.5 border-t border-stone-200 bg-white">
          <Link
            to="/notification"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Open full inbox
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        className="relative h-fit p-2 rounded-xl hover:bg-stone-100 transition-colors"
        onClick={onOpen}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 fill-oha_primary stroke-oha_primary" />
        {unread > 0 && (
          <div className="absolute -right-0.5 -top-0.5">
            <span className="relative inline-flex">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold h-4 min-w-4 px-1 leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            </span>
          </div>
        )}
      </button>

      {typeof document !== "undefined" && ReactDOM.createPortal(drawer, document.body)}
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
    email?: string;
  };

  const { logout } = useAuthStore();
  const profile = rawProfile as EnhancedProfile;
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const isAdmin =
    profile?.role === "admin" ||
    profile?.position === "Administrator" ||
    storedRole === "admin";

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const avatarSeed =
    profile?.email ||
    (profile?.first_name ? `${profile.first_name}-${profile.last_name}` : "admin");
  const defaultAvatar = `https://blobatar.dev/avatar/${encodeURIComponent(avatarSeed)}`;
  const avatarSrc =
    profile?.profile_image_url && profile.profile_image_url.trim() !== ""
      ? profile.profile_image_url
      : defaultAvatar;

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
        className={`w-full ${!isOnboarding ? "fixed" : ""
          } flex h-16 shrink-0 items-center gap-2 bg-white px-4`}
      >
        <Link to="/" className="pl-5">
          <img src={logo} alt="Logo" className="h-8 mt-3" />
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <HeaderNotifications />

          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 p-1 pr-2 rounded-full md:rounded-xl hover:bg-stone-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-oha_primary/30 select-none group text-left border-none bg-transparent"
                aria-label="User navigation menu"
              >
                <Avatar className="w-9 h-9 ring-2 ring-stone-200 group-hover:ring-oha_primary transition-all shrink-0">
                  <AvatarImage
                    src={avatarSrc}
                    alt={profile ? `${profile.first_name} ${profile.last_name}` : "User"}
                  />
                  <AvatarFallback className="text-white bg-oha_primary font-bold text-xs">
                    {isLoading
                      ? "..."
                      : getInitials(profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col min-w-0 leading-tight">
                  <h2 className="text-sm font-semibold text-stone-900 truncate max-w-[140px]">
                    {isLoading
                      ? "Loading..."
                      : profile
                        ? `${profile.first_name} ${profile.last_name}`
                        : "User"}
                  </h2>
                  <h3 className="text-xs font-medium text-oha_primary truncate">
                    {isAdmin ? "Administrator" : "Investor"}
                  </h3>
                </div>
                <ChevronDown
                  className={`hidden md:block w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-64 p-1.5 bg-white border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/10 z-[100] outline-none"
            >
              {/* Header profile info inside popover */}
              <div className="px-3 py-2.5 mb-1 border-b border-stone-100 bg-stone-50/80 rounded-xl">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "My Account"}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isAdmin ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {isAdmin ? "Admin" : "Investor"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">
                  {profile?.email || (isAdmin ? "admin@onehive.africa" : "investor@onehive.africa")}
                </p>
              </div>

              <div className="flex flex-col gap-0.5">
                {/* 1. Actual Personal Profile Settings */}
                <Link
                  to="/settings/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 hover:text-oha_primary hover:bg-stone-50 transition-colors"
                >
                  <div className="p-1 rounded-lg bg-stone-100 text-stone-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-semibold text-stone-800 text-xs">Profile Settings</span>
                    <span className="text-[10px] text-stone-400">Personal info, photo & password</span>
                  </div>
                </Link>

                {/* 2. Admin System Settings (User Access Controls, Audit Logs, etc.) */}
                {isAdmin && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 hover:text-amber-800 hover:bg-amber-50/70 transition-colors"
                  >
                    <div className="p-1 rounded-lg bg-amber-100/70 text-amber-800">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="font-semibold text-stone-800 text-xs">System Settings</span>
                      <span className="text-[10px] text-stone-400">User access, audit logs & config</span>
                    </div>
                  </Link>
                )}

                <div className="my-1 h-px bg-stone-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left cursor-pointer w-full"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Logout</span>
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
