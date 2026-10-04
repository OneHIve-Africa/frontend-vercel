import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SystemConfigForm from "../components/SystemConfigForm";
import UserAccessTable from "../components/UserAccessTable";
import AuditLogViewer from "../components/AuditLogViewer";
import LoginSettingsForm from "../components/LoginSettingsForm";
import BackupRecovery from "../components/BackupRecovery";

import { Link } from "react-router-dom";
import { User, ArrowRight } from "lucide-react";

interface TabItem {
  name: string;
  id: number;
}

const SettingsPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<number>(0);

  const tabData: TabItem[] = [
    { name: "User Access Controls", id: 0 },
    { name: "Audit Logs", id: 1 },
    { name: "Login Settings", id: 2 },
    { name: "Backup and Data Recovery", id: 3 },
    { name: "System Configuration", id: 4 },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            System Administration & Settings
          </h2>
          <p className="text-xs text-gray-500">
            Manage user access controls, compliance audit logs, and security parameters
          </p>
        </div>

        <Link
          to="/settings/profile"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors shrink-0"
          title="Go to your personal Profile Settings"
        >
          <User className="w-3.5 h-3.5 text-stone-500" />
          <span>My Profile Settings</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      <motion.div
        className="w-full bg-white rounded-xl shadow-2xs border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Tab Menu */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          {tabData.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`px-6 py-4 text-xs font-medium transition cursor-pointer whitespace-nowrap border-b-2 ${
                activeMenu === item.id
                  ? "border-oha_primary text-oha_primary font-bold bg-orange-50/20"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeMenu === 0 ? (
                <UserAccessTable />
              ) : activeMenu === 1 ? (
                <AuditLogViewer />
              ) : activeMenu === 2 ? (
                <LoginSettingsForm />
              ) : activeMenu === 3 ? (
                <BackupRecovery />
              ) : (
                <SystemConfigForm />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
