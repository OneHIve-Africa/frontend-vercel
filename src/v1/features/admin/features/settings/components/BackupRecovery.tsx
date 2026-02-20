import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Download } from "lucide-react";
import BackupApi from "../api/BackupApi";
import { toast } from "react-hot-toast";

const BackupRecovery: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await BackupApi.getInstance().downloadBackup();
      if (response.data) {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        // Generate a filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.setAttribute("download", `onehive_backup_${timestamp}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Backup downloaded successfully!");
      } else {
        toast.error("Failed to download backup");
      }
    } catch (error) {
      toast.error("An error occurred during download");
    } finally {
      setDownloading(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to restore from this backup? This action will modify your database.")) {
        e.target.value = ''; // Reset input
        return;
    }

    setUploading(true);
    try {
        const response = await BackupApi.getInstance().restoreBackup(file);
        if (response.data) {
            toast.success("System restored successfully!");
            // Optional: Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1500);
        } else {
            toast.error(response.error as string);
        }
    } catch (error) {
        toast.error("Failed to restore backup");
    } finally {
        setUploading(false);
        e.target.value = ''; // Reset input
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
   

      <div className="p-8 max-w-3xl">
        <div className="flex flex-col gap-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 flex items-start justify-between">
                <div>
                     <h4 className="font-semibold text-gray-800 mb-2">Export Data</h4>
                     <p className="text-sm text-gray-600 mb-4">
                        Download a complete JSON dump of your database including users, profiles, hives, investments, production records, and all financials.
                        Keep this file safe as it contains sensitive information.
                     </p>
                     <div className="text-xs text-gray-400">
                        Includes: User Accounts, Profiles, Hives, Investments, Payouts, Revenue, and Tree Planting.
                     </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`flex-shrink-0 flex items-center gap-2 bg-oha_primary text-white text-sm font-medium px-5 py-2 rounded-full cursor-pointer shadow-sm transition-all ${
                        downloading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-90 active:scale-95"
                    }`}
                >
                    <Download size={18} />
                    {downloading ? "Exporting..." : "Download Backup"}
                </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-red-50 flex items-start justify-between">
                <div>
                     <h4 className="font-semibold text-gray-800 mb-2">Import Data</h4>
                     <p className="text-sm text-gray-600 mb-4">
                        Restore your system state from a backup file.
                         <strong className="block mt-1 text-red-600">Warning: This will attempt to merge records. Existing IDs might be updated.</strong>
                     </p>
                     <div>
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={handleRestore}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                        />
                     </div>
                     {uploading && <p className="text-xs text-blue-600 mt-2">Restoring data... Please wait.</p>}
                </div>
                
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                    <Database size={24} />
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BackupRecovery;
