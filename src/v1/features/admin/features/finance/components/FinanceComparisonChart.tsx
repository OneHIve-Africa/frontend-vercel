import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface MonthlyData {
  monthly_revenue_trend: {
    [month: string]: string;
  };
  monthly_total_payouts: {
    [month: string]: string;
  };
}

interface FinanceComparisonChartProps {
  data: MonthlyData;
}

const FinanceComparisonChart: React.FC<FinanceComparisonChartProps> = ({ data }) => {
  const monthlyRevenue = data.monthly_revenue_trend;
  const monthlyPayouts = data.monthly_total_payouts || {};

  // Transform data for recharts - handle missing data
  const chartData = Object.keys(monthlyRevenue).map((month) => ({
    month: month.slice(0, 3), // Short month name
    revenue: parseFloat(monthlyRevenue[month] || "0"),
    payouts: parseFloat(monthlyPayouts[month] || "0"),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <p className="text-amber-600 font-medium flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded"></span>
              Revenue: GH₵ {payload[0].value.toLocaleString()}
            </p>
            <p className="text-emerald-600 font-medium flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              Payouts: GH₵ {payload[1].value.toLocaleString()}
            </p>
            <p className="text-gray-700 font-semibold mt-2 pt-2 border-t">
              Net: GH₵ {(payload[0].value - payload[1].value).toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₵${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
          />
          <Bar
            dataKey="revenue"
            fill="#F59E0B"
            name="Revenue"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="payouts"
            fill="#10B981"
            name="Total Payouts"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceComparisonChart;
