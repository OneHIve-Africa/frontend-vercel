import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoneyProductionForm from "../components/HoneyProductionForm";
import HoneySalesForm from "../components/HoneySalesForm";

import ProductionAnalytics from "../components/ProductionAnalytics";
import ProductionApi from "../api/ProductionApi";

interface CardItem {
  label: string;
  value: string | number;
  color: string;
}

interface TabItem {
  name: string;
  id: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
};
const Records: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<number>(0);
  const [metrics, setMetrics] = useState({
    total_honey_produced: 0,
    total_hives_managed: 0,
    harvested_hives: 0,
    average_liters_per_hive: 0,
    active_production_regions: 0
  });

  const fetchMetrics = async () => {
    try {
      const response = await ProductionApi.getInstance().getMetrics();
      if (response.data) {
        setMetrics(response.data);
      }
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  const cardData: CardItem[] = [
    {
      label: "Total Honey Produced (L)",
      value: metrics.total_honey_produced.toLocaleString(),
      color: "bg-oha_secondary",
    },
    {
      label: "Total Hives Inventory",
      value: metrics.total_hives_managed.toLocaleString(),
      color: "bg-oha_primary",
    },
    {
      label: "Harvested Hives",
      value: metrics.harvested_hives.toLocaleString(),
      color: "bg-orange-600",
    },
    // {
    //   label: "Avg Yield per Hive (L)",
    //   value: metrics.average_liters_per_hive.toFixed(1),
    //   color: "bg-yellow-500",
    // },
    {
      label: "Active Production Regions",
      value: metrics.active_production_regions,
      color: "bg-green-500",
    },
  ];

  const tabData: TabItem[] = [
    { name: "Honey Production Entry", id: 0 },
    { name: "Record Honey Sale", id: 1 },
    { name: "Production Analytics & Trends", id: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Card Summary Section */}
      <motion.div
        className="bg-white overflow-hidden rounded-md p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              className="flex space-x-4"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <motion.span
                className={`w-2 h-2 rounded-full ${color}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
              <div>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <motion.dd
                  className="text-xl font-semibold text-gray-900"
                  custom={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 + 0.2, duration: 0.5 }}
                >
                  {value}
                </motion.dd>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs Section */}
      <motion.div
        className="w-full bg-white rounded-[10px]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Tab Menu */}
        <div className="flex">
          {tabData.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              className={`cursor-pointer px-8 py-6 transition-all duration-300 ${
                activeMenu === item.id
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
        <div className="border-t-[0.2px] border-[rgba(0,0,0,0.07)] p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeMenu == 0 && (
                <>
                  <HoneyProductionForm onSuccess={fetchMetrics} />
                </>
              )}
              {activeMenu == 1 && (
                <>
                  <HoneySalesForm />
                </>
              )}
              {activeMenu == 2 && (
                <>
                  <ProductionAnalytics />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
export default Records;
