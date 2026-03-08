// Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "@/v1/context/SidebarContext";
import NetworkStatusIndicator from "./NetworkStatusIndicator";
import BumbleChatbot from "@/v1/components/common/BumbleChatbot";

const Layout: React.FC = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 bg-white">
        <Sidebar />
        <div
          className={`bg-white uid pt-14 flex flex-1 flex-col transition-all duration-300 ${isOpen ? "md:pl-[16rem]" : "md:pl-[5rem]"
            }`}
        >
          <main className="flex flex-1 flex-col p-6 relative bg-gray-100 min-h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <NetworkStatusIndicator />
      <BumbleChatbot />
    </div>
  );
};

export default Layout;
