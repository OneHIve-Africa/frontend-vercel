import React, { useState } from "react";
// import { Button } from "@/components/Button.tsx";
import {
  Bell,
  MessageCircleMore,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const CommunicationLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Notifications");

  const tabs = [
    {
      key: "Notifications",
      label: "Notifications",
      count: 4,
      icon: <Bell className={"w-5 h-5"} />,
      link: "/communication"
    },
    {
      key: "Messages",
      label: "Direct Messages",
      count: 2,
      icon: <MessageCircleMore className={"w-5 h-5"} />,
      link: "messages"
    },
  ];

  return (
    <div className={"flex w-full h-full gap-5"}>
      <div className="w-1/4 p-4 bg-white rounded shadow">
        {/* <Button className="block w-full p-2 mb-4 text-white bg-oha_secondary hover:bg-oha_secondary/90 h-10 rounded">
          Mark all as read

        </Button> */}
        <ul>
          {tabs.map((tab) => (
            <>
              <Link
              to={tab.link}
                key={tab.key}
                className={`flex justify-between px-3 py-4 cursor-pointer rounded text-sm mx-3 ${
                  activeTab === tab.key ? "bg-green-100 text-green-700" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className={"flex items-center gap-5"}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>

                <span className={"mr-3"}>{tab.count}</span>
              </Link>
            </>
          ))}
        </ul>
      </div>

      <div className={"w-4/5 max-w-4/5"}>
        <Outlet />
      </div>
    </div>
  );
};

export default CommunicationLayout;
