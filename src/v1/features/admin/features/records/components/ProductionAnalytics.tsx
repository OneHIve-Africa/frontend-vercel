import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { motion } from "framer-motion";
import ProductionApi from "../api/ProductionApi";
import { Loader2, Map, PieChart as PieIcon } from "lucide-react";
import ProductionHeatmap from "./ProductionHeatmap";

// ... (existing imports)

interface AnalyticsData {
  monthly_trend: Array<{ month: string, liters: number }>;
  regional_distribution: Array<{ region: string, liters: number }>;
  hive_type_performance: Array<{ type: string, liters: number, average: number }>;
}

const COLORS = [
  '#FFC107', // Amber 500 (Golden Honey)
  '#E65100', // Orange 900 (Burnt Orange)
  '#FF9800', // Orange 500 (Vibrant Orange)
  '#BCAAA4', // Brownish (Propolis/Wax)
  '#F57C00', // Orange 700 (Deep Orange)
  '#795548', // Brown 500 (Wood/Earth)
];

const ProductionAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ProductionApi.getInstance().getAnalytics();
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-oha_primary" size={32} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">


      {/* Monthly Trend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Trend (Monthly)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E59035" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#E59035" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area type="monotone" dataKey="liters" stroke="#E59035" fillOpacity={1} fill="url(#colorLiters)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regional Distribution / Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {showHeatmap ? "Regional Heatmap" : "Production by Region"}
            </h3>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700 font-medium cursor-pointer"
            >
              {showHeatmap ? (
                <>
                  <PieIcon size={16} /> Show Chart
                </>
              ) : (
                <>
                  <Map size={16} /> Show Map
                </>
              )}
            </button>
          </div>
          
          <div className="h-96 w-full flex-grow">
            {showHeatmap ? (
              <ProductionHeatmap data={data.regional_distribution} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.regional_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="liters"
                    nameKey="region"
                  >
                    {data.regional_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Hive Type Performance ... (remains unchanged) */}


        {/* Hive Type Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield by Hive Type</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hive_type_performance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="liters" name="Total Liters" fill="#E59035" radius={[0, 4, 4, 0]} />
                <Bar dataKey="average" name="Avg per Hive" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductionAnalytics;
