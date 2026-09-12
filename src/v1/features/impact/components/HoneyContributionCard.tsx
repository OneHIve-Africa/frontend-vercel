import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface HoneyContributionCardProps {
  investorHoneyTons: number;
  totalHoneyTons: number;
  loading?: boolean;
}

const HoneyContributionCard: React.FC<HoneyContributionCardProps> = ({
  investorHoneyTons,
  totalHoneyTons,
  loading = false,
}) => {
  const investorTons = Math.max(0, investorHoneyTons);
  const totalTons = Math.max(investorTons, totalHoneyTons);
  const otherTons = Math.max(0, totalTons - investorTons);

  // Compute share percentage
  const sharePercentage =
    totalTons > 0 ? ((investorTons / totalTons) * 100).toFixed(1) : "0.0";

  const chartData = [
    { name: "Your Apiary Yield", value: investorTons > 0 ? investorTons : 0.05, color: "#1b9d3c" },
    { name: "Collective Network Harvest", value: otherTons > 0 ? otherTons : 0.95, color: "#e5e7eb" },
  ];

  return (
    <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Honey Yield Share
          </h2>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
            {loading ? "..." : `${sharePercentage}% Share`}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Your personal apiary output vs collective harvest
        </p>

        {/* Donut Chart with center stat */}
        <div className="relative h-44 w-full my-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: any) => [
                  `${typeof val === "number" ? val.toFixed(2) : val} tons`,
                  "",
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered label inside donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-900">
              {loading ? "..." : `${investorTons.toFixed(2)}t`}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">Your Harvest</span>
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b9d3c]"></span>
            <span className="text-gray-600 font-medium">Your Harvested Honey</span>
          </div>
          <span className="font-semibold text-gray-900">
            {loading ? "..." : `${investorTons.toFixed(2)} tons`}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e5e7eb]"></span>
            <span className="text-gray-500">Collective Network Total</span>
          </div>
          <span className="font-semibold text-gray-700">
            {loading ? "..." : `${totalTons.toFixed(2)} tons`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoneyContributionCard;
