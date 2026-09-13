import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import {
  adminSidebarData,
  reportside,
  sidebarData,
  SidebarItem,
} from "./data";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";
import { useSidebar } from "@/v1/context/SidebarContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfileStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => void | Promise<unknown>) | null
  >(null);
  const [confirmTitle, setConfirmTitle] = useState<string>("Are you sure?");
  const [confirmDesc, setConfirmDesc] = useState<string>("");
  const { logout } = useAuthStore();
  const { isOpen, toggleSidebar } = useSidebar();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = profile?.position === "Administrator";
  const brandColorBg = isAdmin ? "bg-oha_secondary" : "bg-oha_primary";

  const handleLogoutClick = () => {
    setPendingAction(() => async () => {
      const success = await logout();
      if (success) navigate("/login");
      return success;
    });
    setConfirmTitle("Buzzing off?");
    setConfirmDesc(
      "You're about to log out. Save your work so the hive stays happy."
    );
    setConfirmOpen(true);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const sidebarVariants: Variants = {
    desktopExpanded: {
      width: "16rem",
      left: "0rem",
      top: "4rem",
      height: "calc(100vh - 4rem)",
      borderRadius: "0px",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "1.25rem",
      paddingBottom: "1.25rem",
      boxShadow: "4px 0 24px -2px rgba(0, 0, 0, 0.05)",
      borderWidth: "1px",
      borderColor: "rgba(243, 244, 246, 1)",
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 30,
        mass: 0.8,
      },
    },
    desktopCollapsed: {
      width: "3.75rem",
      left: "0.875rem",
      top: "4.75rem",
      height: "calc(100vh - 6rem)",
      borderRadius: "2.25rem",
      paddingLeft: "0.375rem",
      paddingRight: "0.375rem",
      paddingTop: "0.875rem",
      paddingBottom: "0.875rem",
      boxShadow:
        "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      borderWidth: "1px",
      borderColor: "rgba(229, 231, 235, 0.85)",
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 30,
        mass: 0.8,
      },
    },
    mobileOpen: {
      width: "16rem",
      left: "0rem",
      top: "4rem",
      height: "calc(100vh - 4rem)",
      borderRadius: "0px",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "1.25rem",
      paddingBottom: "1.25rem",
      boxShadow: "4px 0 24px -2px rgba(0, 0, 0, 0.15)",
      x: "0%",
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 32,
      },
    },
    mobileClosed: {
      width: "16rem",
      left: "0rem",
      top: "4rem",
      height: "calc(100vh - 4rem)",
      borderRadius: "0px",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "1.25rem",
      paddingBottom: "1.25rem",
      boxShadow: "none",
      x: "-110%",
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 32,
      },
    },
  };

  const currentVariant = isMobile
    ? isOpen
      ? "mobileOpen"
      : "mobileClosed"
    : isOpen
    ? "desktopExpanded"
    : "desktopCollapsed";

  const renderNavItem = (item: SidebarItem) => {
    const isActive = location.pathname.startsWith(item.path);

    return (
      <li key={item.id} className="relative w-full flex justify-center">
        <NavLink
          to={item.path}
          title={!isOpen ? item.title.trim() : undefined}
          className={`group relative flex items-center transition-all duration-200 cursor-pointer ${
            isOpen
              ? `w-full py-2.5 px-3 rounded-xl gap-3 ${
                  isActive
                    ? `${brandColorBg} text-white font-medium shadow-sm`
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                }`
              : `w-11 h-11 rounded-full justify-center ${
                  isActive
                    ? `${brandColorBg} text-white shadow-sm ring-2 ring-stone-100`
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`
          }`}
        >
          <item.icon
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
              isActive
                ? "text-white"
                : "text-stone-500 group-hover:scale-110 group-hover:text-stone-900"
            }`}
          />

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -6 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -6 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="truncate text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.title.trim()}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && !isOpen && <span className="sr-only">(Active)</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Single Unified Animated Aside ─────────────────────────── */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={currentVariant}
        className="fixed z-40 bg-white flex flex-col justify-between overflow-visible"
        aria-label="Navigation Sidebar"
      >
        {/* Main Navigation Items (Top scrollable area) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full no-scrollbar flex flex-col items-center py-1">
          {isAdmin ? (
            <ul className="flex flex-col w-full gap-1.5">
              {adminSidebarData.map(renderNavItem)}
            </ul>
          ) : (
            <div className="flex flex-col w-full">
              <ul className="flex flex-col w-full gap-1.5">
                {sidebarData.map(renderNavItem)}
              </ul>

              <div
                className={`my-2.5 h-px bg-stone-200/70 transition-all duration-300 ${
                  isOpen ? "mx-3" : "mx-auto w-6"
                }`}
              />

              <ul className="flex flex-col w-full gap-1.5">
                {reportside.map(renderNavItem)}
              </ul>
            </div>
          )}
        </div>

        {/* ── Bottom Utility Items: Settings, Logout, Avatar ─────── */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-2.5 border-t border-stone-100 shrink-0">
          {/* Settings */}
          <div className="w-full flex justify-center">
            <NavLink
              to={isAdmin ? "/admin/settings" : "/settings"}
              title={!isOpen ? "Settings" : undefined}
              className={({ isActive }) =>
                `group flex items-center transition-all duration-200 cursor-pointer ${
                  isOpen
                    ? `w-full py-2.5 px-3 rounded-xl gap-3 ${
                        isActive
                          ? `${brandColorBg} text-white font-medium shadow-sm`
                          : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                      }`
                    : `w-11 h-11 rounded-full justify-center ${
                        isActive
                          ? `${brandColorBg} text-white shadow-sm ring-2 ring-stone-100`
                          : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      }`
                }`
              }
            >
              <Settings className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-45" />
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, x: -6 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -6 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="truncate text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </div>

          {/* Logout */}
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={handleLogoutClick}
              title={!isOpen ? "Log out" : undefined}
              className={`group flex items-center transition-all duration-200 cursor-pointer ${
                isOpen
                  ? "w-full py-2.5 px-3 rounded-xl gap-3 text-stone-600 hover:text-rose-600 hover:bg-rose-50/80"
                  : "w-11 h-11 rounded-full justify-center text-stone-500 hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, x: -6 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -6 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="truncate text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Log out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* User Profile Avatar / Card */}
          <div className="w-full flex justify-center mt-1">
            <div
              onClick={() =>
                navigate(isAdmin ? "/admin/settings" : "/settings")
              }
              title={
                !isOpen
                  ? `${profile?.first_name || "User"} Profile`
                  : undefined
              }
              className={`cursor-pointer transition-all duration-200 flex items-center ${
                isOpen
                  ? "w-full p-2 rounded-2xl gap-3 bg-stone-50/80 hover:bg-stone-100 border border-stone-200/60"
                  : "p-0.5 hover:scale-105"
              }`}
            >
              <Avatar className="w-10 h-10 ring-2 ring-stone-200 hover:ring-oha_primary transition-all shrink-0">
                {profile?.profile_image_url ? (
                  <AvatarImage src={profile.profile_image_url} alt="Profile" />
                ) : (
                  <AvatarFallback
                    className={`text-xs font-bold text-white ${brandColorBg}`}
                  >
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: -6 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -6 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="flex flex-col min-w-0 overflow-hidden leading-tight text-left"
                  >
                    <span className="text-sm font-semibold text-stone-900 truncate">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className="text-xs text-stone-500 truncate">
                      {isAdmin ? "Administrator" : "Investor"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Floating toggle button anchored on right border */}
        <motion.button
          onClick={toggleSidebar}
          className="absolute top-6 -right-3 z-50 h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:text-gray-900 hover:bg-gray-50 focus:outline-none cursor-pointer flex"
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.aside>

      {/* Action Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setConfirmOpen(false)}
          />
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-yellow-100/80 flex items-center justify-center border border-yellow-200/50">
                  <span className="text-2xl" role="img" aria-label="bee">
                    🐝
                  </span>
                </div>
                <div className="pt-1">
                  <h2 className="text-lg font-semibold text-gray-900 leading-none">
                    {confirmTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {confirmDesc || "Do you want to continue with this action?"}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                  onClick={() => setConfirmOpen(false)}
                >
                  Stay signed in
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-oha_primary text-white hover:bg-oha_primary/90 focus:outline-none focus:ring-2 focus:ring-oha_primary focus:ring-offset-2 transition-colors shadow-sm"
                  onClick={async () => {
                    try {
                      const result = pendingAction?.();
                      if (result instanceof Promise) {
                        await result;
                      }
                    } finally {
                      setConfirmOpen(false);
                      setPendingAction(null);
                    }
                  }}
                >
                  Yes, log me out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helper style for hiding scrollbars but keeping functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
