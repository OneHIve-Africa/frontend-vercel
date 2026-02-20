import React from "react";
import CarbonCard from "../components/CarbonCard";
import Form from "../components/Form";
import { motion } from "framer-motion";
import ImpactApi from "../api/ImpactApi";

const Impact: React.FC = () => {
  const [metrics, setMetrics] = React.useState({
    total_trees_planted: 0,
    total_carbon_offset_kg: 0,
    contributing_hives: 0
  });

  const fetchMetrics = async () => {
    try {
        const response = await ImpactApi.getInstance().getMetrics();
        if (response.data) {
            setMetrics(response.data);
        }
    } catch (error) {
        console.error("Failed to fetch impact metrics", error);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  const cardData = [
    {
      title: "Estimated Total Carbon Offset",
      value: `${metrics.total_carbon_offset_kg.toLocaleString()} kg CO₂`,
      isPrimary: true,
    },
    {
      title: "Total Trees Planted",
      value: metrics.total_trees_planted.toLocaleString(),
      isPrimary: false,
    },
    {
      title: "Active Hives Contributing",
      value: metrics.contributing_hives.toLocaleString(),
      isPrimary: false,
    },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-oha_primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tree Planting Program
        </motion.h1>
        <motion.h2
          className="text-2xl font-semibold text-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Carbon Offset Metrics
        </motion.h2>
      </header>
      <div className="my-8">
        <div className="grid grid-cols-3 gap-8">
            {cardData?.map((item, index)=> (
                <CarbonCard
                  title={item.title}
                  value={item.value}
                  isPrimary={item.isPrimary}
                  delay={0.2}
                  key={index}
                />
            ))}
        </div>
      </div>

      <section>
        <Form onSuccess={fetchMetrics} />
      </section>
    </div>
  );
};

export default Impact;
