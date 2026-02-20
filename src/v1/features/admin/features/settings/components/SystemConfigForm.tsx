import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import SystemApi, { SystemConfig } from "@/v1/api/SystemApi";
import { toast } from "react-hot-toast";

const SystemConfigForm: React.FC = () => {
  const [config, setConfig] = useState<Partial<SystemConfig>>({
    honey_price_per_liter: 0,
    currency: "GHS",
    discount_type: "percentage",
    carbon_offset_per_tree: 25.0,
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
      toast.error("Failed to load system configuration");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]:
        name === "honey_price_per_liter" || name === "carbon_offset_per_tree"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await SystemApi.getInstance().updateConfig(config);
      if (response.data) {
        toast.success("System configuration updated!");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Honey Price per Liter
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                name="honey_price_per_liter"
                value={config.honey_price_per_liter}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary"
                placeholder="50.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                {config.currency}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={config.currency}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white"
            >
              <option value="GHS">GHS (Ghana Cedi)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Default Discount Type
            </label>
            <select
              name="discount_type"
              value={config.discount_type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

           <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Carbon Offset Factor (kg CO₂ / tree)
            </label>
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    name="carbon_offset_per_tree"
                    value={config.carbon_offset_per_tree}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary"
                    placeholder="25.00"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used to calculate total carbon impact.</p>
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
            {loading ? "Saving..." : "Save Configuration"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SystemConfigForm;
