import { hive } from "@/assets";
import { Recycle } from "lucide-react";

interface CarbonOffsetAndHivesProps {
  carbonOffset: number;
  regions: number;
  loading?: boolean;
}

const CarbonOffsetAndHives: React.FC<CarbonOffsetAndHivesProps> = ({ 
  carbonOffset, 
  regions,
  loading = false 
}) => {
  const stats = [
    {
      icon: <Recycle className="text-gray-400 w-6 h-6" />,
      label: "Total Carbon Offset",
      value: loading ? "..." : `${Math.round(carbonOffset).toLocaleString()} kg`,
      color: "bg-gray-100",
    },
    {
      icon: <img src={hive} className="text-gray-300 w-6 h-6" />,
      label: "Regions Where Hives Are Located",
      value: loading ? "..." : regions.toString(),
      color: "bg-green-100",
    },
  ];

  return (
    <div className="bg-gray-100 h-full">
      <div>
        <div className="bg-white rounded-lg p-6 grid grid-cols-1 gap-6 w-full h-full lg:gap-0 lg:grid-cols-none lg:flex lg:items-stretch lg:justify-between lg:divide-x lg:divide-gray-300">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white px-0 lg:px-6 py-0 lg:py-0 flex items-start justify-start lg:flex-1"
            >
              <div className="flex flex-col items-start gap-5 text-start">
                <div
                  className={`w-12 h-12 flex items-center justify-center ${stat.color} rounded-full`}
                >
                  {stat.icon}
                </div>
                <div className="w-40">
                  <p className="text-gray-500 text-sm ">{stat.label}</p>
                  <p className="text-lg font-semibold ">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarbonOffsetAndHives;
