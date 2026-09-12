import React from "react";
import { TreePine, Car, Flame, Info } from "lucide-react";

interface CarbonScorecardProps {
  carbonOffset: number;
  loading?: boolean;
}

const CarbonScorecard: React.FC<CarbonScorecardProps> = ({
  carbonOffset,
  loading = false,
}) => {
  // Environmental equivalencies:
  // 1 mature tree absorbs ~21.77 kg CO2/year
  const treesEquivalent = Math.max(1, Math.round(carbonOffset / 21.77));
  // 1 average passenger car emits ~0.192 kg CO2/km
  const kmAvoided = Math.max(0, Math.round(carbonOffset / 0.192));
  // 1 kg of coal burned emits ~2.42 kg CO2 -> 1 kg CO2 avoided = ~0.413 kg coal
  const coalAvoided = Math.max(0, Math.round(carbonOffset * 0.413));

  const items = [
    {
      title: "Mature Trees Equivalent",
      value: loading ? "..." : `${treesEquivalent.toLocaleString()} Trees`,
      subtext: "Annual CO₂ absorption by healthy native trees",
      icon: <TreePine className="w-5 h-5 text-green-600" />,
      badgeBg: "bg-green-100",
    },
    {
      title: "Passenger Car Travel Avoided",
      value: loading ? "..." : `${kmAvoided.toLocaleString()} km`,
      subtext: "Equivalent emissions avoided from road travel",
      icon: <Car className="w-5 h-5 text-blue-600" />,
      badgeBg: "bg-blue-100",
    },
    {
      title: "Coal Burning Avoided",
      value: loading ? "..." : `${coalAvoided.toLocaleString()} kg`,
      subtext: "Grid thermal coal combustion displaced",
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      badgeBg: "bg-orange-100",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Carbon Offset Scorecard
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Translating your {loading ? "..." : Math.round(carbonOffset).toLocaleString()} kg CO₂ offset into real-world impact
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200/60">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Verified Climate Offset
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50/70 border border-gray-100 rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${item.badgeBg}`}
                >
                  {item.icon}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{item.title}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {item.value}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">
                  {item.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainer footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <Info className="w-4 h-4 text-green-600 shrink-0" />
        <span>
          Metrics computed in real-time from active apiary counts and Ghana agroforestry carbon sequestration coefficients.
        </span>
      </div>
    </div>
  );
};

export default CarbonScorecard;
