import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SystemConfigForm from "../components/SystemConfigForm";
import UserAccessTable from "../components/UserAccessTable";
import LoginSettingsForm from "../components/LoginSettingsForm";
import BackupRecovery from "../components/BackupRecovery";
import AddAdminModal from "../components/AddAdminModal";

interface TabItem {
  name: string;
  id: number;
}

const SettingsPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<number>(0);
  const [filter, setFilter] = useState<string>("admin"); // Default view: Admin only
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  const tabData: TabItem[] = [
    { name: "User Access Controls", id: 0 },
    { name: "Login Settings", id: 1 },
    { name: "Backup and Data Recovery", id: 2 },
    { name: "System Configuration", id: 3 },
  ];

  const filterOptions = [
    { label: "Admins Only", value: "admin" },
    { label: "Farmers", value: "farmer" },
    { label: "Investors", value: "investor" },
    { label: "All Users", value: "all" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center w-full p-4 mb-4">
        <div className="flex items-center w-72 rounded-full border border-gray-200 px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddAdminOpen(true)}
            className="bg-oha_primary text-white text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer hover:bg-opacity-90"
          >
            Add admin
          </button>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              {filterOptions.find(opt => opt.value === filter)?.label || "Filter"}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filter === option.value ? 'bg-gray-50 text-oha_primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="w-full bg-white rounded-[10px]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Tab Menu */}
        <div className="flex border-b border-[rgba(0,0,0,0.07)]">
          {tabData.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              className={`cursor-pointer px-8 py-6 transition-all duration-300 ${activeMenu === item.id
                  ? "border-b-2 border-oha_primary text-oha_primary font-semibold"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.name}
            </motion.div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeMenu === 0 ? (
                <UserAccessTable filter={filter} />
              ) : activeMenu === 1 ? (
                <LoginSettingsForm />
              ) : activeMenu === 2 ? (
                <BackupRecovery />
              ) : (
                <SystemConfigForm />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <AddAdminModal
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        onSuccess={() => {
          // You could trigger a table refresh here if your table accepts a refresh prop
        }}
      />
    </div>
  );
};

export default SettingsPage;
