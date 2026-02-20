
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  adminSidebarData,
  reportside,
  settingsside,
  sidebarData,
  SidebarItem,
} from "./data";
import { Separator } from "@/components/Separator";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/Sidebar";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfileStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<unknown>) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState<string>("Are you sure?");
  const [confirmDesc, setConfirmDesc] = useState<string>("");
  const { logout } = useAuthStore();
  const renderNavItems = (items: SidebarItem[]) => {
    return items.map((item) => {
      const isActive = location.pathname.startsWith(item.path);

      return (
        <SidebarMenuItem key={item.id} className="flex">
          {isActive && (
            <div
              className={`h-full w-1 rounded-r-xl  cursor-pointer ${
                profile?.position == "Administrator"
                  ? "bg-oha_secondary"
                  : "bg-oha_primary"
              }`}
            ></div>
          )}

          <SidebarMenuButton asChild>
            {item.function ? (
              <button
                onClick={() => {
                  // Open confirmation when invoking function actions (e.g., Logout)
                  const isLogout = /log\s*out|sign\s*out|logout|signout/i.test(
                    item.title || ""
                  );
                  if (isLogout) {
                    // Use app's auth store logout which handles refresh token and local state; navigate on success
                    setPendingAction(() => async () => {
                      const success = await logout();
                      if (success) navigate("/login");
                      return success;
                    });
                  } else {
                    // Fallback to item's provided action
                    setPendingAction(() => item.function!);
                  }
                  // Bee-themed copy if looks like a logout action
                  if (isLogout) {
                    setConfirmTitle("Buzzing off?");
                    setConfirmDesc(
                      "You're about to log out. Save your work so the hive stays happy."
                    );
                  } else {
                    setConfirmTitle("Are you sure?");
                    setConfirmDesc("");
                  }
                  setConfirmOpen(true);
                }}
                className={` flex w-full items-center cursor-pointer gap-3 ml-5 py-5 ${
                  isActive
                    ? `${
                        profile?.position == "Administrator"
                          ? "bg-oha_secondary "
                          : "bg-oha_primary"
                      } text-white`
                    : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            ) : (
              <NavLink
                to={item.path}
                className={` flex w-full items-center gap-3 ml-5 py-5 ${
                  isActive
                    ? `${
                        profile?.position == "Administrator"
                          ? "bg-oha_secondary "
                          : "bg-oha_primary"
                      } text-white`
                    : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium cursor-pointer">
                  {item.title}
                </span>
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <ShadcnSidebar collapsible="icon" className="bg-white border-none mt-16">
      <SidebarContent className="h-full pr-10 pt-16 bg-white">
        {profile?.position == "Administrator" ? (
          <>
            <SidebarMenu>
              {renderNavItems([...adminSidebarData, ...settingsside])}
            </SidebarMenu>
          </>
        ) : (
          <>
            <SidebarMenu>{renderNavItems(sidebarData)}</SidebarMenu>

            <Separator className="my-3 opacity-20" />

            <SidebarMenu>{renderNavItems(reportside)}</SidebarMenu>

            <Separator className="my-3 opacity-20" />

            <SidebarMenu>{renderNavItems(settingsside)}</SidebarMenu>
          </>
        )}
      </SidebarContent>

      <SidebarRail />
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConfirmOpen(false)}
          />
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200"
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-xl">🐝</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {confirmTitle}
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {confirmDesc || "Do you want to continue?"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50"
                  onClick={() => setConfirmOpen(false)}
                >
                  Stay signed in
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-full bg-oha_primary text-white hover:opacity-90"
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
    </ShadcnSidebar>
  );
};

export default Sidebar;
