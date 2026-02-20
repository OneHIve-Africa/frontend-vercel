import { drytree, hive, jar } from "@/assets";
import { Investment } from "@/v1/api/types";

interface ImpactStatsProps {
  investments: Investment[];
  honeyProducedTons?: number;
  loading?: boolean;
}
const ImpactStatsSecond: React.FC<ImpactStatsProps> = ({ 
  investments, 
  honeyProducedTons = 0,
  loading = false 
}) => {
  const totalHives =
    investments?.reduce((acc, inv) => acc + inv.number_of_hives, 0) || 0;

  const stats = [
    {
      icon: <img src={hive} className="text-gray-400 w-6 h-6" />,
      label: "Hives in Production",
      value: loading ? "..." : totalHives,
      color: "bg-gray-100",
    },
    {
      icon: <img src={jar} className="text-gray-600 w-6 h-6" />,
      label: "Total Honey Produced",
      value: loading ? "..." : `${honeyProducedTons.toFixed(2)} tons`,
      color: "bg-gray-500",
    },
    {
      icon: <img src={drytree} className="text-green-500 w-6 h-6 " />,
      label: "Trees Planted",
      value: loading ? "..." : totalHives, //due to the initiative of one hive - one tree ,
      color: "bg-green-100",
    },
  ];
  return (
    <div className="bg-gray-100 h-full">
      <div>
        <div className="bg-white rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full lg:gap-0 lg:grid-cols-none lg:flex lg:items-stretch lg:justify-between lg:divide-x lg:divide-gray-300">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 lg:px-6 flex items-start justify-start  lg:flex-1"
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

export default ImpactStatsSecond;
