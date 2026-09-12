import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { DashboardStats } from "@/v1/api/InvestorDashboardApi";
import { dateUtils } from "@/v1/utils/dateutils";
import { Activity, Clock, CheckCircle2 } from "lucide-react";

interface PortfolioVisualStatsProps {
  stats: DashboardStats;
}

const HIVE_COLORS: Record<string, string> = {
  ktbh: "#f09443",      // Honey amber
  langstroth: "#1b9d3c",// Green
  saltpond: "#3b82f6",  // Blue
};

export const PortfolioVisualStats: React.FC<PortfolioVisualStatsProps> = ({ stats }) => {
  const hivePieData = React.useMemo(() => {
    if (!stats.hive_breakdown) return [];
    return [
      { name: "Kenya Top Bar (KTBH)", value: stats.hive_breakdown.ktbh || 0, color: HIVE_COLORS.ktbh },
      { name: "Langstroth Hive", value: stats.hive_breakdown.langstroth || 0, color: HIVE_COLORS.langstroth },
    ].filter((item) => item.value > 0);
  }, [stats.hive_breakdown]);

  const timelineData = React.useMemo(() => {
    if (!stats.investment_timeline || stats.investment_timeline.length === 0) {
      return [];
    }
    return stats.investment_timeline.map((item) => ({
      name: item.month,
      amount: parseFloat(item.amount) || 0,
      hives: item.hives || 0,
    }));
  }, [stats.investment_timeline]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
      {/* 1. Hive Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-1">Hive Distribution</h3>
        <p className="text-xs text-gray-500 mb-4">Breakdown of hive systems in your portfolio</p>

        {hivePieData.length > 0 ? (
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hivePieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hivePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} hives`, "Quantity"]}
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="text-xl font-bold text-gray-900 block">{stats.total_hives}</span>
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Hives</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4">
            <Activity className="w-8 h-8 text-gray-300 mb-2" />
            <span>Hive breakdown will populate as hives are allocated to your apiaries.</span>
          </div>
        )}
      </div>

      {/* 2. Capital Timeline Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Investment Activity</h3>
            <p className="text-xs text-gray-500">Capital deployed over recent months</p>
          </div>
          {stats.average_roi && (
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Avg. Portfolio ROI</span>
              <span className="text-sm font-bold text-oha_secondary">
                {parseFloat(stats.average_roi).toFixed(1)}% APR
              </span>
            </div>
          )}
        </div>

        {timelineData.some((t) => t.amount > 0) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b9d3c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1b9d3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(val: any) => [`GHS ${Number(val).toLocaleString()}`, "Investment"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#1b9d3c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInvest)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4">
            <Clock className="w-8 h-8 text-gray-300 mb-2" />
            <span>Monthly investment trends will appear here as your portfolio expands.</span>
          </div>
        )}
      </div>

      {/* 3. Recent Activity Log (Full width on bottom if activities exist) */}
      {stats.recent_activities && stats.recent_activities.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3">
          <h3 className="text-base font-bold text-gray-900 mb-4">Recent Portfolio Milestones</h3>
          <div className="space-y-3">
            {stats.recent_activities.slice(0, 5).map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    act.type === "investment" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">{act.description}</h4>
                    <span className="text-[11px] text-gray-400">{dateUtils.formatDate(act.date)}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-900">
                  GHS {parseFloat(act.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioVisualStats;
