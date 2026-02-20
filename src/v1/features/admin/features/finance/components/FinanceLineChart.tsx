import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface MonthlyRevenueData {
  monthly_revenue_trend: {
    [month: string]: string; // e.g. "January": "100.00"
  };
}

interface FinanceLineChartProps {
  data: MonthlyRevenueData;
}

const FinanceLineChart: React.FC<FinanceLineChartProps> = ({ data }) => {
  const monthlyRevenue = data.monthly_revenue_trend;

  // Transform data for recharts
  const chartData = Object.entries(monthlyRevenue).map(([month, value]) => ({
    month: month.slice(0, 3), // Short month name
    revenue: parseFloat(value),
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.month}</p>
          <p className="text-amber-600 font-medium">
            GH₵ {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#F59E0B"
            strokeWidth={3}
            dot={{ fill: "#F59E0B", r: 5 }}
            activeDot={{ r: 7 }}
            name="Monthly Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceLineChart;
