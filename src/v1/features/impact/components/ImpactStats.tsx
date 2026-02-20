import { Recycle, Home } from "lucide-react";
import { investmentdeal } from "@/assets";
import { Investment } from "@/v1/api/types";

interface StatItem {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  iconColor?: string;
}

interface ImpactStatsProps {
  investments?: Investment[];
  stats?: StatItem[];
}

const ImpactStats: React.FC<ImpactStatsProps> = ({ investments, stats: passedStats }) => {
  const totalInvestments =
    investments?.reduce((acc, inv) => acc + parseFloat(inv.amount), 0) || 0;

  const farmersImpacted = investments?.length || 0;

  const defaultStats = [
    {
      icon: <img src={investmentdeal} className="text-green-500 w-6 h-6" />,
      label: "Total Investments",
      value: totalInvestments,
      color: "bg-green-100",
    },
    {
      icon: <Recycle className="text-gray-400 w-6 h-6" />,
      label: "Farmers Impacted",
      value: farmersImpacted,
      color: "bg-orange-100",
    },
    {
      icon: <Home className="text-gray-400 w-6 h-6" />,
      label: "Households Impacted",
      value: farmersImpacted, // one investment = one beekeeper = one household
      color: "bg-orange-100",
    },
  ];

  const displayStats = passedStats || defaultStats;

  return (
    <div className="bg-gray-100 h-full">
      <div>
        <div className="bg-white rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full lg:gap-0 lg:grid-cols-none lg:flex lg:items-stretch lg:justify-between lg:divide-x lg:divide-gray-300">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 lg:px-6 flex items-start justify-start lg:flex-1"
            >
              <div className="flex flex-col items-start gap-5 text-start">
                <div
                  className={`w-12 h-12 flex items-center justify-center ${stat.color} rounded-full`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactStats;
