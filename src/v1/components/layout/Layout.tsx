// Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "@/v1/context/SidebarContext";
import NetworkStatusIndicator from "./NetworkStatusIndicator";
import NaaChatbot from "@/v1/components/common/NaaChatbot";

const Layout: React.FC = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 bg-gray-100 relative">
        <Sidebar />
        <div
          className={`uid pt-14 flex flex-1 flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isOpen ? "md:pl-[16.5rem]" : "md:pl-[5.25rem]"
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
      <NaaChatbot />
    </div>
  );
};

export default Layout;
