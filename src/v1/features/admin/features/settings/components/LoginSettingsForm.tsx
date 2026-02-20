import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import SystemApi, { SystemConfig } from "@/v1/api/SystemApi";
import { toast } from "react-hot-toast";

const LoginSettingsForm: React.FC = () => {
  const [config, setConfig] = useState<Partial<SystemConfig>>({
    require_2fa: false,
    password_expiry_days: 90,
    session_timeout_minutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setFetching(true);
      const response = await SystemApi.getInstance().getConfig();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await SystemApi.getInstance().updateConfig(config);
      if (response.data) {
        toast.success("Security settings updated!");
        setConfig(response.data);
      } else {
        toast.error(response.error as string);
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <motion.div
      className="bg-white rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >

      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 gap-6 max-w-3xl">
        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                    <h4 className="font-medium text-gray-800">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-gray-500">Require all administrators to use 2FA.</p>
                </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="require_2fa"
                        checked={config.require_2fa || false} 
                        onChange={handleChange}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-oha_primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oha_primary"></div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (Days)
                    </label>
                    <input
                        type="number"
                        name="password_expiry_days"
                        value={config.password_expiry_days}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Force password change every X days.</p>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (Minutes)
                    </label>
                    <input
                        type="number"
                        name="session_timeout_minutes"
                        value={config.session_timeout_minutes}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary"
                    />
                     <p className="text-xs text-gray-500 mt-1">Auto-logout inactive users after X mins.</p>
                </div>
            </div>
        </div>

        <div className="flex justify-end mt-4">
          <motion.button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 bg-oha_primary text-white text-sm font-medium px-5 py-2 rounded-full shadow-md transition-colors cursor-pointer ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-90"
            }`}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Security Settings"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginSettingsForm;
