// Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarInset, useSidebar } from "@/components/Sidebar";
import NetworkStatusIndicator from "./NetworkStatusIndicator";

const Layout: React.FC = () => {
  const side = useSidebar();
  // console.log(side.state);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 bg-white">
        <Sidebar />
        <SidebarInset
          className={` bg-white uid pt-14 ${
            side.open ? "md:pl-[16rem]" : "md:pl-[5rem]"
          }`}
        >
          <main className="flex flex-1 p-6 relative bg-gray-100">
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
      <NetworkStatusIndicator />
    </div>
  );
};

export default Layout;
