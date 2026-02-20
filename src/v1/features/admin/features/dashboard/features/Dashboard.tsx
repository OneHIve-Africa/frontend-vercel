import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardApi, { DashboardStats } from "../api/DashboardApi";
import { LoadingAnimation } from "@/v1/components";
import { toast } from "react-hot-toast";
import { Users, Droplet, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface CardItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const api = DashboardApi.getInstance();
      const response = await api.getStats();
      if (response.data) {
        setStats(response.data);
      } else {
        toast.error("Failed to load dashboard statistics");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-gray-500">Failed to load data.</p>
        <button
          onClick={fetchStats}
          className="px-5 py-2 rounded-full bg-oha_primary text-white text-sm font-medium hover:bg-opacity-90 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Summary Cards Data
  const summaryCards: CardItem[] = [
    {
      label: "Total Revenue",
      value: `GHS ${stats.financials.total_revenue.toLocaleString()}`,
      icon: <TrendingUp className="text-green-600 w-5 h-5" />,
      subValue: `Yearly: GHS ${stats.financials.yearly_revenue.toLocaleString()}`
    },
    {
      label: "Honey Production",
      value: `${stats.production.total_honey_liters} L`,
      icon: <Droplet className="text-amber-500 w-5 h-5" />,
      subValue: `Avg Yield: ${stats.production.avg_yield_per_hive} L/hive`
    },
    {
      label: "Total Farmers",
      value: stats.users.farmers,
      icon: <Users className="text-blue-600 w-5 h-5" />
    },
    {
      label: "Total Investments",
      value: `GH₵ ${stats.impact.total_investments.toLocaleString()}`,
      icon: <CheckCircle className="text-emerald-600 w-5 h-5" />,
    }
  ];

  return (
    <div className=" min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div></div>

          <motion.button
            onClick={fetchStats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-full shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            Refresh
          </motion.button>
        </div>

        {/* 1. Key Metrics Cards */}
        <div className="bg-white overflow-hidden rounded-md p-6 mb-8 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, i) => (
              <motion.div
                key={card.label}
                className="flex space-x-4"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                  <motion.span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ 
                        backgroundColor: 
                            card.label.includes("Revenue") ? "#10B981" : 
                            card.label.includes("Production") ? "#F59E0B" :
                            card.label.includes("Farmers") ? "#3B82F6" : 
                            card.label.includes("Trees") ? "#10B981" : "#9CA3AF"
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{card.label}</dt>
                    <motion.dd
                      className="text-xl font-bold text-gray-900"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {card.value}
                    </motion.dd>
                    {card.subValue && (
                        <p className="text-xs text-gray-400 mt-1 font-medium">{card.subValue}</p>
                    )}
                  </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend Area Chart */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts?.monthly_revenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    cursor={{ stroke: "#10B981", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Hive Distribution Pie Chart */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Hive Status</h3>
            <div className="h-72 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.charts?.hive_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.charts?.hive_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                 <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{stats.hives.total}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Hives</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3. Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Production Bar Chart */}
           <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
             <h3 className="text-lg font-semibold text-gray-800 mb-6">Production Volume</h3>
             <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts?.monthly_production} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={{ borderRadius: "8px", border: "none" }} />
                    <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
             </div>
          </motion.div>
          
           {/* Alerts & Actions (Placeholder for future or list view) */}
           <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
           >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attention Needed</h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                      <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Hives Needing Maintenance</span>
                      </div>
                      <span className="font-bold">{stats.hives.maintenance_needed}</span>
                  </div>
                   <div className="flex items-center justify-between p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Pending Payouts</span>
                      </div>
                      <span className="font-bold">GHS {stats.financials.pending_payouts_requests.toLocaleString()}</span>
                  </div>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
