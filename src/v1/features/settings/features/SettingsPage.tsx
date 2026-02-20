import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const settingsNav = [
  { name: "Profile Information", path: "/settings/profile" },
  { name: "Notification Preferences", path: "/settings/notifications" },
  { name: "Account Actions", path: "/settings/account" },
];

const SettingsPage: React.FC = () => {
  return (
    <div className="py-8 px-5 min-h-full rounded-xl">
      <div className="flex gap-10">
        <aside className="w-1/4 bg-white rounded-xl min-h-[700px] px-5 py-10">
          <h1 className="text-xl font-medium mb-8">Settings</h1>
          <nav className="flex flex-col space-y-2 h-full ">
            {settingsNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-left ${
                    isActive
                      ? "bg-oha_secondary/10 text-oha_secondary/80 font-medium"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="w-3/4 bg-white p-8 rounded-xl shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
