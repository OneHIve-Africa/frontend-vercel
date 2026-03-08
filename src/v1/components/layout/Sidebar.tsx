import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import {
  adminSidebarData,
  reportside,
  settingsside,
  sidebarData,
  SidebarItem,
} from "./data";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";
import { useSidebar } from "@/v1/context/SidebarContext";

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

  const renderNavItems = (items: SidebarItem[]) => {
    return items.map((item) => {
      const isActive = location.pathname.startsWith(item.path);
      const isLogout = /log\s*out|sign\s*out|logout|signout/i.test(
        item.title || ""
      );

      const navClass = `group flex items-center cursor-pointer gap-3 py-3 transition-all duration-200 ${isActive
        ? `${profile?.position == "Administrator"
          ? "bg-oha_secondary"
          : "bg-oha_primary"
        } text-white font-medium shadow-sm`
        : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
        } ${isOpen ? "pl-4 pr-3 mx-3 rounded-lg" : "justify-center mx-2 rounded-lg"}`;

      return (
        <li key={item.id} className="relative w-full mb-1">
          {/* Active indicator line */}
          {isActive && isOpen && (
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-xl ${profile?.position == "Administrator"
                ? "bg-oha_secondary"
                : "bg-oha_primary"
                }`}
            ></div>
          )}

          {item.function ? (
            <button
              onClick={() => {
                if (isLogout) {
                  setPendingAction(() => async () => {
                    const success = await logout();
                    if (success) navigate("/login");
                    return success;
                  });
                  setConfirmTitle("Buzzing off?");
                  setConfirmDesc(
                    "You're about to log out. Save your work so the hive stays happy."
                  );
                } else {
                  setPendingAction(() => item.function!);
                  setConfirmTitle("Are you sure?");
                  setConfirmDesc("");
                }
                setConfirmOpen(true);
              }}
              className={navClass}
              title={!isOpen ? item.title : undefined}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900"
                  } ${!isOpen && "group-hover:scale-110"}`}
              />
              {isOpen && (
                <span className="truncate text-sm whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={navClass}
              title={!isOpen ? item.title : undefined}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900"
                  } ${!isOpen && "group-hover:scale-110"}`}
              />
              {isOpen && (
                <span className="truncate text-sm whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </NavLink>
          )}
        </li>
      );
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col py-6 overflow-hidden ${isOpen ? "w-64 max-w-[80vw]" : "w-0 md:w-20 -translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex-1 overflow-y-auto w-full no-scrollbar">
          <ul className="flex flex-col w-full gap-0.5">
            {profile?.position == "Administrator" ? (
              <>{renderNavItems([...adminSidebarData, ...settingsside])}</>
            ) : (
              <>
                {renderNavItems(sidebarData)}

                {isOpen ? (
                  <div className="mx-4 my-4 h-px bg-gray-100" />
                ) : (
                  <div className="mx-auto w-8 my-4 h-px bg-gray-100" />
                )}

                {renderNavItems(reportside)}

                {isOpen ? (
                  <div className="mx-4 my-4 h-[1px] bg-gray-100" />
                ) : (
                  <div className="mx-auto w-8 my-4 h-[1px] bg-gray-100" />
                )}

                {renderNavItems(settingsside)}
              </>
            )}
          </ul>
        </div>

        {/* Floating toggle button on the border */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-6 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:text-gray-900 focus:outline-none transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
            }`}
          aria-label="Toggle Sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

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
                    <span className="text-2xl" role="img" aria-label="bee">🐝</span>
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
      </aside>

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
