import React from "react";

interface FinanceKPICardsProps {
  data: {
    net_profit: string;
    profit_margin: string;
    active_investment_value: string;
    investment_growth_rate: string;
  };
}

const FinanceKPICards: React.FC<FinanceKPICardsProps> = ({ data }) => {
  // Safe parsing with fallback to 0
  const netProfit = parseFloat(data.net_profit || "0") || 0;
  const profitMargin = parseFloat(data.profit_margin || "0") || 0;
  const activeInvestment = parseFloat(data.active_investment_value || "0") || 0;
  const growthRate = parseFloat(data.investment_growth_rate || "0") || 0;

  const formatCurrency = (value: number) => {
    return `GH₵ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const kpiCards = [
    {
      id: 1,
      label: "Net Profit",
      value: formatCurrency(netProfit),
      color: netProfit >= 0 ? "bg-green-500" : "bg-red-500",
      textColor: "text-gray-900",
    },
    {
      id: 2,
      label: "Profit Margin",
      value: `${profitMargin.toFixed(2)}%`,
      color: profitMargin >= 30 ? "bg-emerald-500" : profitMargin >= 15 ? "bg-yellow-500" : "bg-orange-500",
      textColor: "text-gray-900",
    },
    {
      id: 3,
      label: "Active Investment Value",
      value: formatCurrency(activeInvestment),
      color: "bg-blue-500",
      textColor: "text-gray-900",
    },
    {
      id: 4,
      label: "Investment Growth",
      value: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(2)}%`,
      color: growthRate >= 0 ? "bg-purple-500" : "bg-red-500",
      textColor: "text-gray-900",
      subtext: "vs previous month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map(({ label, value, color, textColor, subtext }) => (
        <div
          key={label}
          className="flex space-x-4"
        >
          <span
            className={`w-2 h-2 rounded-full ${color}`}
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {label}
            </dt>
            <dd className={`text-xl font-semibold ${textColor}`}>
              {value}
            </dd>
            {subtext && (
              <span className="text-xs text-gray-400 mt-1 block">{subtext}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinanceKPICards;
