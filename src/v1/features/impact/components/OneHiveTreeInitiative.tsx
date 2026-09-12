import React from "react";
import { abso, drytree } from "@/assets";
import { Trees, CheckCircle2 } from "lucide-react";

interface OneHiveTreeInitiativeProps {
  totalHives: number;
  loading?: boolean;
}

const OneHiveTreeInitiative: React.FC<OneHiveTreeInitiativeProps> = ({
  totalHives,
  loading = false,
}) => {
  // 1 hive = 1 indigenous tree planted
  const treesPlanted = totalHives;
  // Community milestone target
  const milestoneTarget = Math.max(50, Math.ceil((totalHives + 1) / 50) * 50);
  const progressPercent = Math.min(
    100,
    Math.round((treesPlanted / milestoneTarget) * 100)
  );

  return (
    <div
      className="bg-white rounded-lg p-6 bg-cover bg-no-repeat bg-center shadow-sm border border-gray-100/80"
      style={{ backgroundImage: `url(${abso})` }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <img src={drytree} alt="tree" className="w-5 h-5 text-green-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200/60">
              1-Hive · 1-Tree Initiative
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            Reforesting Ghana with Every Funded Hive
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mt-1">
            For each hive you own, OneHive finances the planting and care of a native flowering tree in Ghanaian rural apiaries — rebuilding natural ecosystems and securing bee forage corridors.
          </p>
        </div>

        {/* Big Counter badge */}
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs border border-green-200/80 rounded-xl p-4 shrink-0 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Trees className="w-6 h-6 text-[#1b9d3c]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {loading ? "..." : treesPlanted}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Trees Sponsored by You
            </p>
          </div>
        </div>
      </div>

      {/* Progress towards next portfolio milestone */}
      <div className="bg-white/80 backdrop-blur-xs rounded-lg p-4 border border-gray-100 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
          <span>Portfolio Agroforestry Milestone</span>
          <span className="text-green-700">
            {loading ? "..." : `${treesPlanted} / ${milestoneTarget} Trees (${progressPercent}%)`}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#1b9d3c] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 3 Pillars of Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-xs rounded-lg p-3.5 border border-gray-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Indigenous Species</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Mahogany, Shea, Baobab, and Acacia varieties chosen to thrive in local Ghanaian soil.
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs rounded-lg p-3.5 border border-gray-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Year-Round Pollination</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Continuous nectar and pollen source for bee colonies throughout seasonal dry cycles.
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs rounded-lg p-3.5 border border-gray-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Community Farmer Care</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Local beekeepers maintain and protect each tree, ensuring high sapling survival rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneHiveTreeInitiative;
